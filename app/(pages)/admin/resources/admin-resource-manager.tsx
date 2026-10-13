'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  FolderPlus,
  Upload,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Folder,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadResourceFile, createResourceFolder, deleteResourceItem } from './actions';
import { ResourceNode } from '@/lib/resources';

interface AdminResourceManagerProps {
  folderPaths: string[];
  initialTree: ResourceNode[];
  userEmail?: string | null;
}

export function AdminResourceManager({
  folderPaths,
  initialTree,
  userEmail,
}: AdminResourceManagerProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>(folderPaths[0] || '');
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolder, setParentFolder] = useState<string>(folderPaths[0] || '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isUploading, startUploadTransition] = useTransition();
  const [isCreatingFolder, startFolderTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('folder', selectedFolder);

    startUploadTransition(async () => {
      const res = await uploadResourceFile(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'File uploaded successfully!' });
        form.reset();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to upload file.' });
      }
    });
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!newFolderName.trim()) return;

    const formData = new FormData();
    formData.set('parentFolder', parentFolder);
    formData.set('folderName', newFolderName.trim());

    startFolderTransition(async () => {
      const res = await createResourceFolder(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: `Folder "${newFolderName}" created successfully!` });
        setNewFolderName('');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to create folder.' });
      }
    });
  };

  const handleDelete = (itemPath: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    setFeedback(null);

    startDeleteTransition(async () => {
      const res = await deleteResourceItem(itemPath);
      if (res.success) {
        setFeedback({ type: 'success', message: `"${name}" was deleted.` });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete.' });
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Resources
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Admin Only
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            MasterDrive Resource Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as <span className="font-medium text-foreground">{userEmail}</span>. Add or update files in PlaceCom MasterDrive.
          </p>
        </div>

        <Link
          href="/resources"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-colors shrink-0"
        >
          <ExternalLink className="w-4 h-4" /> View Live Page
        </Link>
      </div>

      {/* Status Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl text-sm mb-6 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Card 1: Upload File */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Upload Resource File</h2>
              <p className="text-xs text-muted-foreground">Add PDFs, documents, sheets, or videos</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Destination Folder
              </label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {folderPaths.map((f) => (
                  <option key={f} value={f}>
                    📁 {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Select File
              </label>
              <input
                type="file"
                name="file"
                required
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer border border-border rounded-xl p-2 bg-background"
              />
            </div>

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full rounded-xl gap-2 font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload Resource
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Card 2: Create Folder */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Create New Folder</h2>
              <p className="text-xs text-muted-foreground">Organize subcategories and steps</p>
            </div>
          </div>

          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Parent Folder
              </label>
              <select
                value={parentFolder}
                onChange={(e) => setParentFolder(e.target.value)}
                className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {folderPaths.map((f) => (
                  <option key={f} value={f}>
                    📁 {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Folder Name
              </label>
              <input
                type="text"
                placeholder="e.g. Step 7 - Networking & Outreach"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
                className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isCreatingFolder || !newFolderName.trim()}
              className="w-full rounded-xl gap-2 font-medium"
            >
              {isCreatingFolder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" /> Create Folder
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Current Files Overview & Deletion */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground text-base">All MasterDrive Files</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse uploaded files or remove outdated ones
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {countAllFiles(initialTree)} total files
          </span>
        </div>

        <div className="divide-y divide-border/60 max-h-[600px] overflow-y-auto">
          {renderResourceRows(initialTree, handleDelete, isDeleting)}
        </div>
      </div>
    </div>
  );
}

function countAllFiles(nodes: ResourceNode[]): number {
  return nodes.reduce((sum, n) => {
    if (n.type === 'file') return sum + 1;
    return sum + (n.children ? countAllFiles(n.children) : 0);
  }, 0);
}

function renderResourceRows(
  nodes: ResourceNode[],
  onDelete: (path: string, name: string) => void,
  isDeleting: boolean,
  depth = 0
): React.ReactNode {
  return nodes.map((node) => {
    if (node.type === 'folder') {
      return (
        <React.Fragment key={node.path}>
          <div
            className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider"
            style={{ paddingLeft: `${16 + depth * 16}px` }}
          >
            <Folder className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>
          {node.children && renderResourceRows(node.children, onDelete, isDeleting, depth + 1)}
        </React.Fragment>
      );
    }

    return (
      <div
        key={node.path}
        className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-muted/30 transition-colors text-sm"
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="truncate text-foreground text-xs sm:text-sm">{node.name}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={node.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Preview
          </a>
          <button
            onClick={() => onDelete(node.path, node.name)}
            disabled={isDeleting}
            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
            title="Delete file"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  });
}
