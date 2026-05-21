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
            <div className={cn(
                "w-full py-8 gap-8",
                latestRequest ? "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto" : "max-w-md mx-auto"
            )}>
                {/* Left Column: User Profile Card */}
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
                </div>

                {/* Right Column: Latest Request */}
                {latestRequest && (
                    <div className="flex flex-col">
                        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-8 shadow-xl flex flex-col justify-between h-full min-h-[300px]">
                            {/* Ambient glow decoration */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold tracking-wider uppercase">
                                        Latest Request
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(latestRequest.raised_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Request Type</p>
                                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                        {latestRequest.type}
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Status</p>
                                    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider w-fit", getStatusTextClass(latestRequest.status))}>
                                        {getStatusIcon(latestRequest.status)}
                                        {latestRequest.status}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                                {/* <span>Procured via Server Action</span> */}
                                <Link href="/duperset/view-requests" className="flex items-center gap-1 font-semibold text-primary hover:underline">
                                    View All <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolboxPageShell>
    );
}
