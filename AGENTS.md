# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json` (NEVER use `mint.json` - it is deprecated)
- Live at `https://ownpay.org/docs` (proxied via Nginx to `ownpay.mintlify.dev`)
- GitHub repo: `own-pay/ownpay-docs` (master branch)
- Pushes to `master` auto-deploy to Mintlify
- Full `docs.json` schema at [mintlify.com/docs.json](https://mintlify.com/docs.json)

## Implementation tasks

All pending implementation tasks are documented in `docs/TASKS.md`. Read that file before starting any work. It contains:
- The full list of pending tasks with step-by-step implementation instructions
- Acceptance criteria for each task
- The list of available MCP servers and skills to use
- The validation pipeline to run after every task
- A list of files that must NOT be edited directly (auto-synced from the main repo)

## MCP servers

All MCP servers are configured in `.mcp.json`. Use the appropriate server for each task:

- `mintlify` (`https://mcp.mintlify.com`) - Edit OwnPay docs content and settings via Mintlify dashboard
- `mintlify-docs` (`https://www.mintlify.com/docs/mcp`) - Query Mintlify documentation for component syntax, config options, and features
- `mintlify-guides` (`https://www.mintlify.com/guides/mcp`) - Advanced documentation patterns, best practices, and examples
- `mintlify-learn` (`https://learn.mintlify.com/mcp`) - Mintlify Learn resources for interactive features and MCP

**Always** favor searching the current Mintlify documentation via MCP over whatever is in your training data. Mintlify features evolve rapidly.

## Skills to read before starting

Read the relevant skills from `.agents/skills/` before beginning any task:

| Skill | When to read |
|-------|-------------|
| `.agents/skills/mintlify/SKILL.md` | Before every task - core Mintlify guidelines |
| `.agents/skills/mintlify-api/SKILL.md` | When using the Mintlify REST API |
| `.agents/skills/mintlify-docs/SKILL.md` | When querying Mintlify documentation |

## Navigation structure

The site uses 7 header tabs:

| Tab | Content |
|-----|---------|
| **Documentation** | Getting Started, User Guide, People, Payments, Gateways, Mobile & SMS, System, Appearance, Auth & Account, Reports |
| **API Reference** | Merchant API, Mobile API, Admin API (auto-generated from OpenAPI YAML in `api/`) |
| **Developer** | Quickstart, SDK Integration (PHP, Node.js, WooCommerce, WHMCS), Webhooks, Plugin System |
| **Core Concepts** | Brands, Gateways, Plugins, Ledger, Domains, Payment Flow |
| **Resources** | Architecture, Features, Glossary, Contributing, Roadmap, Local Setup, REST API Integration, Security, Performance, Troubleshooting, FAQ |
| **Changelog** | Release history synced from GitHub |

---

## Page frontmatter guidelines

Every page requires frontmatter. Follow these rules per [Mintlify Pages docs](https://mintlify.com/docs/organize/pages):

### Required fields

```yaml
---
title: "Descriptive Title - Keyword-Rich Subtitle"
description: "Concise summary for SEO and navigation (130-160 characters)."
---
```

### SEO-optimized titles (50-60 characters)

Write titles that match how users search, not how your product UI labels things.

- Include the primary keyword near the start
- Make each title unique - duplicate titles confuse search engines
- Match user intent: use "how to," "guide," or "reference" where appropriate

| Weak title | Strong title |
|------------|-------------|
| `Authentication` | `API Authentication - Bearer Tokens and API Key Scoping` |
| `Brands` | `Brands - Multi-Tenant Isolation for Payment Merchants` |
| `Quickstart` | `Quickstart - Get Your Payment Gateway Running in 5 Minutes` |

### Descriptions (130-160 characters)

The description appears below your page title in search results.

- Summarize what users can accomplish, not just what the page covers
- Include the primary keyword naturally
- Write in active voice: "Learn how to configure" not "This page explains"

### sidebarTitle (2-4 words)

Every page MUST have a `sidebarTitle` for readable sidebar navigation. Without it, the full `title` displays in the sidebar, which is too long.

```yaml
---
title: "Admin Dashboard - Transaction Volume, Revenue, and KPIs"
sidebarTitle: "Dashboard"
---
```

### Optional fields

| Field | Purpose |
|-------|---------|
| `icon` | Lucide icon name, Font Awesome name, URL, or project path |
| `iconType` | Font Awesome style: `regular`, `solid`, `light`, `duotone`, `brands` |
| `tag` | Badge label next to title in sidebar (e.g., `"NEW"`, `"BETA"`) |
| `hidden` | `true` - removes from sidebar, not indexed by search engines |
| `noindex` | `true` - excludes from search, sitemaps, AI assistant context |
| `searchable` | `false` - excludes from in-product search only (stays in sitemap) |
| `boost` | Multiply search ranking (`> 1` to prioritize, `< 1` to de-prioritize) |
| `deprecated` | Shows "deprecated" label next to page title |
| `hideFooterPagination` | Hide prev/next navigation links |
| `hideApiMarker` | Hide HTTP method badge (GET, POST) in sidebar |
| `timestamp` | Override global timestamp setting per page |
| `mode` | Page layout: `default`, `wide`, `custom`, `frame`, `center` |
| `keywords` | Array of terms for internal search and SEO |
| `groups` | Restrict page to authenticated users in specific groups |

### Page modes

| Mode | Use case |
|------|----------|
| `default` | Standard layout with sidebar + table of contents |
| `wide` | Hides side panel/TOC for extra horizontal space |
| `custom` | Minimal layout, only navbar - blank canvas for landing pages |
| `frame` | Custom layout but keeps sidebar navigation |
| `center` | No sidebar or TOC, centered content (good for changelogs) |

---

## Writing style and tone

Follow the [Mintlify style guide](https://mintlify.com/docs/guides/style-and-tone). Core principles:

### Second person ("you")

Address users directly. Second person makes instructions easier to follow and keeps the focus on what users are doing.

### Active voice

Active voice makes sentences shorter and clearer. Test: if you can add "by zombies" after the verb, the sentence is passive.

### Short sentences

- Aim for sentences under 25 words
- One idea per sentence
- Two to four sentences per paragraph

### Intent-oriented headings

Write headings to answer the question a user might have. Use **sentence case** for all headings. Do not skip heading levels. Never add a manual H1 in the body - Mintlify generates it from `title:`.

### Avoid

- **Filler phrases**: "It's worth noting that," "Simply," "Basically," "Just"
- **Editorializing**: "enterprise-grade," "robust," "comprehensive," "seamless"
- **Internal jargon** users won't recognize
- **Passive voice as default**

---

## Audience awareness

Follow the [Mintlify audience guide](https://mintlify.com/docs/guides/understand-your-audience). Write every page for ONE specific reader.

| Audience | Needs | Content type |
|----------|-------|-------------|
| **Brand owners** | Setup guides, configuration | Task-oriented how-to guides |
| **Developers** | API reference, SDKs, code examples | Technical reference with code |
| **Staff** | Dashboard usage, operations | Step-by-step user guides |
| **Decision-makers** | Architecture, security | Conceptual explanations |

---

## Component usage

Use Mintlify's built-in components. See [Components overview](https://mintlify.com/docs/components).

| Component | Use for |
|-----------|---------|
| `<Steps>` | Numbered step-by-step procedures |
| `<Tabs>` / `<Tab>` | Alternative approaches (e.g., Shared Hosting vs VPS) |
| `<CodeGroup>` | Code examples in multiple languages |
| `<Note>`, `<Tip>`, `<Warning>`, `<Info>`, `<Danger>` | Callouts |
| `<Accordion>` / `<AccordionGroup>` | Expandable sections (FAQ, troubleshooting) |
| `<Card>` / `<CardGroup>` | Visual containers with icons for navigation |
| `<ParamField>` / `<ResponseField>` | API parameter and response definitions |

---

## SEO and GEO guidelines

- Every page MUST have `title` (50-60 chars) and `description` (130-160 chars)
- Add `keywords` to key pages
- Add `sidebarTitle` to every page for clean sidebar navigation
- Use structured headings (H2 > H3 > H4)
- Include tables for structured data
- Use `<Steps>` for procedures (generates rich snippets)
- Use `<Accordion>` for FAQ (appears in Google's People Also Ask)
- The `llms.txt` file provides AI search engines with a project summary
- JSON-LD structured data is injected via `script.js`

---

## Content types

Follow the [Diataxis framework](https://mintlify.com/docs/guides/content-types):

| Type | User goal | When to use |
|------|-----------|------------|
| **Tutorial** | Learn through practice | Guided walkthrough for beginners |
| **How-to** | Solve a specific problem | Task-oriented, assumes prerequisites |
| **Reference** | Find precise information | Complete, structured, API docs |
| **Explanation** | Understand a concept | Architecture, design decisions |

---

## Content boundaries

- Document user-facing features, not internal implementation details
- Include code examples for developer-focused content
- Provide troubleshooting sections for complex features
- Keep API reference concise with request/response examples
- Include security warnings for sensitive operations
- Match page length to content purpose - thin pages under 300 words struggle to rank

---

## Link Resolution Rules

> [!IMPORTANT]
> **NO `/docs` PREFIX FOR INTERNAL LINKS - except raw HTML in `mode: "custom"` pages**
> - Standard markdown links and JSX attributes MUST NOT contain the `/docs` subpath prefix.
> - The `/docs` subpath is appended dynamically by Mintlify's routing during deployment.

> [!WARNING]
> **EXCEPTION: Raw HTML tags in `mode: "custom"` pages**
> Pages with `mode: "custom"` in their frontmatter render as pure JSX/HTML and bypass Mintlify's router. Raw `<a href>` MUST use `/docs/` prefix. Raw `<img src>` must NOT.
>
> | Link type | Needs `/docs`? |
> |---|---|
> | Markdown link | NO |
> | Mintlify component (`<Card href>`) | NO |
> | `docs.json` nav/footer `href` | NO |
> | Raw HTML `<a href>` in `mode: "custom"` | **YES** |
> | Raw `<img src>` in `mode: "custom"` | NO |
>
> **Current `mode: "custom"` pages:** `index.mdx`

---

## Terminology

| Use | Not | Context |
|-----|-----|---------|
| "brand" | "merchant", "store" | Multi-tenant concept |
| "gateway" | "payment provider", "processor" | Payment integration |
| "super admin", "administrator" | "admin user", "root user" | Platform owner |
| "staff" | "user", "team member" | Brand-level users |
| "checkout" | "payment page", "pay page" | Customer payment page |
| "companion app" | "mobile app", "Android app" | The Android SMS app |

---

## Custom CSS and JavaScript

### CSS (`style.css`)

Any `.css` file in the content directory is auto-included on every page. No import needed.

Key targeting selectors:
- `#navbar` - top navigation bar
- `#sidebar` - left sidebar navigation
- `#content-area` - main content area
- `footer` - page footer
- `.dark` prefix for dark mode styles

### JavaScript (`script.js`)

Custom JS runs on every page. Use for dynamic content injection, JSON-LD structured data, analytics tracking, and UI enhancements.

---

## Mobile responsiveness

All pages MUST work on mobile (375px viewport). Rules:

- Tables should scroll horizontally (do NOT use `display: block` on `table`)
- Code blocks should scroll horizontally
- Footer grid: 2 columns on mobile, 4 on desktop
- No body-level horizontal scroll allowed

---

## Automatic GitHub Synchronization Pipeline

> [!WARNING]
> **DO NOT EDIT SYNCED FILES DIRECTLY IN THIS REPOSITORY**
> The following documentation pages are synced automatically from `own-pay/OwnPay` (`main` branch).

| Documentation Path | Source in `own-pay/OwnPay` |
|--------------------|----------------------------|
| `user-guide/changelog.mdx` | `CHANGELOG.md` |
| `resources/architecture.mdx` | `docs/ARCHITECTURE.md` |
| `resources/features.mdx` | `docs/FEATURES.md` |
| `resources/local-setup.mdx` | `docs/LOCAL_SETUP.md` |
| `resources/contributing.mdx` | `CONTRIBUTING.md` |
| `resources/roadmap.mdx` | `ROADMAP.md` |
| `developer/translations.mdx` | `docs/TRANSLATIONS.md` |

---

## Local Validation Rules

Before claiming victory on any documentation updates, run this validation pipeline:

1. **Clear Local Mintlify Cache**:
   ```powershell
   Remove-Item -Recurse -Force C:\Users\iamna\.mintlify
   ```
2. **Validate MDX & Configuration**:
   ```bash
   npx mintlify validate
   ```
3. **Verify Links**:
   ```bash
   npx mintlify broken-links --check-anchors --check-redirects --check-snippets
   ```
4. **Contrast Accessibility (A11y)**:
   ```bash
   npx mintlify a11y
   ```

---

## Deployment & Proxy Setup

1. Edit files locally.
2. Stage and commit changes to `master` branch on `own-pay/ownpay-docs`.
3. Push to `origin master` - Mintlify auto-deploys from GitHub.
4. The Nginx reverse proxy on the origin server (`ownpay-main`) proxies `ownpay.org/docs` to `ownpay.mintlify.dev`.

> [!IMPORTANT]
> **NGINX REVERSE PROXY CONFIGURATION**
> - The reverse proxy is configured in Nginx at `/etc/nginx/conf.d/vhosts/ownpay.org.ssl.conf`.
> - It routes all `/docs` requests to `ownpay.mintlify.dev`, bypassing Varnish/Apache.
> - It uses `sub_filter` to rewrite OG meta tags from `name=` to `property=` for crawler compatibility.

---

## Git Commit Rules

Every commit made by an AI agent MUST include the OwnPay bot as a co-author. Add this trailer to every commit message:

```text
Co-authored-by: OwnPay Bot <bot@ownpay.org>
```

Example:

```bash
git commit -m "Your commit message here

Co-authored-by: OwnPay Bot <bot@ownpay.org>"
```
