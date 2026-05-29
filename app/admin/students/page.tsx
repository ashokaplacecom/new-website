"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Papa from "papaparse";
import { GlassCard } from "@/components/admin/GlassCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2, AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getExistingEmails, importStudents } from "./actions";

// Predefined database schema
const SCHEMA = [
  { key: "name", label: "Full Name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "program", label: "Program", required: false },
  { key: "emergencies_remaining", label: "Emergencies Remaining", required: false },
  { key: "major_minor_change_count", label: "Degree Changes Count", required: false },
] as const;

type SchemaKey = (typeof SCHEMA)[number]["key"];

const NULL_STRATEGIES = ["skip-row", "set-null", "default"] as const;
type NullStrategy = (typeof NULL_STRATEGIES)[number];

type Step = "upload" | "map" | "review" | "done";

function guessMapping(headers: string[]): Record<SchemaKey, string | null> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const map: Record<string, string | null> = {};
  for (const f of SCHEMA) {
    const target = norm(f.key);
    const altMap: Record<string, string[]> = {
      name: ["name", "studentname", "fullname", "full_name"],
      email: ["email", "emailid", "mail"],
      program: ["program", "course", "major", "department", "dept"],
      emergencies_remaining: ["emergencies", "emergencies_remaining"],
      major_minor_change_count: ["major_minor_change_count", "degree_changes"],
    };
    const alts = (altMap[f.key] || []).concat(target);
    const found = headers.find((h) => alts.includes(norm(h)));
    map[f.key] = found ?? null;
  }
  return map as Record<SchemaKey, string | null>;
}

