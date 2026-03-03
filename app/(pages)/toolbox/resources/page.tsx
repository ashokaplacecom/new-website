import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { Library } from "lucide-react";

export const metadata = { title: "Resources – Toolbox" };

export default function ResourcesPage() {
    return (
        <ToolboxPageShell
            icon={Library}
            title="Resources"
            description="Resume templates, interview prep guides, and more — curated by Placecom."
        />
    );
}
