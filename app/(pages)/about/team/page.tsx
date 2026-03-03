import { getPageContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SectionRenderer } from "@/components/section-renderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Meet the Team — Placement Committee, Ashoka University",
    description:
        "Get to know the students behind PlaceCom — our departments, leadership, and the full team working to connect Ashoka students with the professional world.",
};

/**
 * /about/team page — powered by the content pipeline.
 *
 * Layout:
 *  1. TeamHero  — full-viewport team photo banner (type: "team-hero")
 *  2. Content   — markdown intro body (type: "content")
 *  3. TeamSection — department-wise grid loaded from departments.json (type: "team")
 */
export default function TeamPage() {
    const { frontmatter, content } = getPageContent("team");

    const hasFullBleedHero = (frontmatter.sections ?? []).some(
        (s) => s.type === "team-hero"
    );

    return (
        <main className={hasFullBleedHero ? "w-full" : "max-w-5xl mx-auto px-4 py-8"}>
            <SectionRenderer
                sections={frontmatter.sections ?? []}
                markdownContent={
                    content.trim() ? (
                        <div className="max-w-3xl mx-auto px-4 py-10">
                            <MarkdownRenderer content={content} />
                        </div>
                    ) : undefined
                }
            />
        </main>
    );
}
