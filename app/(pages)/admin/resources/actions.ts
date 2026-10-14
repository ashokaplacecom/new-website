'use server';

import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { ResourceNode } from '@/lib/resources';
import { uploadFile } from '@/lib/supabase/storage/upload';
import { createClient } from '@/lib/supabase/server';

const TREE_JSON_PATH = path.join(process.cwd(), 'content', 'data', 'resources-tree.json');

function loadTree(): ResourceNode[] {
  try {
    if (fs.existsSync(TREE_JSON_PATH)) {
      const data = fs.readFileSync(TREE_JSON_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[loadTree] Error reading tree JSON:', err);
  }
  return [];
}

function saveTree(tree: ResourceNode[]) {
  try {
    fs.writeFileSync(TREE_JSON_PATH, JSON.stringify(tree, null, 2), 'utf-8');
  } catch (err) {
    console.error('[saveTree] Error saving tree JSON:', err);
  }
}

function addNodeToFolder(tree: ResourceNode[], targetFolderPath: string, nodeToAdd: ResourceNode): boolean {
  if (!targetFolderPath) {
    tree.push(nodeToAdd);
    return true;
  }

  for (const node of tree) {
    if (node.type === 'folder') {
      if (node.path === targetFolderPath) {
        if (!node.children) node.children = [];
        node.children.push(nodeToAdd);
        return true;
      }
      if (node.children && addNodeToFolder(node.children, targetFolderPath, nodeToAdd)) {
        return true;
      }
    }
  }
  return false;
}

function removeNodeFromTree(tree: ResourceNode[], targetPath: string): boolean {
  const idx = tree.findIndex(n => n.path === targetPath);
  if (idx !== -1) {
    tree.splice(idx, 1);
    return true;
  }

  for (const node of tree) {
    if (node.type === 'folder' && node.children) {
      if (removeNodeFromTree(node.children, targetPath)) {
        return true;
      }
    }
  }
  return false;
}

export async function uploadResourceFile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const folder = (formData.get('folder') as string) || '';
  const file = formData.get('file') as File | null;

  if (!file || file.size === 0) {
    return { success: false, error: 'Please select a valid file to upload.' };
  }

  try {
    const safeName = file.name.replace(/[^\w\s\.-]/gi, '_');
    const ext = safeName.split('.').pop()?.toLowerCase() || '';

    // Upload to Supabase Storage
    let publicUrl = '';
    try {
      const timestamp = Date.now();
      const storagePath = `masterdrive/${timestamp}-${safeName}`;
      const uploaded = await uploadFile({
        bucket: 'opportunity-jds',
        path: storagePath,
        file: file,
        contentType: file.type || undefined,
        admin: true,
      });

      const supabase = await createClient();
      const { data } = supabase.storage
        .from('opportunity-jds')
        .getPublicUrl(uploaded.path);

      publicUrl = data.publicUrl;
    } catch (uploadErr) {
      console.warn('[uploadResourceFile] Supabase upload failed, falling back:', uploadErr);
      // Fallback relative URL
      publicUrl = `/resources/${folder ? `${folder}/` : ''}${encodeURIComponent(safeName)}`;
    }

    const newNode: ResourceNode = {
      name: file.name,
      type: 'file',
      path: folder ? `${folder}/${file.name}` : file.name,
      publicUrl: publicUrl,
      ext: ext,
    };

    const tree = loadTree();
    addNodeToFolder(tree, folder, newNode);
    saveTree(tree);

    revalidatePath('/resources');
    revalidatePath('/admin/resources');
    return { success: true };
  } catch (err: any) {
    console.error('[uploadResourceFile] Error:', err);
    return { success: false, error: err?.message || 'Failed to upload file.' };
  }
}

export async function createResourceFolder(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const parentFolder = (formData.get('parentFolder') as string) || '';
  const folderName = (formData.get('folderName') as string) || '';

  if (!folderName.trim()) {
    return { success: false, error: 'Folder name cannot be empty.' };
  }

  try {
    const cleanName = folderName.trim().replace(/[^\w\s\.-]/gi, '_');
    const folderPath = parentFolder ? `${parentFolder}/${cleanName}` : cleanName;

    const newFolderNode: ResourceNode = {
      name: cleanName,
      type: 'folder',
      path: folderPath,
      publicUrl: `/resources/${folderPath.split('/').map(encodeURIComponent).join('/')}`,
      children: [],
    };

    const tree = loadTree();
    addNodeToFolder(tree, parentFolder, newFolderNode);
    saveTree(tree);

    revalidatePath('/resources');
    revalidatePath('/admin/resources');
    return { success: true };
  } catch (err: any) {
    console.error('[createResourceFolder] Error:', err);
    return { success: false, error: err?.message || 'Failed to create folder.' };
  }
}

export async function deleteResourceItem(itemPath: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  if (!itemPath) {
    return { success: false, error: 'Path is required.' };
  }

  try {
    const tree = loadTree();
    removeNodeFromTree(tree, itemPath);
    saveTree(tree);

    revalidatePath('/resources');
    revalidatePath('/admin/resources');
    return { success: true };
  } catch (err: any) {
    console.error('[deleteResourceItem] Error:', err);
    return { success: false, error: err?.message || 'Failed to delete item.' };
  }
}
