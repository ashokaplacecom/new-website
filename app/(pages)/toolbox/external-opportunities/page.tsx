import { Briefcase, AlertCircle } from "lucide-react";
import OpportunityListing from "@/components/external-opportunities/opportunity-listing";
import { fetchExternalOpportunitiesAction } from "./actions";

export const metadata = { title: "External Opportunities – Toolbox" };

export default async function ExternalOpportunitiesPage() {
    const res = await fetchExternalOpportunitiesAction();
    const opportunities = (res && res.success && Array.isArray(res.opportunities)) 
        ? res.opportunities 
        : [];

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

            {opportunities.length > 0 ? (
                <OpportunityListing opportunities={opportunities} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed bg-muted/30">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">No opportunities available</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        There are currently no external opportunities listed. Please check back later.
                    </p>
                </div>
            )}
        </div>
    );
}
