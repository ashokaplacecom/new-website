import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { CircleUserRound } from "lucide-react";

export const metadata = { title: "Profile – Toolbox" };

export default function ProfilePage() {
    return (
        <ToolboxPageShell
            icon={CircleUserRound}
            title="Profile"
            description="Your placement profile and account settings."
        >
            <div className="flex flex-col items-center gap-6 py-12">
                {/* Placeholder avatar */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border shadow-md bg-muted flex items-center justify-center">
                    <CircleUserRound className="w-16 h-16 text-muted-foreground/40" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold">Student Name</p>
                    <p className="text-sm text-muted-foreground">student@ashoka.edu.in</p>
                </div>
                <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-card/50 p-6 flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Batch</span>
                        <span className="font-medium">UG 2026</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Department</span>
                        <span className="font-medium">Computer Science</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium text-emerald-600">Active</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Authentication coming soon</p>
            </div>
        </ToolboxPageShell>
    );
}
