import { Library } from "lucide-react";
import { ResourceBrowser } from "@/components/resources/resource-browser";
import type { ResourceNode } from "@/types/resources";
import resourcesData from "@/content/resources.json";
import { ToolboxPageShell } from "@/components/toolbox-page-shell";

export const metadata = { title: "Resources – Toolbox" };

export default function ResourcesPage() {
    // Cast JSON to typed nodes — JSON is validated at usage, errors surface in sidebar/browser
    const nodes = resourcesData.resources as ResourceNode[];

    return (
        <ToolboxPageShell
            icon={Library}
            title="Resources"
            description="Resume templates, interview prep guides, sector overviews, and more — curated by Placecom."
            maxWidthClass="max-w-7xl"
        >
            <ResourceBrowser nodes={nodes} />
        </ToolboxPageShell>
    );
}
