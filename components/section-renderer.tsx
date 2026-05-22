import type { Section, HeroSection, StatsSection, CardsSection, ContentSection } from "@/lib/content-types";
import { cn } from "@/lib/utils";
import { AboutHero } from "@/components/about-hero";
import { AboutStats } from "@/components/about-stats";
import { TeamHero } from "@/components/team-hero";
import { TeamSectionBlock } from "@/components/team-section";

interface SectionRendererProps {
    sections: Section[];
    /** The parsed markdown body — injected into "content" sections */
    markdownContent?: React.ReactNode | Record<string, React.ReactNode>;
}

/**
 * Renders an array of structured frontmatter sections.
 * Each section type maps to a designed component block.
 *
 * Every section supports an optional `className` field in frontmatter
 * that lets you override or extend the default styling.
 */
export function SectionRenderer({ sections, markdownContent }: SectionRendererProps) {
    const FULL_BLEED = new Set(["about-hero", "team-hero"]);
    // These section types manage their own spacing internally
    const SELF_SPACED = new Set(["about-stats", "about-hero", "team-hero", "team", "cards"]);

    return (
        <div>
            {sections.map((section, index) => {
                const isFullBleed = FULL_BLEED.has(section.type);
                const prevType = index > 0 ? sections[index - 1].type : null;
                // No outer gap if this section or the preceding one manages its own spacing
                const noGap = isFullBleed || SELF_SPACED.has(section.type) || (prevType !== null && SELF_SPACED.has(prevType));

                const rendered = (() => {
                    switch (section.type) {
                        case "about-hero":
                            return <AboutHero section={section} />;
                        case "about-stats":
                            return <AboutStats section={section} />;
                        case "team-hero":
                            return <TeamHero section={section} />;
                        case "team":
                            return <TeamSectionBlock section={section} />;
                        case "hero":
                            return <HeroBlock section={section} />;
                        case "stats":
                            return <StatsBlock section={section} />;
                        case "cards":
                            return <CardsBlock section={section} />;
                        case "content":
                            const blockContent = (() => {
                                if (!markdownContent) return null;
                                if (
                                    typeof markdownContent === "object" &&
                                    !("props" in markdownContent) &&
                                    !("$$typeof" in markdownContent)
                                ) {
                                    const key = section.id || "default";
                                    return (markdownContent as Record<string, React.ReactNode>)[key];
                                }
                                return markdownContent as React.ReactNode;
                            })();
                            return <ContentBlock section={section} markdownContent={blockContent} />;
                        default:
                            return null;
                    }
                })();

                return (
                    <div
                        key={index}
                        className={noGap ? "" : "mt-16"}
                    >
                        {rendered}
                    </div>
                );
            })}
        </div>
    );
}


// ─── Content Section ──────────────────────────────────────────────────

function ContentBlock({ section, markdownContent }: { section: ContentSection; markdownContent?: React.ReactNode }) {
    return (
        <div className={cn(section.className)}>
            {markdownContent}
        </div>
    );
}

// ─── Hero Section ─────────────────────────────────────────────────────

function HeroBlock({ section }: { section: HeroSection }) {
    return (
        <section className={cn("relative py-16 md:py-24 text-center", section.className)}>
            {/* Subtle gradient background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl" />
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
                {section.heading}
            </h1>
            {section.subheading && (
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {section.subheading}
                </p>
            )}
            {section.cta && (
                <a
                    href={section.cta.href}
                    className="inline-flex items-center mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                >
                    {section.cta.label}
                </a>
            )}
        </section>
    );
}

// ─── Stats Section ────────────────────────────────────────────────────

function StatsBlock({ section }: { section: StatsSection }) {
    const cols = section.columns ?? Math.min(section.items.length, 4);
    const gridClass = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 sm:grid-cols-2 md:grid-cols-4",
    }[cols] ?? "grid-cols-2 sm:grid-cols-2 md:grid-cols-4";
    return (
        <section className={cn("py-8", section.className)}>
            {section.heading && (
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center text-foreground mb-10">
                    {section.heading}
                </h2>
            )}
            <div className={cn("grid gap-6", gridClass)}>
                {section.items.map((item, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                    >
                        <span className="text-3xl md:text-4xl font-bold text-primary font-mono">
                            {item.value}
                        </span>
                        <span className="text-sm text-muted-foreground mt-2 text-center">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Cards Section ────────────────────────────────────────────────────
// Rendered as an editorial numbered list — no card borders, just clean typography.

function CardsBlock({ section }: { section: CardsSection }) {
    return (
        <section
            className={cn("pt-8 pb-8 px-4", section.className)}
            id="metrics"
            aria-label="PlaceCom metrics"
        >
            <div className="max-w-2xl mx-auto">
            {section.heading && (
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-10">
                    {section.heading}
                </h2>
            )}
            <div className="flex flex-col">
                {section.items.map((item, i) => (
                    <div
                        key={i}
                        className="group grid grid-cols-[2rem_1fr] gap-x-5 gap-y-1 py-7 border-t border-border/60 last:border-b hover:border-primary/20 transition-colors duration-200"
                    >
                        {/* Index number */}
                        <span className="font-mono text-xs text-muted-foreground/50 pt-1 select-none tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                        </span>

                        <div className="flex flex-col gap-1.5">
                            {item.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-40 object-cover rounded-lg mb-3"
                                />
                            )}
                            <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                                {item.title}
                            </h3>
                            {item.description && (
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            )}
                            {item.href && (
                                <a
                                    href={item.href}
                                    className="inline-flex items-center gap-1 mt-1 text-sm text-primary font-medium hover:underline underline-offset-4 transition-colors"
                                >
                                    Learn more →
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </section>
    );
}
