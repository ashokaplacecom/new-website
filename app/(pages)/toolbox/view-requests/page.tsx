import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { ScrollText, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { fetchMyRequestsAction } from "./actions";
import { cn } from "@/lib/utils";

export const metadata = { title: "View Requests – Toolbox" };

type RequestData = {
    raised_at: string;
    status: string;
};

function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
        case "approved":
            return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        case "rejected":
            return <XCircle className="h-4 w-4 text-destructive" />;
        default:
            return <Clock className="h-4 w-4 text-amber-500" />;
    }
}

function getStatusTextClass(status: string) {
    switch (status.toLowerCase()) {
        case "approved":
            return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50";
        case "rejected":
            return "text-destructive bg-destructive/10 border-destructive/20";
        default:
            return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50";
    }
}

export default async function ViewRequestsPage() {
    const data = await fetchMyRequestsAction();

    if (!data) {
        return (
            <ToolboxPageShell
                icon={ScrollText}
                title="View Requests"
                description="Track the status of your active and past requests."
            >
                <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center rounded-2xl border bg-card">
                    <p className="text-sm text-muted-foreground">Please sign in to view your requests.</p>
                </div>
            </ToolboxPageShell>
        );
    }

    const hasNoRequests = 
        !data.verifications.active && 
        !data.majorMinor.active &&
        data.verifications.archives.length === 0 &&
        data.majorMinor.archives.length === 0;

    return (
        <ToolboxPageShell
            icon={ScrollText}
            title="View Requests"
            description="Track the status of your active and past requests."
        >
            <div className="w-full max-w-2xl mx-auto space-y-6">
                {hasNoRequests ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center rounded-2xl border bg-card p-6">
                        <div className="p-3 bg-muted rounded-full">
                            <FileText className="h-8 w-8 text-muted-foreground/70" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">No requests found</p>
                            <p className="text-xs text-muted-foreground">You don't have any active or past requests.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Verifications Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Verifications
                            </h3>
                            <div className="grid gap-3">
                                {data.verifications.active && (
                                    <div className="p-4 rounded-xl border-2 border-primary/20 bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                Verification Request
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">LATEST</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Raised: {new Date(data.verifications.active.raised_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider w-fit", getStatusTextClass(data.verifications.active.status))}>
                                            {getStatusIcon(data.verifications.active.status)}
                                            {data.verifications.active.status}
                                        </div>
                                    </div>
                                )}
                                {data.verifications.archives.map((req: RequestData, i: number) => (
                                    <div key={i} className="p-4 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Verification Request</p>
                                            <p className="text-xs text-muted-foreground/80">
                                                Raised: {new Date(req.raised_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider w-fit", getStatusTextClass(req.status))}>
                                            {getStatusIcon(req.status)}
                                            {req.status}
                                        </div>
                                    </div>
                                ))}
                                {!data.verifications.active && data.verifications.archives.length === 0 && (
                                    <div className="p-4 rounded-xl border border-dashed bg-muted/30 text-center">
                                        <p className="text-xs text-muted-foreground italic">No verification requests.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Major / Minor Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Programme Changes
                            </h3>
                            <div className="grid gap-3">
                                {data.majorMinor.active && (
                                    <div className="p-4 rounded-xl border-2 border-primary/20 bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                Programme Change Request
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">LATEST</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Raised: {new Date(data.majorMinor.active.raised_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider w-fit", getStatusTextClass(data.majorMinor.active.status))}>
                                            {getStatusIcon(data.majorMinor.active.status)}
                                            {data.majorMinor.active.status}
                                        </div>
                                    </div>
                                )}
                                {data.majorMinor.archives.map((req: RequestData, i: number) => (
                                    <div key={i} className="p-4 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Programme Change Request</p>
                                            <p className="text-xs text-muted-foreground/80">
                                                Raised: {new Date(req.raised_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider w-fit", getStatusTextClass(req.status))}>
                                            {getStatusIcon(req.status)}
                                            {req.status}
                                        </div>
                                    </div>
                                ))}
                                {!data.majorMinor.active && data.majorMinor.archives.length === 0 && (
                                    <div className="p-4 rounded-xl border border-dashed bg-muted/30 text-center">
                                        <p className="text-xs text-muted-foreground italic">No programme change requests.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </ToolboxPageShell>
    );
}
