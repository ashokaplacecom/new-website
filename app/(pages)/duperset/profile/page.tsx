import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { CircleUserRound, Shield, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { auth } from "@/auth";
import { fetchMyRequestsAction } from "../view-requests/actions";
import { getStudentByEmail } from "@/lib/supabase/db/students";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Profile – Toolbox" };

function parseBatch(email: string) {
    const match = email.match(/_([a-zA-Z]+)(\d{2})@/);
    if (match) {
        const type = match[1].toUpperCase();
        const year = "20" + match[2];
        return `${type} ${year}`;
    }
    return "UG 2026";
}

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

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        return (
            <ToolboxPageShell
                icon={CircleUserRound}
                title="Profile"
                description="Your placement profile and account settings."
            >
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <p className="text-muted-foreground">Please sign in to view your profile details.</p>
                </div>
            </ToolboxPageShell>
        );
    }

    const email = session.user.email || "";
    const name = session.user.name || "Student";
    const userId = session.user.id || "N/A";
    const batch = parseBatch(email);
    const role = session.user.isAdmin ? "Admin" : session.user.isPoc ? "POC" : "Student";

    // Get the student's database ID if available
    const student = await getStudentByEmail(email);
    const dbUserId = student ? student.id : userId;

    const data = await fetchMyRequestsAction();

    const allRequests: Array<{
        type: string;
        raised_at: string;
        status: string;
    }> = [];

    if (data) {
        if (data.verifications.active) {
            allRequests.push({
                type: "Verification Request",
                raised_at: data.verifications.active.raised_at,
                status: data.verifications.active.status
            });
        }
        if (data.majorMinor.active) {
            allRequests.push({
                type: "Programme Change Request",
                raised_at: data.majorMinor.active.raised_at,
                status: data.majorMinor.active.status
            });
        }
        data.verifications.archives.forEach((req: any) => {
            allRequests.push({
                type: "Verification Request",
                raised_at: req.raised_at,
                status: req.status
            });
        });
        data.majorMinor.archives.forEach((req: any) => {
            allRequests.push({
                type: "Programme Change Request",
                raised_at: req.raised_at,
                status: req.status
            });
        });

        // Sort descending by date
        allRequests.sort((a, b) => new Date(b.raised_at).getTime() - new Date(a.raised_at).getTime());
    }

    const latestRequest = allRequests[0] || null;

    return (
        <ToolboxPageShell
            icon={CircleUserRound}
            title="Profile"
            description="Your placement profile and account settings."
        >
            <div className="w-full py-8 max-w-md mx-auto">
                {/* User Profile Card */}
                <div className="flex flex-col items-center justify-center border border-border/50 bg-card/30 backdrop-blur-md rounded-3xl p-8 shadow-xl space-y-6">
                    {/* Avatar with Ring */}
                    <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 border border-border shadow-md bg-muted flex items-center justify-center">
                        {session.user.image ? (
                            <img src={session.user.image} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <CircleUserRound className="w-16 h-16 text-muted-foreground/40" />
                        )}
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">{name}</h2>
                        <p className="text-sm text-muted-foreground">{email}</p>
                    </div>

                    {/* User details */}
                    <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-card/50 p-6 flex flex-col gap-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Batch</span>
                            <span className="font-semibold text-foreground">{batch}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Role</span>
                            <span className="font-semibold text-foreground capitalize">{role}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground font-medium shrink-0">Student ID</span>
                            <span className="font-bold text-xs text-foreground truncate max-w-[180px]" title={String(dbUserId)}>{dbUserId}</span>
                        </div>
                    </div>

                    {/* Latest Request Section */}
                    {latestRequest && (
                        <div className="w-full max-w-sm pt-5 border-t border-border/50 flex flex-col gap-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase">
                                    Latest Request
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(latestRequest.raised_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 flex-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Type</p>
                                    <p className="font-semibold text-foreground leading-snug">{latestRequest.type}</p>
                                </div>
                                <div className="space-y-1 text-right shrink-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                                    <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider w-fit ml-auto", getStatusTextClass(latestRequest.status))}>
                                        {getStatusIcon(latestRequest.status)}
                                        {latestRequest.status}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <Link href="/duperset/view-requests" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                                    View All Requests <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ToolboxPageShell>
    );
}
