import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { ScrollText } from "lucide-react";

export const metadata = { title: "View Requests – Toolbox" };

export default function ViewRequestsPage() {
    return (
        <ToolboxPageShell
            icon={ScrollText}
            title="View Requests"
            description="Track the status of your active and past requests."
        />
    );
}