export default function StudentsPage() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<SchemaKey, string | null>>(
    Object.fromEntries(SCHEMA.map((f) => [f.key, null])) as Record<SchemaKey, string | null>,
  );
  const [nullStrategy, setNullStrategy] = useState<NullStrategy>("default");

  // Review step state
  const [newRows, setNewRows] = useState<Record<string, string | null>[]>([]);
  const [existingCount, setExistingCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isChecking, startCheckTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [savedCount, setSavedCount] = useState(0);

  const handleFile = useCallback((file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const hdrs = (res.meta.fields ?? []).filter(Boolean);
        setFileName(file.name);
        setHeaders(hdrs);
        setRows(res.data);
        setMapping(guessMapping(hdrs));
        setStep("map");
        toast.success(`Parsed ${res.data.length} rows from ${file.name}`);
      },
      error: (err) => toast.error(`Parse error: ${err.message}`),
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const missingRequired = SCHEMA.filter((f) => f.required && !mapping[f.key]);

  const mappedRows = useMemo(() => {
    return rows.map((r) => {
      const out: Record<string, string | null> = {};
      for (const f of SCHEMA) {
        const src = mapping[f.key];
        const v = src ? (r[src] ?? "").trim() : "";
        out[f.key] = v === "" ? null : v;
      }
      return out;
    });
  }, [rows, mapping]);

  const rowsWithNulls = useMemo(
    () => mappedRows.filter((r) => SCHEMA.some((f) => f.required && r[f.key] === null)).length,
    [mappedRows],
  );

  /** Query the database for existing emails and compute the diff */
  const handleContinueToReview = () => {
    if (missingRequired.length > 0) return;

    startCheckTransition(async () => {
      try {
        const existingEmails = await getExistingEmails();
        const existingSet = new Set(existingEmails.map((e) => e.toLowerCase()));

        const mapped = mappedRows;
        const fresh: Record<string, string | null>[] = [];
        let existCount = 0;

        for (const r of mapped) {
          const email = r.email?.toLowerCase();
          if (!email) continue; // skip rows with no email
          if (existingSet.has(email)) {
            existCount++;
          } else {
            fresh.push(r);
          }
        }

        setNewRows(fresh);
        setExistingCount(existCount);
        // Select all new rows by default
        setSelectedRows(new Set(fresh.map((_, i) => i)));
        setStep("review");
      } catch (err) {
        toast.error("Failed to check existing students. Please try again.");
        console.error(err);
      }
    });
  };

  /** Commit selected rows to the database */
  const handleCommit = () => {
    const toInsert = newRows.filter((_, i) => selectedRows.has(i));
    if (toInsert.length === 0) {
      toast.info("No rows selected for import.");
      return;
    }

    startSaveTransition(async () => {
      try {
        const payload = toInsert.map((r) => ({
          name: r.name ?? null,
          email: r.email ?? null,
          program: r.program ?? null,
          emergencies_remaining: r.emergencies_remaining ? parseInt(r.emergencies_remaining, 10) : null,
          major_minor_change_count: r.major_minor_change_count
            ? parseInt(r.major_minor_change_count, 10)
            : null,
        }));

        const result = await importStudents(payload);
        if (result.success) {
          setSavedCount(result.count);
          toast.success(result.message);
          setStep("done");
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        toast.error("Failed to save students. Please try again.");
        console.error(err);
      }
    });
  };

  const toggleRow = (idx: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === newRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(newRows.map((_, i) => i)));
    }
  };

  const reset = () => {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setNewRows([]);
    setExistingCount(0);
    setSelectedRows(new Set());
    setSavedCount(0);
  };

  const emailKey = mapping.email;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Update Students</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a CSV, map columns to the schema, and commit new records.
          </p>
        </div>
        {step !== "upload" && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="size-4" /> Start over
          </Button>
        )}
      </div>

      <Stepper step={step} />

      {step === "upload" && (
        <GlassCard
          className="p-10 flex flex-col items-center justify-center text-center border-dashed"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Upload className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Upload student CSV</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Drag and drop a .csv file here, or click to select. The first row should contain column headers.
          </p>
          <label className="mt-5">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-pointer hover:opacity-90 transition">
              <FileSpreadsheet className="size-4" /> Choose file
            </span>
          </label>
        </GlassCard>
      )}

      {step === "map" && (
        <GlassCard className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Map columns</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {fileName} · {rows.length} rows · {headers.length} columns detected
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Null handling:</span>
              <Select value={nullStrategy} onValueChange={(v) => setNullStrategy(v as NullStrategy)}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Use default value</SelectItem>
                  <SelectItem value="skip-row">Skip row if null</SelectItem>
                  <SelectItem value="set-null">Set NULL in DB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>DB Column</TableHead>
                  <TableHead className="w-10" />
                  <TableHead>CSV Column</TableHead>
                  <TableHead>Sample</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SCHEMA.map((f) => {
                  const src = mapping[f.key];
                  const sample = src ? rows[0]?.[src] : null;
                  return (
                    <TableRow key={f.key}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{f.label}</span>
                          {f.required && <Badge variant="secondary" className="text-[10px] py-0">required</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">{f.key}</p>
                      </TableCell>
                      <TableCell><ArrowRight className="size-4 text-muted-foreground" /></TableCell>
                      <TableCell>
                        <Select
                          value={src ?? "__none__"}
                          onValueChange={(v) =>
                            setMapping((m) => ({ ...m, [f.key]: v === "__none__" ? null : v }))
                          }
                        >
                          <SelectTrigger className="h-9 w-[240px]">
                            <SelectValue placeholder="— not mapped —" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— not mapped —</SelectItem>
                            {headers.map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[240px]">
                        {sample ?? <span className="italic">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {missingRequired.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <CheckCircle2 className="size-4 text-emerald-600" /> All required fields mapped
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <AlertCircle className="size-4 text-amber-600" />
                  Map required: {missingRequired.map((f) => f.label).join(", ")}
                </span>
              )}
            </div>
            <Button
              disabled={missingRequired.length > 0 || isChecking}
              onClick={handleContinueToReview}
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Checking database…
                </>
              ) : (
                "Continue to review"
              )}
            </Button>
          </div>
        </GlassCard>
      )}

      {step === "review" && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Mini label="New students" value={newRows.length} accent="text-emerald-600" />
            <Mini label="Already in database" value={existingCount} accent="text-muted-foreground" />
            <Mini label="Selected for import" value={selectedRows.size} accent="text-primary" />
          </div>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">New students to insert</h2>
                <p className="text-xs text-muted-foreground">
                  Detected by matching {emailKey ? <code className="font-mono">{emailKey}</code> : "email"} against existing records.
                  {" "}Uncheck any rows you want to skip.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border/60 overflow-hidden">
              <div className="max-h-[420px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-[1]">
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={newRows.length > 0 && selectedRows.size === newRows.length}
                          onCheckedChange={toggleAll}
                          aria-label="Select all rows"
                        />
                      </TableHead>
                      {SCHEMA.map((f) => (
                        <TableHead key={f.key} className="whitespace-nowrap">{f.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newRows.slice(0, 200).map((r, i) => {
                      const isSelected = selectedRows.has(i);
                      return (
                        <TableRow
                          key={i}
                          className={cn(!isSelected && "opacity-40")}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(i)}
                              aria-label={`Select row ${i + 1}`}
                            />
                          </TableCell>
                          {SCHEMA.map((f) => {
                            const v = r[f.key];
                            const isNull = v === null;
                            return (
                              <TableCell
                                key={f.key}
                                className={cn(
                                  "whitespace-nowrap text-xs",
                                  isNull && "text-muted-foreground italic",
                                )}
                              >
                                {isNull ? "—" : v}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                    {newRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={SCHEMA.length + 1} className="text-center py-8 text-sm text-muted-foreground">
                          No new students found in this file.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {newRows.length > 200 && (
                <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border/60 bg-muted/30">
                  Showing first 200 of {newRows.length} rows.
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep("map")}>Back</Button>
              <Button
                disabled={selectedRows.size === 0 || isSaving}
                onClick={handleCommit}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>Commit {selectedRows.size} to database</>
                )}
              </Button>
            </div>
          </GlassCard>
        </>
      )}

      {step === "done" && (
        <GlassCard className="p-10 text-center">
          <div className="size-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Update complete</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {savedCount} new student{savedCount === 1 ? " was" : "s were"} inserted into the database.
          </p>
          <Button className="mt-5" onClick={reset}>Upload another file</Button>
        </GlassCard>
      )}
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <GlassCard className="p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tracking-tight tabular-nums", accent)}>{value}</p>
    </GlassCard>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "map", label: "Map columns" },
    { key: "review", label: "Review & select" },
    { key: "done", label: "Done" },
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={cn(
              "size-6 rounded-full text-[11px] font-semibold flex items-center justify-center transition",
              i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </div>
          <span className={cn("text-xs", i === idx ? "font-medium text-foreground" : "text-muted-foreground")}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}
