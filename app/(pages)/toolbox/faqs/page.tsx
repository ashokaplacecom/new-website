import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { CircleHelp } from "lucide-react";

export const metadata = { title: "FAQs – Toolbox" };

export default function FAQsPage() {
    return (
        <ToolboxPageShell
            icon={CircleHelp}
            title="FAQs"
            description="Answers to commonly asked placement-related questions."
        />
    );
}
