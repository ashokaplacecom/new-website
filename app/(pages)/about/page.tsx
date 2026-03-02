import { getPageContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SectionRenderer } from "@/components/section-renderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About — Placement Committee",
    description:
        "Learn about the Placement Committee of Ashoka University.",
};

export default function AboutPage() {
    const { frontmatter, content } = getPageContent("about");

    // If the page defines structured sections, use the SectionRenderer
    // with the markdown body slotted into "content" type sections.
    if (frontmatter.sections && frontmatter.sections.length > 0) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-8">
                <SectionRenderer
                    sections={frontmatter.sections}
                    markdownContent={<MarkdownRenderer content={content} />}
                />
            </main>
        );
    }

    // Fallback: no structured sections — render title + markdown body
    return (
        <main className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-8">
                {frontmatter.title}
            </h1>
            {frontmatter.description && (
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                    {frontmatter.description}
                </p>
            )}
            <MarkdownRenderer content={content} />
        </main>
    );
}
