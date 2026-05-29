"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { GlassCard } from "@/components/admin/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  Pencil, X, Check, Filter, ChevronLeft, ChevronRight, Loader2, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchTablePage, updateRow, deleteRows } from "./actions";
import { type TableMeta, type ColumnDef, type FetchResult } from "./schema";

const PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DatabaseClient({ tables }: { tables: TableMeta[] }) {
  const [active, setActive] = useState(tables[0]?.name ?? "");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Database</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and edit records across all tables. Edits save immediately.
        </p>
      </header>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="bg-muted/40 backdrop-blur-xl border border-border/60">
          {tables.map((t) => (
            <TabsTrigger key={t.name} value={t.name} className="data-[state=active]:bg-background">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tables.map((t) =>
        t.name === active ? (
          <TableView key={t.name} meta={t} />
        ) : null,
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-table view with lazy loading + pagination
// ---------------------------------------------------------------------------

function TableView({ meta }: { meta: TableMeta }) {
  const [data, setData] = useState<FetchResult | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, startLoadTransition] = useTransition();

  // Search / sort / filter — database-side search, client-side sort & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterCol, setFilterCol] = useState<string>("__all");
  const [filterVal, setFilterVal] = useState<string>("__all");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Inline editing & Deleting
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic options for POC selection
  const [pocOptions, setPocOptions] = useState<string[]>([]);

  // Fetch data when page changes or search changes
  const loadPage = useCallback(
    (p: number, search: string) => {
      startLoadTransition(async () => {
        try {
          const result = await fetchTablePage(meta.name, p, PAGE_SIZE, search);
          setData(result);
          setPage(p);
          if (result.pocOptions) {
            setPocOptions(result.pocOptions);
          }
          // Reset client-side state
          setEditingId(null);
          setDraft(null);
        } catch {
          toast.error("Failed to load data.");
        }
      });
    },
    [meta.name],
  );

  // Debouncing search query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reload page 0 when debounced search query changes
  useEffect(() => {
    loadPage(0, debouncedSearchQuery);
  }, [debouncedSearchQuery, loadPage]);

  // Reset selected IDs when data or page changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [data, page]);

  // Construct final columns metadata, dynamically populating student.poc enum options
  const columns = useMemo(() => {
    return meta.columns.map((c) => {
      if (meta.name === "students" && c.key === "poc") {
        return { ...c, options: pocOptions };
      }
      return c;
    });
  }, [meta.columns, meta.name, pocOptions]);

  const filterableCols = columns.filter((c) => c.type === "enum" || c.type === "boolean");

  const rows = data?.rows ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Client-side filtering / sorting on loaded page
  const filtered = useMemo(() => {
    let rs = rows;
    if (filterCol !== "__all" && filterVal !== "__all") {
      rs = rs.filter((r) => String(r[filterCol]) === filterVal);
    }
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      rs = [...rs].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }
    return rs;
  }, [rows, filterCol, filterVal, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") setSortDir("desc");
    else {
      setSortKey(null);
      setSortDir("asc");
    }
  };

  // Selection helpers
  const allRowIds = filtered.map((r) => r.id as number);
  const isAllSelected = allRowIds.length > 0 && allRowIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allRowIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allRowIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Editing handlers
  const startEdit = (row: Record<string, unknown>) => {
    const id = row.id as number;
    setEditingId(id);
    setDraft({ ...row });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };
  const commitEdit = async () => {
    if (editingId == null || !draft) return;
    setSavingId(editingId);
    try {
      const result = await updateRow(meta.name, editingId, draft);
      if (result.success) {
        toast.success(result.message);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rows: prev.rows.map((r) => (r.id === editingId ? { ...draft } : r)),
          };
        });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to save row.");
    } finally {
      setSavingId(null);
      setEditingId(null);
      setDraft(null);
    }
  };

  // Deletion handlers
  const handleDeleteRow = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const result = await deleteRows(meta.name, [id]);
      if (result.success) {
        toast.success(result.message);
        loadPage(page, debouncedSearchQuery);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${count} selected record(s)? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const result = await deleteRows(meta.name, Array.from(selectedIds));
      if (result.success) {
        toast.success(result.message);
        setSelectedIds(new Set());
        loadPage(page, debouncedSearchQuery);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete records.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filterOptions =
    filterCol === "__all"
      ? []
      : Array.from(new Set(rows.map((r) => String(r[filterCol]))));

  return (
    <GlassCard className="p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/60 bg-background/40">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${meta.label.toLowerCase()} (queries database)…`}
            className="pl-8 h-9 bg-background/60"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <Filter className="size-3.5 text-muted-foreground" />
          <Select
            value={filterCol}
            onValueChange={(v) => {
              setFilterCol(v);
              setFilterVal("__all");
            }}
          >
            <SelectTrigger className="h-9 w-[140px] bg-background/60">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">No filter</SelectItem>
              {filterableCols.map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterCol !== "__all" && (
            <Select value={filterVal} onValueChange={setFilterVal}>
              <SelectTrigger className="h-9 w-[130px] bg-background/60">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All</SelectItem>
                {filterOptions.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-9 gap-1.5 ml-2 animate-in fade-in zoom-in-95 duration-150"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              <Trash2 className="size-3.5" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-320px)] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <Table>
          <TableHeader className="sticky top-0 bg-background/80 backdrop-blur-xl z-[1]">
            <TableRow>
              <TableHead className="w-[40px] pl-4">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
              {columns.map((c) => (
                <TableHead key={c.key} className="whitespace-nowrap">
                  <button
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {c.label}
                    {sortKey === c.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40" />
                    )}
                  </button>
                </TableHead>
              ))}
              <TableHead className="w-[120px] text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center text-sm text-muted-foreground py-10">
                  {rows.length === 0 ? "No data in this table." : "No matching rows."}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => {
              const id = row.id as number;
              const isEditing = editingId === id;
              const isSaving = savingId === id;
              const isSelected = selectedIds.has(id);
              return (
                <TableRow key={id} className={isSelected ? "bg-muted/40" : undefined}>
                  <TableCell className="w-[40px] pl-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectRow(id)}
                      aria-label={`Select row ${id}`}
                      disabled={isEditing}
                    />
                  </TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="whitespace-nowrap">
                      {isEditing ? (
                        <EditCell
                          column={c}
                          value={draft?.[c.key]}
                          onChange={(v) => setDraft((d) => (d ? { ...d, [c.key]: v } : d))}
                        />
                      ) : (
                        <DisplayCell column={c} value={row[c.key]} />
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right pr-4">
                    {isEditing ? (
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit} disabled={isSaving}>
                          <X className="size-3.5" />
                        </Button>
                        <Button size="icon" className="size-7" onClick={commitEdit} disabled={isSaving}>
                          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => startEdit(row)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteRow(id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer — pagination */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 text-[11px] text-muted-foreground bg-background/40">
        <span>
          {totalCount === 0
            ? "Empty table"
            : <>Page <span className="text-foreground font-medium">{page + 1}</span> of {totalPages} · <span className="text-foreground font-medium">{totalCount}</span> total rows</>
          }
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1"
            disabled={page === 0 || isLoading}
            onClick={() => loadPage(page - 1, debouncedSearchQuery)}
          >
            <ChevronLeft className="size-3" /> Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1"
            disabled={page >= totalPages - 1 || isLoading}
            onClick={() => loadPage(page + 1, debouncedSearchQuery)}
          >
            Next <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Display / Edit cells
// ---------------------------------------------------------------------------

function DisplayCell({ column, value }: { column: ColumnDef; value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground italic">null</span>;
  }
  if (column.type === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"} className="font-normal">
        {value ? "true" : "false"}
      </Badge>
    );
  }
  if (column.type === "enum") {
    return <Badge variant="outline" className="font-normal capitalize">{String(value)}</Badge>;
  }
  if (column.type === "date") {
    try {
      const d = new Date(String(value));
      return <span className="text-xs tabular-nums">{d.toLocaleDateString()}</span>;
    } catch {
      return <span className="text-xs">{String(value)}</span>;
    }
  }
  if (!column.editable) {
    return <span className="font-mono text-xs text-muted-foreground">{String(value)}</span>;
  }
  return <span className="text-sm">{String(value)}</span>;
}

function EditCell({
  column,
  value,
  onChange,
}: {
  column: ColumnDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (!column.editable) {
    return <span className="font-mono text-xs text-muted-foreground">{String(value ?? "")}</span>;
  }
  if (column.type === "enum" && column.options) {
    return (
      <Select value={String(value ?? "")} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {column.options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (column.type === "boolean") {
    return (
      <Select value={String(value)} onValueChange={(v) => onChange(v === "true")}>
        <SelectTrigger className="h-8 w-[100px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="true">true</SelectItem>
          <SelectItem value="false">false</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  if (column.type === "number") {
    return (
      <Input
        type="number"
        value={String(value ?? "")}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-[100px]"
      />
    );
  }
  if (column.type === "date") {
    const dateStr = value ? new Date(String(value)).toISOString().split("T")[0] : "";
    return (
      <Input
        type="date"
        value={dateStr}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        className="h-8 w-[150px]"
      />
    );
  }
  return (
    <Input
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 min-w-[140px]"
    />
  );
}
