import { Library } from "lucide-react";
import { ResourceBrowser } from "@/components/resources/resource-browser";
import type { ResourceNode } from "@/types/resources";
import resourcesData from "@/content/resources.json";
import { TextAnimate } from "@/components/ui/text-animate";


export const metadata = { title: "Resources – Toolbox" };

export default function ResourcesPage() {
    // Cast JSON to typed nodes — JSON is validated at usage, errors surface in sidebar/browser
    const nodes = resourcesData.resources as ResourceNode[];

    return (
        <div className="container max-w-7xl py-10 px-4 mx-auto font-[family-name:var(--font-geist-sans)]">
            {/* Page header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <Library className="w-5 h-5" />
                </div>
                <TextAnimate animation="slideUp" by="character" className="text-2xl font-bold tracking-tight">
                    Resources
                </TextAnimate>
            </div>
            <p className="text-sm text-muted-foreground mb-8 ml-[52px]">
                Resume templates, interview prep guides, sector overviews, and more — curated by Placecom.
            </p>

            {/* Browser */}
            <ResourceBrowser nodes={nodes} />
        </div>
    );
}
