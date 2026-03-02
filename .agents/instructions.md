# PlaceCom Website — Agent Instructions

> **For Antigravity.** Read this before doing anything in this repo.

---

## Project Overview

The **Connect PlaceCom** website for Ashoka University's Placement Committee. Built with:

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Tailwind CSS v4** (with `tw-animate-css`)
- **shadcn/ui** (new-york style, `@shadcn` + `@shadcnblocks` registries)
- **Framer Motion** (`motion` package)
- **react-markdown** + **gray-matter** for content pipeline
- Deployed on **Vercel**

---

## Repo Structure

```
app/
├── layout.tsx            ← Root layout (Navbar, fonts)
├── globals.css           ← Tailwind v4 theme tokens (oklch colors, fonts, etc.)
├── page.tsx              ← Homepage entry
├── (pages)/              ← Route group for standard pages
│   ├── page.tsx          ← Landing / index within (pages)
│   └── about/page.tsx    ← Example markdown-powered page

components/
├── ui/                   ← shadcn components (DO NOT edit manually)
├── markdown-renderer.tsx ← Custom Markdown → React (styled to design system)
├── section-renderer.tsx  ← Frontmatter sections → designed UI blocks
└── navbar1.tsx           ← Site navigation

content/
├── pages/                ← Markdown page content (.md with YAML frontmatter)
└── data/                 ← Structured JSON data files

lib/
├── content.ts            ← Content loader functions (getPageContent, getJsonData, etc.)
├── content-types.ts      ← TypeScript interfaces for content pipeline
└── utils.ts              ← cn() helper

types/                    ← Shared TypeScript types
```

---

## Content Pipeline (Markdown + JSON)

Full documentation in `CONTENT_PIPELINE.md`. Key points:

### Creating a new page

1. Add a `.md` file to `content/pages/`
2. Use YAML frontmatter for structured sections (hero, stats, cards, content)
3. Create a Next.js page that calls `getPageContent("slug")`
4. Render with `<SectionRenderer>` + `<MarkdownRenderer>`

### Available utilities

| Function | Source | Purpose |
|----------|--------|---------|
| `getPageContent(slug)` | `lib/content.ts` | Load markdown page by slug |
| `getNestedPageContent(...segments)` | `lib/content.ts` | Load nested markdown paths |
| `getAllPageSlugs()` | `lib/content.ts` | List all page slugs |
| `getAllPages()` | `lib/content.ts` | All slugs + frontmatter |
| `getJsonData<T>(name)` | `lib/content.ts` | Load typed JSON from `content/data/` |

### Section types (in frontmatter)

`hero`, `stats`, `cards`, `content` — each supports `className` for per-section Tailwind overrides. Stats and cards support `columns`. See `lib/content-types.ts` for interfaces.

### Markdown rendering

`<MarkdownRenderer>` has custom component overrides for every HTML element. Styling lives in `components/markdown-renderer.tsx`. Edits there affect all markdown pages globally.

---

## Backend / API Pattern

### Server Actions

All API calls go through **Next.js Server Actions**. The backend is a **Google Apps Script** based API.

Pattern for every data-fetching feature:

```
lib/actions/       ← Server action files ("use server")
lib/actions/foo.ts ← Each action calls the Apps Script API endpoint
```

### Frontend Data Strategy

1. **Cache first:** Show cached/stale data immediately on page load
2. **Fetch in background:** Call server action to get fresh data
3. **Update UI:** Replace cached data with fresh response seamlessly
4. **Optimistic UI:** For mutations (forms, toggles), update the UI immediately before the server responds. Roll back on error.
5. **Loading states:** Always show skeleton/shimmer states while data is loading. Never show a blank page.

Use `React.useOptimistic`, `useTransition`, and `React.cache` where applicable.

---

## Component Rules

### shadcn/ui — ALWAYS use the CLI

The `@mcp:shadcn:` MCP is available. **Do not write shadcn component code manually.** For every new component:

1. Use `mcp_shadcn_search_items_in_registries` to find the component
2. Use `mcp_shadcn_get_add_command_for_items` to get the CLI command
3. Run the CLI command to install
4. Import from `@/components/ui/`

Available registries: `@shadcn`, `@shadcnblocks` (more may be added to `components.json`).

### Custom components

Build on top of shadcn primitives. Never reinvent buttons, inputs, cards, dialogs, etc. Compose them:

```tsx
// ✅ Good — wraps shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ❌ Bad — custom <button> with ad-hoc styles
<button className="bg-primary px-4 py-2 rounded">Click</button>
```

---

## Design & Styling Rules

### Use the frontend-design skill

When creating any new page or significant UI component, use the `frontend-design` skill for best practices on layout, typography, spacing, and visual hierarchy.

### Design tokens

All colors, fonts, radii, and shadows are defined as CSS custom properties in `globals.css`. Use Tailwind's semantic classes (`text-primary`, `bg-card`, `border-border`, etc.) — never hardcode colors.

### Typography

- **Serif headings:** `font-serif` → Playfair Display
- **Body text:** `font-sans` → Noto Serif Georgian
- **Monospace:** `font-mono` → system monospace stack

### Aesthetic bar

- Pages must look premium and polished, not like MVPs
- Use subtle gradients, hover transitions, and shadows
- Micro-animations via Framer Motion where they add value
- No placeholder content in production

---

## Code Standards

### Modularity

- **Reuse before creating.** Check existing components, utilities, and types before building new ones.
- **One concern per file.** A component file should do one thing.
- **Shared types** go in `types/` or `lib/content-types.ts`.

### Documentation

- Every exported function and component gets a JSDoc comment explaining what it does.
- Keep code comments minimal — explain *why*, not *what*.
- **Update `CONTENT_PIPELINE.md`** when making significant additions to the content system.
- **Update this file** when adding new architectural patterns, registries, or backend integrations. Don't update after every small change — only when the overall structure or conventions shift.

### TypeScript

- Strict mode is on. No `any` types.
- Prefer interfaces over type aliases for object shapes.
- Use generics for reusable utilities (see `getJsonData<T>`).

---

## Quick Reference

| I want to... | Do this |
|--------------|---------|
| Add a markdown page | Create `content/pages/foo.md` + `app/(pages)/foo/page.tsx` |
| Add structured data | Create `content/data/bar.json`, call `getJsonData<T>("bar")` |
| Add a new section type | Add interface to `content-types.ts`, add case to `section-renderer.tsx` |
| Install a shadcn component | Use `mcp_shadcn_get_add_command_for_items` → run CLI |
| Call the backend | Create server action in `lib/actions/`, cache + optimistic on frontend |
| Change markdown styling | Edit component overrides in `markdown-renderer.tsx` |
| Change site colors/fonts | Edit `globals.css` root variables |
