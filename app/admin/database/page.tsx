"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/admin/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, Save, RotateCcw,
  Pencil, X, Check, Plus, Download, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---------- Mock schema + data ----------
type ColumnType = "string" | "number" | "email" | "enum" | "date" | "boolean";
interface Column {
  key: string;
  label: string;
  type: ColumnType;
  options?: string[];
  editable?: boolean;
}
interface TableDef {
  name: string;
  label: string;
  columns: Column[];
  rows: Record<string, unknown>[];
}

const seedTables: TableDef[] = [
  {
    name: "students",
    label: "Students",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "name", label: "Full Name", type: "string", editable: true },
      { key: "email", label: "Email", type: "email", editable: true },
      { key: "program", label: "Program", type: "string", editable: true },
      { key: "emergencies_remaining", label: "Emergencies", type: "number", editable: true },
      { key: "poc", label: "POC ID", type: "number", editable: true },
      { key: "major_minor_change_count", label: "Degree Changes", type: "number", editable: true },
    ],
    rows: [
      { id: 1, name: "Aarav Sharma", email: "aarav@univ.edu", program: "Computer Science", emergencies_remaining: 3, poc: 1, major_minor_change_count: 0 },
      { id: 2, name: "Diya Patel", email: "diya@univ.edu", program: "Electrical Engineering", emergencies_remaining: 2, poc: 2, major_minor_change_count: 1 },
    ],
  },
  {
    name: "external_opportunities",
    label: "External Opps",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "title", label: "Title", type: "string", editable: true },
      { key: "recruiting_body", label: "Company", type: "string", editable: true },
      { key: "role", label: "Role", type: "string", editable: true },
      { key: "deadline", label: "Deadline", type: "date", editable: true },
      { key: "is_active", label: "Active", type: "boolean", editable: true },
    ],
    rows: [
      { id: 101, title: "Software Engineer Intern", recruiting_body: "Google", role: "SDE Intern", deadline: "2026-06-15", is_active: true },
      { id: 102, title: "Data Analyst", recruiting_body: "Amazon", role: "Analyst", deadline: "2026-07-01", is_active: true },
    ],
  },
  {
    name: "major_minor_change",
    label: "Degree Changes",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "student", label: "Student ID", type: "number", editable: true },
      { key: "current_major", label: "Current Major", type: "string", editable: true },
      { key: "prospective_major", label: "New Major", type: "string", editable: true },
      { key: "status", label: "Status", type: "enum", options: ["pending", "approved", "rejected"], editable: true },
    ],
    rows: [
      { id: 1, student: 1, current_major: "Physics", prospective_major: "Computer Science", status: "pending" },
    ],
  },
  {
    name: "pocs",
    label: "POCs",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "poc_name", label: "Name", type: "string", editable: true },
      { key: "email", label: "Email", type: "email", editable: true },
      { key: "role", label: "Role", type: "enum", options: ["standard", "leadership"], editable: true },
    ],
    rows: [
      { id: 1, poc_name: "Dr. Nair", email: "nair@univ.edu", role: "standard" },
      { id: 2, poc_name: "Dr. Bose", email: "bose@univ.edu", role: "leadership" },
    ],
  },
  {
    name: "verifications",
    label: "Verifications",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "student", label: "Student ID", type: "number", editable: true },
      { key: "status", label: "Status", type: "enum", options: ["pending", "approved", "rejected"], editable: true },
      { key: "is_emergency", label: "Emergency", type: "boolean", editable: true },
    ],
    rows: [
      { id: 501, student: 1, status: "pending", is_emergency: false },
      { id: 502, student: 2, status: "approved", is_emergency: true },
    ],
  },
];

