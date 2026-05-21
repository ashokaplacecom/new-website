import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { VerificationForm } from "@/components/verification-form";
import { BadgeCheck } from "lucide-react";

export const metadata = { title: "Verifications – Toolbox" };

export default function VerificationsPage() {
    return (
        <ToolboxPageShell
            icon={BadgeCheck}
            title="Verifications"
            description="Submit and track placement-related verification requests."
        >
            <VerificationForm />
        </ToolboxPageShell>
    );
}
