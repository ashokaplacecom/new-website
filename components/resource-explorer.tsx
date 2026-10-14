'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder,
  FolderOpen,
  FileText,
  Film,
  Table2,
  Archive,
  File,
  ChevronRight,
  Download,
  Home,
  ArrowLeft,
  BookOpen,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResourceNode } from '@/lib/resources';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface ResourceExplorerProps {
  nodes: ResourceNode[];
  breadcrumbs: BreadcrumbItem[];
  currentNode: ResourceNode | null;
}

function getFileIcon(ext?: string) {
  switch (ext) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'mp4': case 'mov': case 'avi': return <Film className="w-5 h-5 text-purple-500" />;
    case 'xlsx': case 'xls': case 'csv': return <Table2 className="w-5 h-5 text-green-600" />;
    case 'zip': case 'rar': return <Archive className="w-5 h-5 text-yellow-600" />;
    case 'docx': case 'doc': return <BookOpen className="w-5 h-5 text-blue-500" />;
    default: return <File className="w-5 h-5 text-muted-foreground" />;
  }
}

function getFolderIcon(name: string, isOpen: boolean) {
  if (isOpen) return <FolderOpen className="w-5 h-5 text-primary" />;
  
  // Special color coding for top-level folders
  if (name.includes('Undergraduate')) return <Folder className="w-5 h-5 text-blue-500" />;
  if (name.includes('Postgraduate')) return <Folder className="w-5 h-5 text-emerald-500" />;
  return <Folder className="w-5 h-5 text-amber-500" />;
}

function FilePreviewModal({
  node,
  onClose,
}: {
  node: ResourceNode;
  onClose: () => void;
}) {
  const isPdf = node.ext === 'pdf';
  const isVideo = ['mp4', 'mov', 'avi'].includes(node.ext ?? '');
  const isPreviewable = isPdf || isVideo;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon(node.ext)}
            <span className="font-semibold text-foreground truncate">{node.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={node.publicUrl}
              download={node.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <a
              href={node.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-muted/30">
          {isPdf && (
            <iframe
              src={`${node.publicUrl}#toolbar=1&navpanes=1`}
              className="w-full h-full min-h-[70vh]"
              title={node.name}
            />
          )}
          {isVideo && (
            <div className="flex items-center justify-center h-full min-h-[60vh] p-6">
              <video
                src={node.publicUrl}
                controls
                className="max-w-full max-h-full rounded-xl shadow-lg"
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}
          {!isPreviewable && (
            <div className="flex flex-col items-center justify-center h-full min-h-[40vh] gap-4 text-muted-foreground">
              {getFileIcon(node.ext)}
              <p className="text-sm">Preview not available for this file type.</p>
              <a
                href={node.publicUrl}
                download={node.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download to view
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FileRow({ node, onClick }: { node: ResourceNode; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/60 transition-all cursor-pointer border border-transparent hover:border-border/50"
      onClick={onClick}
    >
      <div className="shrink-0">{getFileIcon(node.ext)}</div>
      <span className="flex-1 text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
        {node.name}
      </span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={node.publicUrl}
          download={node.name}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg hover:bg-background transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </a>
        <span className="text-xs uppercase text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
          {node.ext ?? 'file'}
        </span>
      </div>
    </motion.div>
  );
}

function FolderCard({ node }: { node: ResourceNode }) {
  const fileCount = countFiles(node);
  const folderCount = node.children?.filter(n => n.type === 'folder').length ?? 0;

  let metaText = '';
  if (folderCount > 0 && fileCount > 0) {
    metaText = `${folderCount} ${folderCount === 1 ? 'folder' : 'folders'} · ${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;
  } else if (folderCount > 0) {
    metaText = `${folderCount} ${folderCount === 1 ? 'folder' : 'folders'}`;
  } else if (fileCount > 0) {
    metaText = `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;
  } else {
    metaText = 'Folder';
  }

  return (
    <Link href={`/resources/${node.path.split('/').map(encodeURIComponent).join('/')}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="shrink-0 p-2.5 rounded-xl bg-muted group-hover:bg-background transition-colors">
          {getFolderIcon(node.name, false)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
            {node.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {metaText}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </motion.div>
    </Link>
  );
}

function countFiles(node: ResourceNode): number {
  if (node.type === 'file') return 1;
  return (node.children ?? []).reduce((sum, child) => sum + countFiles(child), 0);
}

export function ResourceExplorer({ nodes, breadcrumbs, currentNode }: ResourceExplorerProps) {
  const [previewNode, setPreviewNode] = useState<ResourceNode | null>(null);

  const folders = nodes.filter(n => n.type === 'folder');
  const files = nodes.filter(n => n.type === 'file');

  // If current node is a file, show its preview directly
  const isFilePage = currentNode?.type === 'file';

  const parentHref = breadcrumbs.length > 1
    ? breadcrumbs[breadcrumbs.length - 2].href
    : '/resources';

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
        {/* Hero / Header */}
        <div className="w-full bg-foreground text-background py-12">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-semibold tracking-widest uppercase mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                PlaceCom MasterDrive
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
                Resources
              </h1>
              <p className="text-base text-muted/80 max-w-xl">
                All PlaceCom resources in one place — from resume guides to case interview textbooks.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm mb-6 flex-wrap">
            <Link href="/resources" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            {breadcrumbs.slice(1).map((crumb, i) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                {i === breadcrumbs.length - 2 ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{crumb.name}</span>
                ) : (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[180px]">
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Back button if inside a folder */}
          {breadcrumbs.length > 1 && (
            <Link
              href={parentHref}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </Link>
          )}

          {isFilePage && currentNode ? (
            // Direct file view
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  {getFileIcon(currentNode.ext)}
                  <span className="font-semibold">{currentNode.name}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={currentNode.publicUrl}
                    download={currentNode.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              </div>
              {currentNode.ext === 'pdf' && (
                <iframe
                  src={currentNode.publicUrl}
                  className="w-full h-[80vh]"
                  title={currentNode.name}
                />
              )}
              {['mp4', 'mov', 'avi'].includes(currentNode.ext ?? '') && (
                <div className="p-6 flex justify-center bg-black">
                  <video src={currentNode.publicUrl} controls className="max-w-full rounded-xl max-h-[70vh]" />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Folders */}
              {folders.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                    Folders — {folders.length}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {folders.map(node => (
                      <FolderCard key={node.path} node={node} />
                    ))}
                  </div>
                </section>
              )}

              {/* Files */}
              {files.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                    Files — {files.length}
                  </h2>
                  <div className="rounded-xl border bg-card overflow-hidden divide-y divide-border/50">
                    {files.map(node => (
                      <div key={node.path} className="px-2 py-1">
                        <FileRow
                          node={node}
                          onClick={() => setPreviewNode(node)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {folders.length === 0 && files.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <FolderOpen className="w-12 h-12 opacity-30" />
                  <p className="text-sm">This folder is empty.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewNode && (
          <FilePreviewModal
            node={previewNode}
            onClose={() => setPreviewNode(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
