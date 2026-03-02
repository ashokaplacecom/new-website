// ─── Page Content Types ─────────────────────────────────────────────

export interface PageContent {
    frontmatter: PageFrontmatter;
    content: string; // raw markdown body
}

export interface PageFrontmatter {
    title: string;
    description?: string;
    sections?: Section[];
    [key: string]: unknown;
}

// ─── Section Types (structured layout blocks in frontmatter) ────────
//
// Every section supports an optional `className` field that lets you
// add/override Tailwind classes from the markdown frontmatter.
// Example in YAML:
//   - type: hero
//     heading: "Hello"
//     className: "text-left"

export type Section =
    | HeroSection
    | ContentSection
    | StatsSection
    | CardsSection;

/** Shared base for all section types */
interface SectionBase {
    /** Extra Tailwind classes merged onto the section wrapper */
    className?: string;
}

export interface HeroSection extends SectionBase {
    type: "hero";
    heading: string;
    subheading?: string;
    image?: string;
    cta?: { label: string; href: string };
}

export interface ContentSection extends SectionBase {
    type: "content";
    // The markdown body content gets rendered here
}

export interface StatsSection extends SectionBase {
    type: "stats";
    heading?: string;
    items: { label: string; value: string }[];
    /** Number of columns on desktop (default: number of items, max 4) */
    columns?: number;
}

export interface CardsSection extends SectionBase {
    type: "cards";
    heading?: string;
    items: CardItem[];
    /** Number of columns on desktop (default: 2) */
    columns?: number;
}

export interface CardItem {
    title: string;
    description?: string;
    image?: string;
    href?: string;
}
