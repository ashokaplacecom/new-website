import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PageContent, PageFrontmatter } from "./content-types";

// ─── Paths ──────────────────────────────────────────────────────────

const CONTENT_DIR = path.join(process.cwd(), "content");
const PAGES_DIR = path.join(CONTENT_DIR, "pages");
const DATA_DIR = path.join(CONTENT_DIR, "data");

// ─── Page Content (Markdown + Frontmatter) ──────────────────────────

/**
 * Load a single markdown page by slug.
 * Looks for `content/pages/{slug}.md`
 */
export function getPageContent(slug: string): PageContent {
    const filePath = path.join(PAGES_DIR, `${slug}.md`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
        frontmatter: data as PageFrontmatter,
        content,
    };
}

/**
 * Load a nested page by path segments.
 * e.g. getNestedPageContent("resources", "faq") → content/pages/resources/faq.md
 */
export function getNestedPageContent(...segments: string[]): PageContent {
    const filePath = path.join(PAGES_DIR, ...segments.slice(0, -1), `${segments[segments.length - 1]}.md`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
        frontmatter: data as PageFrontmatter,
        content,
    };
}

/**
 * List all page slugs (for generating static paths, sitemaps, etc.)
 */
export function getAllPageSlugs(): string[] {
    if (!fs.existsSync(PAGES_DIR)) return [];
    return fs
        .readdirSync(PAGES_DIR)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));
}

/**
 * List all pages with their frontmatter (no body content — lightweight).
 */
export function getAllPages(): { slug: string; frontmatter: PageFrontmatter }[] {
    return getAllPageSlugs().map((slug) => {
        const { frontmatter } = getPageContent(slug);
        return { slug, frontmatter };
    });
}

// ─── JSON Data ──────────────────────────────────────────────────────

/**
 * Load a JSON data file by name.
 * Looks for `content/data/{name}.json`
 *
 * Usage:
 *   const team = getJsonData<TeamMember[]>("team");
 *   const stats = getJsonData<Stats>("stats");
 */
export function getJsonData<T>(name: string): T {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
}
