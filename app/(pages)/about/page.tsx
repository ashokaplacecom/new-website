import { getPageContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SectionRenderer } from "@/components/section-renderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About — Connect PlaceCom",
    description:
        "Learn about the Placement Committee of Ashoka University — our mission, metrics, and how we bridge students with the professional world.",
};

export const revalidate = 0;

/**
 * About page — powered by the content pipeline.
 *
 * The `about-hero` section renders full-width (edge-to-edge), so we strip the
 * max-width wrapper from the `<main>` tag and instead let each section control
 * its own width via their className props.
 */
export default function AboutPage() {
    const { frontmatter, content } = getPageContent("about");

    if (frontmatter.sections && frontmatter.sections.length > 0) {
        // Detect if there's a full-viewport section (about-hero) to decide layout
        const hasFullBleedHero = frontmatter.sections.some(
            (s) => s.type === "about-hero"
        );

        return (
            <main className={hasFullBleedHero ? "w-full" : "max-w-5xl mx-auto px-4 py-8"}>
                <SectionRenderer
                    sections={frontmatter.sections}
                    markdownContent={
                        <div id="about" className="max-w-5xl mx-auto px-4">
                            <MarkdownRenderer content={content} />
                        </div>
                    }
                />
            </main>
        );
    }

    // Fallback: no sections — render title + markdown body
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
