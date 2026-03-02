import { getPageContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SectionRenderer } from "@/components/section-renderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Connect PlaceCom",
    description:
        "The official placement portal for Ashoka University — connecting students with the professional world.",
};

/**
 * Landing Page — powered by the content pipeline (home.md).
 */
export default function Home() {
    const { frontmatter, content } = getPageContent("home");

    if (frontmatter.sections && frontmatter.sections.length > 0) {
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
