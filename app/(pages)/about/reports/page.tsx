import { getJsonData } from "@/lib/content";
import type { Metadata } from "next";
import { ReportsTimeline } from "@/components/reports-timeline";

export const metadata: Metadata = {
    title: "Reports — Connect PlaceCom",
    description: "Monthly placement reports from the Placement Committee.",
};

interface ReportEntry {
    id: string;
    month: string;
    oneLiner: string;
    pdfEmbedUrl: string;
}

interface ReportsData {
    entries: ReportEntry[];
}

export default function ReportsPage() {
    const { entries } = getJsonData<ReportsData>("reports");

    return (
        <main className="min-h-screen w-full">
            <ReportsTimeline entries={entries} />
        </main>
    );
}