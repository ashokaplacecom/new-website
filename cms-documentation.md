# CMS (Content Management System)

**Route: placecom.ashoka.edu.in/backend**

---

## What is the CMS?

The CMS (Content Management System) is a dashboard that lets you update the website's content — text, images, team members, podcast episodes, reports — without touching any code. Think of it as the "edit mode" for the website. Instead of asking a developer to change something, whoever has access can log in, make the update, and push it live themselves.

The backend dashboard has exactly two things on it: a **CMS Editor** button and a **Sync to GitHub** button. You always use them in that order.

---

## Access

Both `/backend` and `/keystatic` are admin-only. The middleware enforces two checks:

1. You must be logged in with a valid session. If not, you get redirected to `/login`.
2. Your account must have the `isAdmin` flag set to `true`. If you're logged in but not an admin, you get redirected to the home page silently.

Regular PlaceCom members and even POCs cannot access the CMS. Only accounts explicitly marked as admin in the database can get in. If someone needs CMS access, a developer needs to set `isAdmin = true` on their account.

---

## The Exact Flow

This is the most important thing to understand. **Saving in the CMS does not update the live website.** Saving writes the changes to the server's local files. You then have to sync those changes to GitHub, which triggers the deployment that actually updates what visitors see.

**Step 1 — Open the CMS Editor**
Go to `/backend` and click "Launch CMS Editor." This takes you to the Keystatic editor at `/keystatic`.

**Step 2 — Make your changes**
Edit whatever you need to (more on what's available below). When you're done with a section, hit **Save**. You'll see a confirmation. You can save multiple things before syncing.

**Step 3 — Go back to /backend and sync**
Once you've made all your changes, go back to `/backend` and click **"Push Edits to GitHub."** This commits your saved changes and pushes them to GitHub. A deployment kicks off automatically, and the live site updates within a couple of minutes.

**If you skip Step 3, nothing changes on the live site.** This is the most common mistake. Always sync after editing.

---

## What You Can Edit in the CMS

The CMS editor has two sections in the sidebar: **Pages** and **Data.**

### Pages

These control the written content and layout of the main public pages.

**Home Page** — The landing page. You can edit the heading, subheading, background image, and CTA buttons on the hero banner. You can add or edit a stats block (e.g. "300+ students placed"). You can edit the body text (the "About Us" and "Get In Touch" sections). You can also add or remove entire sections — hero, stats, cards, or plain content blocks.

**About Page** — The about page layout and body copy.

**Podcast Page** — The intro text and heading shown at the top of the podcast page.

**Team Page** — The heading and intro copy shown above the team grid.

### Data

These control structured information that appears on the website — lists, entries, contact details, etc.

**Contact Information** — The email addresses and phone numbers shown on the Contact page. Add, edit, or remove entries here. Changes here take effect on the form page after syncing.

**Recruiting Partners** — The list of companies PlaceCom has worked with. Each entry has a name and an optional logo URL. If no logo is provided, the company name shows as text.

**Podcast Episodes** — Add or remove podcast episodes. Each episode needs a title, a Spotify embed URL, and a short description. The Spotify embed URL is the "embed" link you get from Spotify's share options on a podcast episode.

**Monthly Reports** — The timeline of placement reports on the Reports page. Each entry needs a slug (a short URL-safe ID like `march-2025`), a month label (like "March 2025"), a one-line summary, and a Google Drive PDF embed link.

**Team Members** — Individual member entries with name, role, batch year, and a photo upload.

**Departments** — Department entries with a name, a writeup, department leaders (with photos), and a list of regular members.

**Resources Library** — The resources available inside Duperset. Each resource can be a file or a folder, with a URL, description, and optional badges. Nested folders are supported but require pasting JSON manually into the Children field (this one is a bit fiddly — ask a developer if you're unsure).

---

## What Cannot Be Changed Without Code

The CMS covers most day-to-day content updates, but the following things are hardcoded and need a developer to change:

- **Navigation links** — which pages appear in the navbar, which are disabled, and what tooltips show. To enable the About or Newsletter pages, a developer needs to update `components/navbar1.tsx`.
- **Footer links and social media URLs** — the About, Feedback, and Contact links in the footer, and the actual social media URLs, are hardcoded in the footer component.
- **The layout and visual design of any page** — how sections look, fonts, colors, spacing. The CMS controls the content inside those sections, not the design.
- **New pages** — adding a completely new page to the website (like a Newsletter page) requires a developer to create the route and wire it up.
- **New section types** — if you want a layout block that doesn't exist yet (e.g., a photo gallery or an FAQ accordion on a public page), that needs code.
- **The contact form behavior** — where form submissions are sent, validation rules, and the success message are all in code.
- **The "List an Opportunity" form** — fields, validation, and submission logic are hardcoded.
- **Anything inside the Duperset portal** — the CMS only manages the public static website.
