"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    Folder as FolderIcon,
    FolderOpen,
    ExternalLink,
    ArrowLeft,
    Grid3X3,
    List,
    Search,
    X,
} from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ResourceFileIcon } from "@/components/resources/resource-file-icon";
import { ResourceTreeSidebar } from "@/components/resources/resource-tree-sidebar";
import type { ResourceNode, ResourceFile, ResourceFolder } from "@/types/resources";

interface ResourceBrowserProps {
    nodes: ResourceNode[];
}

/** Recursively find file by id */
function findFileById(nodes: ResourceNode[], id: string): ResourceFile | null {
    for (const node of nodes) {
        if (node.type === "file" && node.id === id) return node;
        if (node.type === "folder") {
            const found = findFileById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

/** Find ancestor folder path for a given node id */
function findFolderPathById(
    nodes: ResourceNode[],
    id: string,
    current: ResourceFolder[] = []
): ResourceFolder[] | null {
    for (const node of nodes) {
        if (node.type === "folder") {
            const path = [...current, node];
            if (node.id === id) return path;
            const found = findFolderPathById(node.children, id, path);
            if (found) return found;
        }
    }
    return null;
}

/** Find the folder path containing a file */
function findFolderPathContaining(
    folder: ResourceFolder,
    fileId: string,
    current: ResourceFolder[] = []
): ResourceFolder[] | null {
    const path = [...current, folder];
    for (const child of folder.children) {
        if (child.type === "file" && child.id === fileId) return path;
        if (child.type === "folder") {
            const found = findFolderPathContaining(child, fileId, path);
            if (found) return found;
        }
    }
    return null;
}

/** Count all descendant files */
function countFiles(nodes: ResourceNode[]): number {
    let count = 0;
    for (const node of nodes) {
        if (node.type === "file") count++;
        else count += countFiles(node.children);
    }
    return count;
}

/** Flat search across all nodes */
function searchNodes(nodes: ResourceNode[], query: string): ResourceFile[] {
    const q = query.toLowerCase();
    const results: ResourceFile[] = [];
    for (const node of nodes) {
        if (node.type === "file") {
            if (
                node.name.toLowerCase().includes(q) ||
                node.description?.toLowerCase().includes(q) ||
                node.badges?.some((b) => b.label.toLowerCase().includes(q))
            ) {
                results.push(node);
            }
        } else {
            results.push(...searchNodes(node.children, query));
        }
    }
    return results;
}

type ViewMode = "grid" | "list";

export function ResourceBrowser({ nodes }: ResourceBrowserProps) {
    const haptic = useWebHaptics();
    const [path, setPath] = useState<ResourceFolder[]>([]);
    const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [mobileSearch, setMobileSearch] = useState("");

    const currentChildren = useMemo<ResourceNode[]>(() => {
        if (path.length === 0) return nodes;
        return path[path.length - 1].children;
    }, [nodes, path]);

    const mobileSearchResults = useMemo(() => {
        if (!mobileSearch.trim()) return null;
        return searchNodes(nodes, mobileSearch.trim());
    }, [nodes, mobileSearch]);

    const navigateToFolder = useCallback(
        (folder: ResourceFolder, folderPath?: ResourceFolder[]) => {
            haptic.trigger("selection");
            if (folderPath) {
                setPath(folderPath);
            } else {
                setPath((prev) => [...prev, folder]);
            }
            setSelectedFile(null);
        },
        [haptic]
    );

    const navigateToBreadcrumb = useCallback(
        (index: number) => {
            haptic.trigger("selection");
            setPath(index < 0 ? [] : path.slice(0, index + 1));
            setSelectedFile(null);
        },
        [haptic, path]
    );

    const handleSelectFile = useCallback(
        (file: ResourceFile) => {
            haptic.trigger("light");
            // Navigate the main view to the containing folder
            for (const node of nodes) {
                if (node.type === "folder") {
                    const folderPath = findFolderPathContaining(node, file.id);
                    if (folderPath) {
                        setPath(folderPath);
                        break;
                    }
                }
            }
            setSelectedFile(file);
        },
        [haptic, nodes]
    );

    const handleOpenLink = useCallback(() => {
        haptic.trigger("medium");
    }, [haptic]);

    return (
        <div className="flex gap-6 items-start">
            {/* ── Desktop Sidebar (hidden on mobile) ── */}
            <div className="hidden lg:block">
                <ResourceTreeSidebar
                    nodes={nodes}
                    selectedFileId={selectedFile?.id ?? null}
                    onSelectFile={handleSelectFile}
                />
            </div>

            {/* ── Main area ── */}
            <div className="flex-1 min-w-0">

                {/* ── Mobile search bar (visible only on mobile) ── */}
                <div className="lg:hidden mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="search"
                            value={mobileSearch}
                            onChange={(e) => setMobileSearch(e.target.value)}
                            placeholder="Search resources…"
                            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-card border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 transition shadow-sm"
                        />
                        {mobileSearch && (
                            <button
                                onClick={() => setMobileSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Mobile search results ── */}
                {mobileSearchResults !== null && (
                    <div className="lg:hidden mb-4 rounded-xl border border-border/60 bg-card overflow-hidden divide-y divide-border/50">
                        {mobileSearchResults.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-10">
                                No results for &ldquo;{mobileSearch}&rdquo;
                            </p>
                        ) : (
                            mobileSearchResults.map((file) => (
                                <button
                                    key={file.id}
                                    onClick={() => {
                                        handleSelectFile(file);
                                        setMobileSearch("");
                                    }}
                                    className={`flex items-center gap-3 w-full px-4 py-3 text-left transition hover:bg-accent/40 ${selectedFile?.id === file.id ? "bg-primary/5" : ""
                                        }`}
                                >
                                    <ResourceFileIcon fileType={file.fileType} size={32} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        {file.description && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {file.description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* ── Breadcrumbs + view toggle ── */}
                <div className="flex items-center justify-between mb-5 gap-3">
                    <Breadcrumb className="min-w-0 flex-1">
                        <BreadcrumbList className="flex-wrap">
                            <BreadcrumbItem>
                                {path.length === 0 ? (
                                    <BreadcrumbPage className="font-medium">All Files</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        onClick={() => navigateToBreadcrumb(-1)}
                                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        All Files
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {path.map((folder, i) => (
                                <React.Fragment key={folder.id}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {i === path.length - 1 ? (
                                            <BreadcrumbPage className="font-medium">{folder.name}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink
                                                onClick={() => navigateToBreadcrumb(i)}
                                                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {folder.name}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/40 shrink-0">
                        <button
                            onClick={() => { haptic.trigger("selection"); setViewMode("grid"); }}
                            className={`p-1.5 rounded-md transition ${viewMode === "grid"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            aria-label="Grid view"
                        >
                            <Grid3X3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => { haptic.trigger("selection"); setViewMode("list"); }}
                            className={`p-1.5 rounded-md transition ${viewMode === "list"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            aria-label="List view"
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Back button */}
                {path.length > 0 && (
                    <button
                        onClick={() => navigateToBreadcrumb(path.length - 2)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Back
                    </button>
                )}

                {/* ── File detail panel ── */}
                {selectedFile && (
                    <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                        <ResourceFileIcon fileType={selectedFile.fileType} size={40} />
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold text-foreground mb-0.5 truncate">
                                {selectedFile.name}
                            </h2>
                            {selectedFile.description && (
                                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                                    {selectedFile.description}
                                </p>
                            )}
                            {selectedFile.badges && selectedFile.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {selectedFile.badges.map((badge, i) => (
                                        <Badge
                                            key={i}
                                            variant={badge.variant ?? "default"}
                                            className="text-[10px] px-1.5 py-0"
                                        >
                                            {badge.label}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <a
                                href={selectedFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleOpenLink}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                                Open resource
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <button
                            onClick={() => { haptic.trigger("light"); setSelectedFile(null); }}
                            className="text-muted-foreground hover:text-foreground transition p-1 rounded-md hover:bg-muted"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── Grid or List view ── */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {currentChildren.map((node) =>
                            node.type === "folder" ? (
                                <FolderCard
                                    key={node.id}
                                    folder={node}
                                    onClick={() => navigateToFolder(node)}
                                />
                            ) : (
                                <FileCard
                                    key={node.id}
                                    file={node}
                                    isSelected={selectedFile?.id === node.id}
                                    onClick={() => handleSelectFile(node)}
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden">
                        {currentChildren.map((node) =>
                            node.type === "folder" ? (
                                <FolderRow
                                    key={node.id}
                                    folder={node}
                                    onClick={() => navigateToFolder(node)}
                                />
                            ) : (
                                <FileRow
                                    key={node.id}
                                    file={node}
                                    isSelected={selectedFile?.id === node.id}
                                    onClick={() => handleSelectFile(node)}
                                />
                            )
                        )}
                    </div>
                )}

                {currentChildren.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FolderOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">This folder is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Sub-components ────────────────────────────────────────────── */

function FolderCard({
    folder,
    onClick,
}: {
    folder: ResourceFolder;
    onClick: () => void;
}) {
    const fileCount = countFiles(folder.children);
    const folderCount = folder.children.filter((n) => n.type === "folder").length;

    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-start gap-3 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:shadow-md hover:border-border transition-all duration-150 p-4 text-left cursor-pointer"
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition">
                    <FolderIcon className="w-5 h-5 text-amber-500 fill-amber-200/80 dark:fill-amber-700/50" />
                </div>
                <span className="text-[10px] text-muted-foreground">
                    {fileCount} file{fileCount !== 1 ? "s" : ""}
                </span>
            </div>
            <div>
                <p className="text-sm font-medium text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                    {folder.name}
                </p>
                {folderCount > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        {folderCount} subfolder{folderCount !== 1 ? "s" : ""}
                    </p>
                )}
            </div>
        </button>
    );
}

function FileCard({
    file,
    isSelected,
    onClick,
}: {
    file: ResourceFile;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-start gap-2.5 rounded-xl border transition-all duration-150 p-4 text-left cursor-pointer ${isSelected
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card/60 hover:bg-card hover:shadow-md hover:border-border"
                }`}
        >
            <div className="flex items-center justify-between w-full gap-2">
                <ResourceFileIcon fileType={file.fileType} size={40} />
                {file.badges && file.badges.length > 0 && (
                    <Badge
                        variant={file.badges[0].variant ?? "default"}
                        className="text-[10px] px-1.5 py-0 shrink-0"
                    >
                        {file.badges[0].label}
                    </Badge>
                )}
            </div>
            <div className="min-w-0 w-full">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                {file.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {file.description}
                    </p>
                )}
            </div>
        </button>
    );
}

function FolderRow({
    folder,
    onClick,
}: {
    folder: ResourceFolder;
    onClick: () => void;
}) {
    const fileCount = countFiles(folder.children);
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 bg-card/60 hover:bg-accent/40 transition text-left cursor-pointer"
        >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 shrink-0">
                <FolderIcon className="w-4 h-4 text-amber-500 fill-amber-200/80 dark:fill-amber-700/50" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{folder.name}</p>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">
                {fileCount} file{fileCount !== 1 ? "s" : ""}
            </span>
        </button>
    );
}

function FileRow({
    file,
    isSelected,
    onClick,
}: {
    file: ResourceFile;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 transition text-left cursor-pointer ${isSelected ? "bg-primary/5" : "bg-card/60 hover:bg-accent/40"
                }`}
        >
            <ResourceFileIcon fileType={file.fileType} size={36} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                {file.description && (
                    <p className="text-[11px] text-muted-foreground truncate">{file.description}</p>
                )}
            </div>
            {file.badges && file.badges.length > 0 && (
                <div className="hidden sm:flex gap-1 shrink-0">
                    {file.badges.slice(0, 2).map((badge, i) => (
                        <Badge
                            key={i}
                            variant={badge.variant ?? "default"}
                            className="text-[10px] px-1.5 py-0"
                        >
                            {badge.label}
                        </Badge>
                    ))}
                </div>
            )}
        </button>
    );
}
