import { Briefcase } from "lucide-react";
import OpportunityListing from "@/components/external-opportunities/opportunity-listing";
import { OPPORTUNITIES } from "@/components/external-opportunities/opportunities-data";

export const metadata = { title: "External Opportunities – Toolbox" };

export default function ExternalOpportunitiesPage() {
    return (
        <div className="container max-w-5xl py-10 px-4 mx-auto font-[family-name:var(--font-geist-sans)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <Briefcase className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">External Opportunities</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-8 ml-[52px]">
                Browse internships, fellowships, and jobs curated for Ashoka students. Click any card to see full details.
            </p>

            <OpportunityListing opportunities={OPPORTUNITIES} />
        </div>
    );
}
