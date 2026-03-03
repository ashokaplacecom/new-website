import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { BadgeCheck } from "lucide-react";

export const metadata = { title: "Verifications – Toolbox" };

export default function VerificationsPage() {
    return (
        <ToolboxPageShell
            icon={BadgeCheck}
            title="Verifications"
            description="Submit and track placement-related verification requests."
        />
    );
}
