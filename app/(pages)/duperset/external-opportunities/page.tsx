import { Briefcase, AlertCircle } from "lucide-react";
import OpportunityListing from "@/components/external-opportunities/opportunity-listing";
import { fetchExternalOpportunitiesAction } from "./actions";
import { motion } from "motion/react";
import { ToolboxPageShell } from "@/components/toolbox-page-shell";

export const metadata = { title: "External Opportunities – Toolbox" };

export default async function ExternalOpportunitiesPage() {
    const res = await fetchExternalOpportunitiesAction();
    const rawOpportunities = (res && res.success && Array.isArray(res.opportunities)) 
        ? res.opportunities 
        : [];

    const opportunities = rawOpportunities.map((item: any) => ({
        id: item.id?.toString() || Math.random().toString(),
        name: item.title || "Untitled Opportunity",
        company: item.recruiting_body || "Unknown Company",
        role: item.role || "Not Specified",
        category: item.category || "General",
        deadline: item.deadline || "TBD",
        compensation: item.compensation || "Not Specified",
        duration: item.duration || "Not Specified",
        eligibility: item.eligibility || "Not Specified",
        skills: Array.isArray(item.skills) ? item.skills : [],
        jdUrl: item.jd_link || null,
        applyUrl: item.apply_url || null,
    }));

    return (
        <ToolboxPageShell
            icon={Briefcase}
            title="External Opportunities"
            description="Browse internships, fellowships, and jobs curated for Ashoka students. Click any card to see full details."
            maxWidthClass="max-w-5xl"
        >
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
        </ToolboxPageShell>
    );
}
