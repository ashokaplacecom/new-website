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
    | CardsSection
    | AboutHeroSection
    | AboutStatsSection
    | TeamHeroSection
    | TeamSection;

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

/** Full-viewport hero section for the About page */
export interface AboutHeroSection extends SectionBase {
    type: "about-hero";
    heading: string;
    subheading?: string;
    /** Path or URL for the team photo background. Falls back to gradient if omitted. */
    backgroundImage?: string;
    cta?: { label: string; href: string };
    /** Secondary CTA link (e.g., "Meet the Team") */
    secondaryCta?: { label: string; href: string };
}

/** Animated stats grid for the About page */
export interface AboutStatsSection extends SectionBase {
    type: "about-stats";
    heading?: string;
    subheading?: string;
    items: {
        label: string;
        /** Numeric value to count up to */
        value: number;
        /** Optional suffix appended after the number (e.g., "+", "L", "%") */
        suffix?: string;
        /** Optional prefix (e.g., "₹") */
        prefix?: string;
    }[];
    columns?: number;
}

/** Full-viewport hero for the Team page with team photo background */
export interface TeamHeroSection extends SectionBase {
    type: "team-hero";
    heading: string;
    subheading?: string;
    /** Path for the team photo. Falls back to gradient placeholder if omitted. */
    backgroundImage?: string;
}

/** Signal section — renders all departments from content/data/departments.json */
export interface TeamSection extends SectionBase {
    type: "team";
}

// ─── Department Data Types (loaded from departments.json) ────────────

export interface DepartmentLeader {
    name: string;
    role: string;
    /** Path to headshot image */
    image: string;
}

export interface DepartmentMember {
    name: string;
    role: string;
}

export interface Department {
    id: string;
    name: string;
    writeup: string;
    leaders: DepartmentLeader[];
    members: DepartmentMember[];
}
