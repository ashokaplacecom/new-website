import fs from 'fs';
import path from 'path';

export interface ResourceNode {
  name: string;
  type: 'folder' | 'file';
  path: string;      // URL-encoded path relative to /resources/
  publicUrl: string; // Full URL-encoded path for serving
  ext?: string;
  children?: ResourceNode[];
}

const RESOURCES_DIR = path.join(process.cwd(), 'public', 'resources');
const SKIP = new Set(['.DS_Store', '__MACOSX', 'Thumbs.db']);

function getExtension(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function buildTree(dirPath: string, urlPath: string): ResourceNode[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const nodes: ResourceNode[] = [];

  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;

    const childUrlPath = urlPath ? `${urlPath}/${entry.name}` : entry.name;
    const childFsPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        type: 'folder',
        path: childUrlPath,
        publicUrl: `/resources/${encodeURIPath(childUrlPath)}`,
        children: buildTree(childFsPath, childUrlPath),
      });
    } else if (entry.isFile()) {
      nodes.push({
        name: entry.name,
        type: 'file',
        path: childUrlPath,
        publicUrl: `/resources/${encodeURIPath(childUrlPath)}`,
        ext: getExtension(entry.name),
      });
    }
  }

  // Sort: folders first, then files, both alphabetically
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

function encodeURIPath(p: string): string {
  return p.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

export function getResourceTree(): ResourceNode[] {
  return buildTree(RESOURCES_DIR, '');
}

export function findNodeByPath(pathSegments: string[]): ResourceNode | null {
  const tree = getResourceTree();
  
  if (!pathSegments || pathSegments.length === 0) return null;
  
  let nodes = tree;
  let found: ResourceNode | null = null;
  
  for (const segment of pathSegments) {
    const decoded = decodeURIComponent(segment);
    found = nodes.find(n => n.name === decoded) ?? null;
    if (!found) return null;
    if (found.type === 'folder') {
      nodes = found.children ?? [];
    }
  }
  
  return found;
}

export function getBreadcrumbs(pathSegments: string[]): { name: string; href: string }[] {
  const crumbs: { name: string; href: string }[] = [
    { name: 'Resources', href: '/resources' },
  ];
  
  for (let i = 0; i < pathSegments.length; i++) {
    const decoded = decodeURIComponent(pathSegments[i]);
    const href = '/resources/' + pathSegments.slice(0, i + 1).join('/');
    crumbs.push({ name: decoded, href });
  }
  
  return crumbs;
}

export function getAllFolderPaths(nodes: ResourceNode[] = getResourceTree()): string[] {
  const paths: string[] = [];

  function traverse(list: ResourceNode[]) {
    for (const node of list) {
      if (node.type === 'folder') {
        paths.push(node.path);
        if (node.children) {
          traverse(node.children);
        }
      }
    }
  }

  traverse(nodes);
  return paths;
}
