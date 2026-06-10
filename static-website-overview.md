# Static Website

The public-facing side of the site — what anyone sees before logging in. All pages share the same navbar and footer.

---

## Navbar

Sticky at the top. Logo + "Connect Placecom" on the left, auth controls on the right.

Nav links:
- **Home** — active
- **About** — disabled, shows "Coming Soon!" tooltip
- **Podcast** — active
- **Newsletter** — disabled, shows "Coming Soon!" tooltip
- **List an Opportunity** — active, but requires @ashoka.edu.in Google sign-in
- **Contact Us** — active

When logged in, the right side shows a user avatar and a "Duperset" button that takes you into the portal. On mobile it collapses into a hamburger drawer.

---

## Footer

Minimal. Logo, three links (About, Feedback, Contact), social icons (LinkedIn, Instagram, Twitter, YouTube). Credits the five builders underneath.

---

## Pages

### Home (/)
**Active**

The landing page. Layout is fully content-driven — a hero banner, stats, About Us copy, and a Get In Touch section. All editable via the CMS, no code needed.

---

### About (/about)
**Disabled — Coming Soon**

Built and functional but hidden from the nav. Reachable by URL if needed.

---

### About: Team (/about/team)
**Active — not linked in nav**

Team photo banner + department-wise member grids. Works fine, just not linked anywhere while About is disabled.

---

### About: Reports (/about/reports)
**Active — not linked in nav**

Monthly placement reports in a timeline layout, each with an embedded PDF viewer. Same situation — accessible by URL, not linked in nav.

---

### Podcast (/podcast)
**Active**

Episode cards with Spotify embeds, title, and description. Episodes are managed via a data file in the CMS.

---

### Newsletter (/newsletter)
**Disabled — Coming Soon**

Nav link exists but is disabled. No page content built yet.

---

### List an Opportunity (/submit-opportunity)
**Active — requires login**

Multi-step form for submitting opportunities to PlaceCom. Collects org name, deadline, work arrangement, compensation, duration, JD (upload or typed), and notes. Locked to @ashoka.edu.in accounts.

---

### Contact (/contact)
**Active**

Contact form (name, email, subject, message) + PlaceCom's email and phone details on the side. Sends an email on submission. Contact details are managed via a data file.

---

## Content System

Most pages pull their text from markdown and JSON files in the `content/` folder, managed through the built-in CMS (Keystatic). To update homepage copy, add a podcast episode, change contact info, or publish a new report — use the CMS, not the code.
