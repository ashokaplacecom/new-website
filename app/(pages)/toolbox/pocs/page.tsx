"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchDashboardRequests, modifyRequestAction, fetchAllPOCs } from "./actions";
import {
    RefreshCw,
    Zap,
    Clock,
    AlertTriangle,
    Eye,
    Send,
    MessageSquarePlus,
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "pending" | "approved" | "rejected" | "emergency";

interface RequestEntry {
    id: string;
    studentName: string;
    email: string;
    poc: string;
    deadline: Date;
    status: Status;
    studentMessage: string | null;
    pocMessage: string;
    type: "verification" | "major-minor";
    baseId: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const now = new Date();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000);

const INITIAL_DATA: RequestEntry[] = [];

// ─── Utilities ────────────────────────────────────────────────────────────────

function getHoursRemaining(deadline: Date): number {
    return (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
}

function formatTimeRemaining(deadline: Date): string {
    const totalMinutes = Math.max(0, (deadline.getTime() - Date.now()) / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    if (hours === 0 && minutes === 0) return "Expired";
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
}

function getRowUrgencyStyle(entry: RequestEntry): string {
    if (entry.status === "emergency") return "";
    const hours = getHoursRemaining(entry.deadline);
    if (hours < 6) return "border-l-[3px] border-l-orange-400";
    if (hours < 12) return "border-l-[3px] border-l-amber-400";
    return "";
}

function getTimeColor(entry: RequestEntry): string {
    if (entry.status === "emergency") return "text-destructive font-semibold";
    const hours = getHoursRemaining(entry.deadline);
    if (hours < 6) return "text-orange-600 dark:text-orange-400 font-semibold";
    if (hours < 12) return "text-amber-600 dark:text-amber-500 font-medium";
    return "text-muted-foreground";
}

// ─── API actions are imported from actions.ts ─────────────────────────
// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
    if (status === "pending") {
        return (
            <Badge variant="outline" className="text-[11px] border-amber-400/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-500/40">
                Pending
            </Badge>
        );
    }
    if (status === "emergency") {
        return (
            <Badge variant="outline" className="text-[11px] border-destructive/50 bg-destructive/10 text-destructive">
                <AlertTriangle className="size-3 mr-1" />
                Emergency
            </Badge>
        );
    }
    return null;
}

// ─── Student Message Popover ──────────────────────────────────────────────────

function StudentMessagePopover({
    entry,
    onViewed,
    hasViewed,
}: {
    entry: RequestEntry;
    onViewed: (id: string) => void;
    hasViewed: boolean;
}) {
    if (!entry.studentMessage) {
        return (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/40 cursor-not-allowed select-none">
                <Eye className="size-3.5" />
                No message
            </span>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onViewed(entry.id)}
                >
                    <Eye className="size-3.5" />
                    {hasViewed ? "Message" : "Read msg"}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-72 text-sm p-0 shadow-lg"
                align="start"
                side="right"
                sideOffset={8}
            >
                <div className="px-3 pt-3 pb-2 border-b border-border/50">
                    <p className="text-xs font-semibold text-foreground">{entry.studentName}</p>
                    <p className="text-[11px] text-muted-foreground">{entry.email}</p>
                </div>
                <p className="px-3 py-3 text-[12px] leading-relaxed text-foreground/90 whitespace-pre-line">
                    {entry.studentMessage}
                </p>
            </PopoverContent>
        </Popover>
    );
}

// ─── Add / Edit Note Dialog ───────────────────────────────────────────────────

function AddNoteDialog({
    entry,
    onSave,
}: {
    entry: RequestEntry;
    onSave: (id: string, message: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(entry.pocMessage);
    const hasPocMessage = !!entry.pocMessage;

    const handleSave = () => {
        onSave(entry.id, draft);
        setOpen(false);
        toast.success("Note saved");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-7 px-2 text-[11px] gap-1.5",
                        hasPocMessage
                            ? "text-primary hover:text-primary hover:bg-primary/10"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setDraft(entry.pocMessage)}
                >
                    <MessageSquarePlus className="size-3.5" />
                    {hasPocMessage ? "Edit note" : "Add note"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>POC Note — {entry.studentName}</DialogTitle>
                    <DialogDescription>
                        This note is required before rejecting. It will be sent with the status update.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor={`note-${entry.id}`}>Your Note</Label>
                    <Textarea
                        id={`note-${entry.id}`}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write your note to the student…"
                        rows={4}
                        className="resize-none"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={!draft.trim()} className="gap-2">
                        <Send className="size-4" />
                        Save Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Action Button (Approve / Reject) ────────────────────────────────────────

function ActionButton({
    type,
    entry,
    hasViewedStudentMessage,
    onAction,
}: {
    type: "approve" | "reject";
    entry: RequestEntry;
    hasViewedStudentMessage: boolean;
    onAction: (id: string, status: "approved" | "rejected") => Promise<void>;
}) {
    const [loading, setLoading] = useState(false);

    // Unlock rules:
    // • approve: must have viewed student message (if one exists) — no note required
    // • reject: must have viewed student message AND must have written a poc note
    const studentMsgExists = !!entry.studentMessage;
    const approveUnlocked = studentMsgExists ? hasViewedStudentMessage : true;
    const rejectUnlocked = approveUnlocked && !!entry.pocMessage;
    const unlocked = type === "approve" ? approveUnlocked : rejectUnlocked;

    let tooltipText = "";
    if (!unlocked) {
        if (type === "approve" && studentMsgExists && !hasViewedStudentMessage) {
            tooltipText = "Read the student's message first";
        } else if (type === "reject") {
            if (studentMsgExists && !hasViewedStudentMessage) tooltipText = "Read the student's message first";
            else tooltipText = "Add your note before rejecting";
        }
    } else {
        tooltipText = type === "approve" ? "Approve request" : "Reject request";
    }

    const handleClick = async () => {
        if (!unlocked || loading) return;
        setLoading(true);
        try {
            await onAction(entry.id, type === "approve" ? "approved" : "rejected");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            title={tooltipText}
            disabled={!unlocked || loading}
            onClick={handleClick}
            className={cn(
                "group flex items-center justify-center size-8 rounded-lg border-2 transition-all duration-150",
                loading
                    ? "border-border/50 cursor-wait bg-muted/20"
                    : unlocked
                    ? type === "approve"
                        ? "border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer hover:scale-110 active:scale-95"
                        : "border-destructive/70 text-destructive hover:bg-destructive/10 cursor-pointer hover:scale-110 active:scale-95"
                    : "border-border/30 text-muted-foreground/20 cursor-not-allowed bg-transparent"
            )}
        >
            {loading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : type === "approve" ? (
                <CheckCircle2 className={cn("size-5", !unlocked && "opacity-20")} />
            ) : (
                <XCircle className={cn("size-5", !unlocked && "opacity-20")} />
            )}
        </button>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function POCDashboard() {
    const { data: session } = useSession();
    const [entries, setEntries] = useState<RequestEntry[]>(INITIAL_DATA);
    const [pocFilter, setPocFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [availablePocs, setAvailablePocs] = useState<string[]>(["All"]);
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [viewedMessages, setViewedMessages] = useState<Set<string>>(new Set());

    const loadData = useCallback(async () => {
        setIsRefreshing(true);
        const [res, pocsRes] = await Promise.all([
            fetchDashboardRequests(),
            fetchAllPOCs()
        ]);
        
        if (Array.isArray(pocsRes) && pocsRes.length > 0) {
             setAvailablePocs(["All", ...pocsRes]);
        }

        if (res.success && res.data) {
             setEntries(res.data.map((d: any) => ({...d, deadline: new Date(d.deadline)})));
        } else {
             toast.error("Failed to load requests", { description: res.message });
        }
        setIsRefreshing(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const visibleEntries = useMemo(
        () => entries.filter((e) => e.status === "pending" || e.status === "emergency"),
        [entries]
    );

    const metrics = useMemo(() => {
        const expired = entries.filter((e) => e.status === "pending" && e.deadline.getTime() < Date.now()).length;
        const approved = entries.filter((e) => e.status === "approved").length;
        const pending = entries.filter((e) => e.status === "pending").length;
        return { expired, approved, pending };
    }, [entries]);

    const filteredEntries = useMemo(
        () => visibleEntries.filter((e) => 
            (pocFilter === "All" || e.poc === pocFilter) &&
            (typeFilter === "All" || e.type === typeFilter)
        ),
        [visibleEntries, pocFilter, typeFilter]
    );

    const handleMessageViewed = useCallback((id: string) => {
        setViewedMessages((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }, []);

    const handleSavePocMessage = useCallback((id: string, message: string) => {
        setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, pocMessage: message } : e))
        );
    }, []);

    const handleAction = useCallback(async (id: string, newStatus: "approved" | "rejected") => {
        const entry = entries.find((e) => e.id === id);
        const studentName = entry?.studentName ?? id;
        
        const pocId = session?.user?.pocId;
        if (!pocId || !entry) {
            toast.error("Error", { description: "You are not an authorized POC or entry invalid." });
            return;
        }

        try {
            const res = await modifyRequestAction(entry.type, entry.baseId, newStatus, pocId, entry.pocMessage);
            if (!res.success) throw new Error(res.message || "Failed to update API");

            setEntries((prev) =>
                prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
            );
            if (newStatus === "approved") {
                toast.success(`Request approved`, {
                    description: `${studentName}'s request has been approved and they've been notified.`,
                });
            } else {
                toast.info(`Request rejected`, {
                    description: `${studentName}'s request has been rejected.`,
                });
            }
        } catch (e: any) {
            toast.error("Action failed", {
                description: e.message || "Could not update the request. Please try again.",
            });
        }
    }, [entries, session]);

    const handleRefresh = () => {
        loadData();
    };

    return (
        <div className="container max-w-6xl py-10 px-4 mx-auto font-[family-name:var(--font-geist-sans)]">

            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">POC Dashboard</h1>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="gap-2"
                >
                    <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
                    {isRefreshing ? "Refreshing…" : "Refresh"}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-8 ml-[52px]">
                Review and respond to active student placement requests.
            </p>

            {/* ── Metric Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Expired", value: metrics.expired, icon: Zap, iconClass: "text-destructive/70", desc: "This week" },
                    { label: "Approved", value: metrics.approved, icon: CheckCircle2, iconClass: "text-emerald-500", desc: "This week" },
                    { label: "Pending", value: metrics.pending, icon: Clock, iconClass: "text-amber-500", desc: "This week" },
                ].map(({ label, value, icon: Icon, iconClass, desc }) => (
                    <Card key={label} className="border-border/50 bg-card/60">
                        <CardHeader className="pb-1">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
                                <Icon className={cn("size-3.5", iconClass)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold tracking-tight">{value}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Controls ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">POC</Label>
                        <Select value={pocFilter} onValueChange={setPocFilter}>
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePocs.map((poc) => (
                                    <SelectItem key={poc} value={poc} className="text-xs">{poc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Type</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="h-8 w-[150px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All" className="text-xs">All Types</SelectItem>
                                <SelectItem value="verification" className="text-xs">Verifications</SelectItem>
                                <SelectItem value="major-minor" className="text-xs">Major/Minor Change</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-1 h-4 rounded-full bg-amber-400" />
                        &lt;12h left
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-1 h-4 rounded-full bg-orange-400" />
                        &lt;6h left
                    </span>
                    <span className="flex items-center gap-1.5">
                        <AlertTriangle className="size-3 text-destructive" />
                        Emergency
                    </span>
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────────── */}
            <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                            <TableHead className="text-xs font-semibold w-[88px]">ID</TableHead>
                            <TableHead className="text-xs font-semibold">Student</TableHead>
                            <TableHead className="text-xs font-semibold w-[120px]">POC</TableHead>
                            <TableHead className="text-xs font-semibold w-[100px]">Time Left</TableHead>
                            <TableHead className="text-xs font-semibold w-[100px]">Status</TableHead>
                            <TableHead className="text-xs font-semibold w-[200px]">Messages</TableHead>
                            <TableHead className="text-xs font-semibold text-center w-[72px]">
                                <span className="text-emerald-600 dark:text-emerald-400">Approve</span>
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-center w-[64px]">
                                <span className="text-destructive">Reject</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                                    No active requests.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEntries.map((entry) => {
                                const isEmergency = entry.status === "emergency";
                                const hasViewedMsg = viewedMessages.has(entry.id);

                                return (
                                    <TableRow
                                        key={entry.id}
                                        className={cn(
                                            "border-b border-border/30 transition-colors duration-100",
                                            isEmergency
                                                ? "bg-destructive/[0.04] border-l-[3px] border-l-destructive hover:bg-destructive/[0.07]"
                                                : getRowUrgencyStyle(entry)
                                        )}
                                    >
                                        <TableCell className="font-mono text-[11px] text-muted-foreground py-3 align-middle">
                                            {entry.id}
                                        </TableCell>

                                        <TableCell className="py-3 align-middle">
                                            <p className="text-sm font-medium leading-tight">{entry.studentName}</p>
                                            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{entry.email}</p>
                                            {isEmergency && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertTriangle className="size-2.5 text-destructive" />
                                                    <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">
                                                        Emergency
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-[12px] text-muted-foreground py-3 align-middle">
                                            {entry.poc}
                                        </TableCell>

                                        <TableCell className="py-3 align-middle">
                                            <div className={cn("flex items-center gap-1.5 text-[12px] tabular-nums", getTimeColor(entry))}>
                                                <Clock className="size-3 flex-shrink-0" />
                                                {formatTimeRemaining(entry.deadline)}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3 align-middle">
                                            <StatusBadge status={entry.status} />
                                        </TableCell>

                                        <TableCell className="py-3 align-middle">
                                            <div className="flex items-center gap-0.5">
                                                <StudentMessagePopover
                                                    entry={entry}
                                                    onViewed={handleMessageViewed}
                                                    hasViewed={hasViewedMsg}
                                                />
                                                <AddNoteDialog
                                                    entry={entry}
                                                    onSave={handleSavePocMessage}
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3 align-middle text-center">
                                            <ActionButton
                                                type="approve"
                                                entry={entry}
                                                hasViewedStudentMessage={hasViewedMsg}
                                                onAction={handleAction}
                                            />
                                        </TableCell>

                                        <TableCell className="py-3 align-middle text-center">
                                            <ActionButton
                                                type="reject"
                                                entry={entry}
                                                hasViewedStudentMessage={hasViewedMsg}
                                                onAction={handleAction}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <p className="text-center text-[11px] text-muted-foreground/40 mt-6">
                Only pending and emergency requests are shown. Approved / rejected entries are removed from this view.
            </p>
        </div>
    );
}
