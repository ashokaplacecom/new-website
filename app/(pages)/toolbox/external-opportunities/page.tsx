import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { Briefcase } from "lucide-react";

export const metadata = { title: "External Opportunities – Toolbox" };

export default function ExternalOpportunitiesPage() {
    return (
        <ToolboxPageShell
            icon={Briefcase}
            title="External Opportunities"
            description="Browse internships, jobs, and other opportunities curated for Ashoka students."
        />
    );
}
