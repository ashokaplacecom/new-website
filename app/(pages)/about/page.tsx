import { getPageContent, getJsonData } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SectionRenderer } from "@/components/section-renderer";
import { TeamMemberCard } from "@/components/team-member-card";
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

    let teamData: { members: any[], title?: string, subtitle?: string } = { members: [] };
    try {
        teamData = getJsonData<{ members: any[], title?: string, subtitle?: string }>("team");
    } catch (e) {
        // Ignore if missing
    }

    const teamSection = (
        <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto border-t border-border mt-16">
            <div className="mb-12 text-center">
                <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                    {teamData.title || "Meet the Team"}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {teamData.subtitle || "The people who set the questions and hold the standard."}
                </p>
            </div>

            {teamData.members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                    {teamData.members.map((member: any, index: number) => (
                        <TeamMemberCard key={index} member={member} />
                    ))}
                </div>
            ) : null}
        </section>
    );

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
                {teamSection}
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
            {teamSection}
        </main>
    );
}
