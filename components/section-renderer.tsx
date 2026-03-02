import type { Section, HeroSection, StatsSection, CardsSection, ContentSection } from "@/lib/content-types";
import { cn } from "@/lib/utils";
import { AboutHero } from "@/components/about-hero";
import { AboutStats } from "@/components/about-stats";

interface SectionRendererProps {
    sections: Section[];
    /** The parsed markdown body — injected into "content" sections */
    markdownContent?: React.ReactNode;
}

/**
 * Renders an array of structured frontmatter sections.
 * Each section type maps to a designed component block.
 *
 * Every section supports an optional `className` field in frontmatter
 * that lets you override or extend the default styling.
 */
export function SectionRenderer({ sections, markdownContent }: SectionRendererProps) {
    const FULL_BLEED = new Set(["about-hero"]);
    // These section types manage their own spacing internally
    const SELF_SPACED = new Set(["about-stats", "about-hero"]);

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
                        case "hero":
                            return <HeroBlock section={section} />;
                        case "stats":
                            return <StatsBlock section={section} />;
                        case "cards":
                            return <CardsBlock section={section} />;
                        case "content":
                            return <ContentBlock section={section} markdownContent={markdownContent} />;
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
    return (
        <section className={cn("py-8", section.className)}>
            {section.heading && (
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center text-foreground mb-10">
                    {section.heading}
                </h2>
            )}
            <div
                className="grid grid-cols-2 gap-6"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
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

function CardsBlock({ section }: { section: CardsSection }) {
    const cols = section.columns ?? 2;
    return (
        <section className={cn("py-8", section.className)}>
            {section.heading && (
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center text-foreground mb-10">
                    {section.heading}
                </h2>
            )}
            <div
                className="grid grid-cols-1 gap-6"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {section.items.map((item, i) => (
                    <div
                        key={i}
                        className="group p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200"
                    >
                        {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-40 object-cover rounded-lg mb-4"
                            />
                        )}
                        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {item.title}
                        </h3>
                        {item.description && (
                            <p className="text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        )}
                        {item.href && (
                            <a
                                href={item.href}
                                className="inline-block mt-3 text-sm text-primary font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary/80 transition-colors"
                            >
                                Learn more →
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
