import { getResourceTree, findNodeByPath, getBreadcrumbs, ResourceNode } from '@/lib/resources';
import { ResourceExplorer } from '@/components/resource-explorer';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ path?: string[] }>;
}

export const dynamic = 'force-dynamic';

export default async function ResourcesPage({ params }: PageProps) {
  const { path: pathSegments } = await params;

  let currentNodes: ResourceNode[];
  let breadcrumbs: { name: string; href: string }[];
  let currentNode: ResourceNode | null = null;

  if (!pathSegments || pathSegments.length === 0) {
    // Root: show the two top-level folders
    currentNodes = getResourceTree();
    breadcrumbs = [{ name: 'Resources', href: '/resources' }];
  } else {
    currentNode = findNodeByPath(pathSegments);
    if (!currentNode) return notFound();
    
    if (currentNode.type === 'file') {
      // Redirect to file serving — handled below via publicUrl
      currentNodes = [];
      breadcrumbs = getBreadcrumbs(pathSegments);
    } else {
      currentNodes = currentNode.children ?? [];
      breadcrumbs = getBreadcrumbs(pathSegments);
    }
  }

  return (
    <ResourceExplorer
      nodes={currentNodes}
      breadcrumbs={breadcrumbs}
      currentNode={currentNode}
    />
  );
}
