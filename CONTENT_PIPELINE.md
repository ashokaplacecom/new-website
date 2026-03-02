# Content Pipeline

This project uses a modular content pipeline where page content lives in **Markdown** and **JSON** files, and is rendered through custom React components.

## Directory Structure

```
content/
├── pages/           ← Markdown pages (one .md file = one page)
│   └── about.md
└── data/            ← Structured JSON data (team lists, stats, etc.)
    └── team.json

lib/
├── content.ts       ← Loader functions
└── content-types.ts ← TypeScript interfaces

components/
├── markdown-renderer.tsx  ← Markdown → styled React
└── section-renderer.tsx   ← Frontmatter sections → designed blocks
```

---

## Creating a Page

### 1. Write the markdown file

Create a `.md` file in `content/pages/`:

```md
<!-- content/pages/resources.md -->
---
title: "Resources"
description: "Career resources for students"
sections:
  - type: hero
    heading: "Career Resources"
    subheading: "Everything you need to succeed"
  - type: content
---

## Interview Prep

Tips and materials for mock interviews...
```

The YAML frontmatter defines structured sections that render as designed UI blocks. The markdown body after `---` is freeform content.

### 2. Create the Next.js page

```tsx
// app/(pages)/resources/page.tsx
import { getPageContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SectionRenderer } from "@/components/section-renderer";

export default function ResourcesPage() {
  const { frontmatter, content } = getPageContent("resources");

  if (frontmatter.sections?.length) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <SectionRenderer
          sections={frontmatter.sections}
          markdownContent={<MarkdownRenderer content={content} />}
        />
      </main>
    );
  }

  // Fallback: no sections — just render title + body
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-4xl font-bold mb-8">{frontmatter.title}</h1>
      <MarkdownRenderer content={content} />
    </main>
  );
}
```

---

## Loader Functions

All functions in `lib/content.ts`:

| Function | What it does |
|----------|-------------|
| `getPageContent(slug)` | Load `content/pages/{slug}.md` → `{ frontmatter, content }` |
| `getNestedPageContent(...segments)` | Load nested paths like `content/pages/resources/faq.md` |
| `getAllPageSlugs()` | List all `.md` slugs (for sitemaps, static paths) |
| `getAllPages()` | All slugs + frontmatter (lightweight, no body) |
| `getJsonData<T>(name)` | Load `content/data/{name}.json` with type safety |

### JSON data example

```tsx
interface TeamMember {
  name: string;
  role: string;
  batch: string;
}

const team = getJsonData<TeamMember[]>("team");
```

---

## Section Types

Sections are structured layout blocks defined in YAML frontmatter. Each maps to a designed React component.

### `hero`

Full-width heading + subheading + optional CTA button.

```yaml
- type: hero
  heading: "Welcome"
  subheading: "Optional subtitle text"
  cta:
    label: "Get Started"
    href: "/apply"
```

### `stats`

Grid of stat cards (value + label).

```yaml
- type: stats
  heading: "By the Numbers"
  columns: 3          # optional, default = number of items (max 4)
  items:
    - label: "Students"
      value: "300+"
    - label: "Partners"
      value: "80+"
    - label: "Package"
      value: "₹12L"
```

### `cards`

Grid of content cards (title + description + optional image/link).

```yaml
- type: cards
  heading: "What We Do"
  columns: 3          # optional, default = 2
  items:
    - title: "Campus Placements"
      description: "End-to-end recruitment drives"
      href: "/placements"
    - title: "Career Resources"
      description: "Resume reviews and workshops"
      image: "/images/resources.jpg"
```

### `content`

Slot for the freeform markdown body.

```yaml
- type: content
```

---

## Customizing Sections

### Per-section styling via `className`

Every section type accepts an optional `className` field. This lets you add Tailwind classes to override the default styling — directly from the YAML, without touching code.

```yaml
sections:
  # Left-aligned hero instead of centered
  - type: hero
    heading: "About Us"
    className: "text-left"

  # Full-width content (remove max-width constraint)
  - type: content
    className: "max-w-none"

  # Custom background on stats
  - type: stats
    heading: "Numbers"
    className: "bg-primary/5 rounded-2xl p-8"
    items:
      - label: "Users"
        value: "1000+"
```

The `className` is merged with the section's default classes using `cn()` (from `tailwind-merge`), so your overrides take precedence.

### Grid columns

Stats and cards sections accept a `columns` field to control the grid layout:

```yaml
- type: cards
  columns: 3   # 3-column grid instead of the default 2
  items: [...]
```

### Deeper customization

For one-off layouts that don't fit the section system, you have two options:

1. **Add a new section type:** Define a new interface in `content-types.ts`, add a new `case` in `section-renderer.tsx`, and use it in YAML.

2. **Build the page directly:** Skip sections entirely — just use `<MarkdownRenderer>` for the body and compose your own layout in the page component:

```tsx
export default function CustomPage() {
  const { frontmatter, content } = getPageContent("custom");

  return (
    <main>
      {/* Your completely custom layout here */}
      <div className="grid grid-cols-2 gap-12">
        <div>
          <MarkdownRenderer content={content} />
        </div>
        <aside>
          {/* sidebar, images, etc. */}
        </aside>
      </div>
    </main>
  );
}
```

---

## Markdown Styling

The `<MarkdownRenderer>` component renders markdown with custom-styled React components for every HTML element (headings, paragraphs, lists, tables, code blocks, images, blockquotes, links). These styles are defined in `components/markdown-renderer.tsx`.

To change how a specific markdown element renders across all pages, edit the `components` object in that file.