export default function DatabasePage() {
  const [tables, setTables] = useState<TableDef[]>(seedTables);
  const [active, setActive] = useState(seedTables[0].name);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Database</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and edit records across all tables. Changes are staged until you save.
        </p>
      </header>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="bg-muted/40 backdrop-blur-xl border border-border/60">
          {tables.map((t) => (
            <TabsTrigger key={t.name} value={t.name} className="data-[state=active]:bg-background">
              {t.label}
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                {t.rows.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tables.map((t) => (
          <TabsContent key={t.name} value={t.name} className="mt-5">
            <TableView
              table={t}
              onChange={(next) =>
                setTables((prev) => prev.map((p) => (p.name === t.name ? next : p)))
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ---------- Per-table view ----------
function TableView({ table, onChange }: { table: TableDef; onChange: (t: TableDef) => void }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterCol, setFilterCol] = useState<string>("__all");
  const [filterVal, setFilterVal] = useState<string>("__all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [dirtyRows, setDirtyRows] = useState<Set<number>>(new Set());

  const filterableCols = table.columns.filter((c) => c.type === "enum" || c.type === "boolean");

  const rowsIndexed = useMemo<Array<Record<string, unknown> & { __i: number }>>(
    () => table.rows.map((r, i) => ({ ...r, __i: i })),
    [table.rows],
  );

  const filtered = useMemo(() => {
    let rs = rowsIndexed;
    if (query.trim()) {
      const q = query.toLowerCase();
      rs = rs.filter((r) =>
        table.columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q)),
      );
    }
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
  }, [rowsIndexed, query, filterCol, filterVal, sortKey, sortDir, table.columns]);

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

  const startEdit = (rowIdx: number) => {
    setEditingId(rowIdx);
    setDraft({ ...table.rows[rowIdx] });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };
  const commitEdit = () => {
    if (editingId == null || !draft) return;
    const next = { ...table, rows: table.rows.map((r, i) => (i === editingId ? draft : r)) };
    onChange(next);
    setDirtyRows((prev) => new Set(prev).add(editingId));
    setEditingId(null);
    setDraft(null);
  };

  const saveAll = () => {
    if (!dirtyRows.size) {
      toast.info("No pending changes");
      return;
    }
    toast.success(`Saved ${dirtyRows.size} row${dirtyRows.size === 1 ? "" : "s"} to ${table.label}`);
    setDirtyRows(new Set());
  };
  const discardAll = () => {
    if (!dirtyRows.size) return;
    onChange({ ...table, rows: seedTables.find((t) => t.name === table.name)!.rows });
    setDirtyRows(new Set());
    toast("Changes discarded");
  };

  const filterOptions =
    filterCol === "__all"
      ? []
      : Array.from(new Set(table.rows.map((r) => String(r[filterCol]))));

  return (
    <GlassCard className="p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/60 bg-background/40">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${table.label.toLowerCase()}…`}
            className="pl-8 h-9 bg-background/60"
          />
        </div>

        <div className="flex items-center gap-1.5">
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
        </div>

        <div className="ml-auto flex items-center gap-2">
          {dirtyRows.size > 0 && (
            <Badge variant="secondary" className="gap-1">
              <span className="size-1.5 rounded-full bg-amber-500" />
              {dirtyRows.size} unsaved
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={discardAll} disabled={!dirtyRows.size}>
            <RotateCcw className="size-3.5" /> Discard
          </Button>
          <Button size="sm" onClick={saveAll} disabled={!dirtyRows.size}>
            <Save className="size-3.5" /> Save
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-280px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background/80 backdrop-blur-xl z-[1]">
            <TableRow>
              {table.columns.map((c) => (
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
              <TableHead className="w-[110px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={table.columns.length + 1} className="text-center text-sm text-muted-foreground py-10">
                  No matching rows.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => {
              const i = row.__i as number;
              const isEditing = editingId === i;
              const isDirty = dirtyRows.has(i);
              return (
                <TableRow key={i} className={cn(isDirty && "bg-amber-500/5")}>
                  {table.columns.map((c) => (
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
                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}>
                          <X className="size-3.5" />
                        </Button>
                        <Button size="icon" className="size-7" onClick={commitEdit}>
                          <Check className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => startEdit(i)}>
                        <Pencil className="size-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 text-[11px] text-muted-foreground bg-background/40">
        <span>
          Showing <span className="text-foreground font-medium">{filtered.length}</span> of {table.rows.length} rows
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1">
            <Download className="size-3" /> Export
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1" disabled>
            <Plus className="size-3" /> New row
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

function DisplayCell({ column, value }: { column: Column; value: unknown }) {
  if (column.type === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"} className="font-normal">
        {value ? "true" : "false"}
      </Badge>
    );
  }
  if (column.type === "enum") {
    return <Badge variant="outline" className="font-normal">{String(value ?? "")}</Badge>;
  }
  if (column.editable === false) {
    return <span className="font-mono text-xs text-muted-foreground">{String(value ?? "")}</span>;
  }
  return <span className="text-sm">{String(value ?? "")}</span>;
}

function EditCell({
  column,
  value,
  onChange,
}: {
  column: Column;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (column.editable === false) {
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
  return (
    <Input
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 min-w-[140px]"
    />
  );
}
