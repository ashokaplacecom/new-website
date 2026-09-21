import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { CircleHelp } from "lucide-react";
import { FAQsClient } from "./faqs-client";
import faqsData from "@/content/data/faqs.json";

export const metadata = { title: "FAQs – Toolbox" };

export default function FAQsPage() {
    return (
        <ToolboxPageShell
            icon={CircleHelp}
            title="FAQs"
            description="Answers to commonly asked placement-related questions."
        >
            <FAQsClient faqs={faqsData} />
        </ToolboxPageShell>
    );
}
