"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Tree, Folder, File } from "@/components/ui/file-tree";
import { ResourceFileIconSmall } from "@/components/resources/resource-file-icon";
import type { ResourceNode, ResourceFile } from "@/types/resources";

interface ResourceTreeSidebarProps {
    nodes: ResourceNode[];
    selectedFileId: string | null;
    onSelectFile: (file: ResourceFile) => void;
}

/** Recursively find all files matching a query */
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

/** Recursively find a file node by id across the whole tree */
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

function buildTreeElements(
    nodes: ResourceNode[],
    onSelectFile: (file: ResourceFile) => void,
    allNodes: ResourceNode[]
): React.ReactElement[] {
    return nodes.map((node) => {
        if (node.type === "folder") {
            return (
                <Folder key={node.id} element={node.name} value={node.id}>
                    {buildTreeElements(node.children, onSelectFile, allNodes)}
                </Folder>
            );
        }
        return (
            <File
                key={node.id}
                value={node.id}
                fileIcon={<ResourceFileIconSmall fileType={node.fileType} />}
                onClick={() => onSelectFile(node)}
            >
                <span className="truncate max-w-[160px]">{node.name}</span>
            </File>
        );
    });
}

export function ResourceTreeSidebar({
    nodes,
    selectedFileId,
    onSelectFile,
}: ResourceTreeSidebarProps) {
    const [search, setSearch] = useState("");

    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        return searchNodes(nodes, search.trim());
    }, [nodes, search]);

    return (
        <aside className="w-72 shrink-0 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm h-[calc(100vh-180px)] sticky top-24 overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 border-b border-border/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    File Tree
                </p>
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search files…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-muted/60 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 transition"
                    />
                </div>
            </div>

            {/* Search Results */}
            {searchResults !== null ? (
                <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
                    {searchResults.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">
                            No results for &ldquo;{search}&rdquo;
                        </p>
                    ) : (
                        searchResults.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => onSelectFile(file)}
                                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs transition hover:bg-accent/60 ${selectedFileId === file.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-foreground"
                                    }`}
                            >
                                <ResourceFileIconSmall fileType={file.fileType} />
                                <span className="truncate">{file.name}</span>
                            </button>
                        ))
                    )}
                </div>
            ) : (
                /* Normal Tree */
                <div className="flex-1 overflow-hidden px-2 pb-3">
                    <Tree
                        className="text-xs"
                        initialSelectedId={selectedFileId ?? undefined}
                    >
                        {buildTreeElements(nodes, onSelectFile, nodes)}
                    </Tree>
                </div>
            )}
        </aside>
    );
}
