import { getPageContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SectionRenderer } from "@/components/section-renderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Connect PlaceCom",
    description:
        "The official placement portal for Ashoka University — connecting students with the professional world.",
};

export const revalidate = 0;

/**
 * Landing Page — powered by the content pipeline (home.md).
 */
export default function Home() {
    const { frontmatter, content } = getPageContent("home");

    if (frontmatter.sections && frontmatter.sections.length > 0) {
        const hasFullBleedHero = frontmatter.sections.some(
            (s) => s.type === "about-hero"
        );

        const parts = content.split(/##\s+Get\s+In\s+Touch/i);
        const aboutContent = parts[0] || "";
        const getInTouchContent = parts[1] ? `## Get In Touch\n${parts[1]}` : "";

        const markdownMap = {
            "about-us": (
                <div id="about" className="max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-4">
                    <MarkdownRenderer content={aboutContent} />
                </div>
            ),
            "get-in-touch": (
                <div id="contact" className="max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-16">
                    <MarkdownRenderer content={getInTouchContent} />
                </div>
            ),
            "default": (
                <div id="about" className="max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-16">
                    <MarkdownRenderer content={content} />
                </div>
            )
        };

        return (
            <main className={hasFullBleedHero ? "w-full" : "max-w-3xl mx-auto px-4 py-8"}>
                <SectionRenderer
                    sections={frontmatter.sections}
                    markdownContent={markdownMap}
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
            <MarkdownRenderer content={content} variant="landing" />
        </main>
    );
}
