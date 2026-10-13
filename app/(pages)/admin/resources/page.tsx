import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getResourceTree, getAllFolderPaths } from '@/lib/resources';
import { AdminResourceManager } from './admin-resource-manager';

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  const session = await auth();

  // Strict RBAC: only authorized admin email IDs from prisma.admin table
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const tree = getResourceTree();
  const folderPaths = getAllFolderPaths(tree);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AdminResourceManager
        folderPaths={folderPaths}
        initialTree={tree}
        userEmail={session.user.email}
      />
    </main>
  );
}
