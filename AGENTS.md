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

```mdx
<!-- Good -->
You can configure the timeout in your settings file.

<!-- Bad -->
Users can configure the timeout in the settings file.
```

### Active voice

Active voice makes sentences shorter and clearer. Test: if you can add "by zombies" after the verb, the sentence is passive.

```mdx
<!-- Good -->
The API returns an error when the token expires.

<!-- Bad -->
An error is returned when the token has expired.
```

### Short sentences

- Aim for sentences under 25 words
- One idea per sentence
- Two to four sentences per paragraph
- Break up lists of steps with numbered sequences, not run-on prose

### Intent-oriented headings

Write headings to answer the question a user might have.

```mdx
<!-- Good -->
## How to configure authentication

<!-- Bad -->
## Authentication configuration
```

Use **sentence case** for all headings ("Getting started" not "Getting Started"). Do not skip heading levels - go from H2 to H3, not H2 to H4. Never add a manual H1 in the body - Mintlify generates it from `title:`.

### Consistent terminology

Pick one term for each concept and use it everywhere. When introducing a term for the first time, define it in place.

```mdx
<!-- Good -->
Each request requires an API key - a unique token that identifies your account.

<!-- Bad -->
Each request requires an API key.
```

### Calibrate tone to audience

- Getting started guides: warm, encouraging, limited choices
- API reference: dense, precise, minimal context
- Be direct without being terse: "Click Save" not "Please click the Save button when you're ready"

### Avoid

- **Filler phrases**: "It's worth noting that," "In order to," "Please note that," "Simply," "Basically," "Just"
- **Editorializing**: "This is a powerful feature," "robust," "enterprise-grade," "comprehensive," "seamless," "cutting-edge"
- **Internal jargon** users won't recognize
- **Inconsistent capitalization** of product features
- **Colloquialisms** - harder to translate for international audiences
- **Passive voice as default** - use it only when the actor is unknown or unimportant

---

## Audience awareness

Follow the [Mintlify audience guide](https://mintlify.com/docs/guides/understand-your-audience). Write every page for ONE specific reader.

### OwnPay audience types

| Audience | Needs | Content type |
|----------|-------|-------------|
| **Brand owners** | Setup guides, configuration, business features | Task-oriented how-to guides |
| **Developers** | API reference, SDKs, code examples, webhooks | Technical reference with code |
| **Staff** | Dashboard usage, day-to-day operations | Step-by-step user guides |
| **Decision-makers** | Architecture overviews, security, capabilities | Conceptual explanations |

### Apply audience awareness

- Add audience context notes when a page could be found by the wrong audience
- Segment "What's next?" sections by audience type
- Define technical terms when introducing them for less technical audiences
- Skip basics for developer audiences

---

## Component usage

Use Mintlify's built-in components. See [Components overview](https://mintlify.com/docs/components).

### Structure content

| Component | Use for |
|-----------|---------|
| `<Steps>` | Numbered step-by-step procedures |
| `<Tabs>` / `<Tab>` | Alternative approaches (e.g., Shared Hosting vs VPS) |
| `<CodeGroup>` | Code examples in multiple languages |
| `<Columns>` | Responsive multi-column layouts |
| `<Panel>` | Sidebar panels for supplementary content |

### Draw attention

| Component | Use for |
|-----------|---------|
| `<Note>` | Neutral supplementary information |
| `<Tip>` | Helpful suggestions |
| `<Warning>` | Potential issues or risks |
| `<Info>` | Contextual information |
| `<Check>` | Success confirmations |
| `<Danger>` | Critical warnings about data loss or security |
| `<Badge>` | Inline status indicators |
| `<Frame>` | Styled borders/captions for images |

### Show and hide content

| Component | Use for |
|-----------|---------|
| `<Accordion>` / `<AccordionGroup>` | Expandable sections for FAQ, troubleshooting |
| `<Expandable>` | Toggle nested API property details |

### Link to other pages

| Component | Use for |
|-----------|---------|
| `<Card>` / `<CardGroup>` | Visual containers with icons for navigation links |
| `<Tiles>` | Grid of clickable tiles with thumbnails |

### Document APIs

| Component | Use for |
|-----------|---------|
| `<ParamField>` | Request parameter definitions with types |
| `<ResponseField>` | Response field definitions |
| `<Expandable>` | Nested API properties |

### Visual context

| Component | Use for |
|-----------|---------|
| `<Icon>` | Visual indicators (Lucide icons) |
| `<Mermaid>` | Flowcharts, sequence diagrams |
| `<Tree>` | Hierarchical file/folder structures |

---

## SEO and GEO guidelines

### On-page SEO

- Every page MUST have `title` (50-60 chars) and `description` (130-160 chars) in frontmatter
- Add `keywords` to key pages (homepage, installation, quickstart, developer guide)
- Use structured headings (H2 > H3 > H4) for hierarchy
- Include tables for structured data that search engines can parse
- Add `sidebarTitle` to every page for clean sidebar navigation

### Internal linking

- Link to related concepts from within your content with descriptive anchor text
- Avoid orphan pages - every page should be linked from at least one other page
- Create topic clusters: group related pages with links between them
- Use descriptive anchor text, not "click here"

```mdx
<!-- Good -->
Learn how to [configure your sitemap](/optimize/seo#sitemaps-and-robots-txt-files).

<!-- Bad -->
[Click here](/optimize/seo) to learn more.
```

### Rich snippets

- Use `<Steps>` component for procedures (generates rich snippets in search)
- Use `<Accordion>` for FAQ content (appears in Google's People Also Ask)
- Use `<CardGroup>` and `<Card>` for scannable link lists

### AI search (GEO)

- The `llms.txt` file at root provides AI search engines with a project summary
- JSON-LD structured data is injected via `script.js` (SoftwareApplication, FAQPage, BreadcrumbList)
- Write clear, factual content that AI can parse and cite
- Use structured headings and tables for AI-friendly formatting

### Technical SEO (auto-handled by Mintlify)

- Sitemap generation: `sitemap.xml` is auto-generated
- Semantic HTML: proper heading hierarchy and navigation landmarks
- Mobile optimization: responsive by default
- Canonical URLs: auto-generated to prevent duplicate content

---

## Content types

Follow the [Diataxis framework](https://mintlify.com/docs/guides/content-types):

| Type | User goal | When to use |
|------|-----------|------------|
| **Tutorial** | Learn through practice | Guided walkthrough for beginners |
| **How-to** | Solve a specific problem | Task-oriented, assumes prerequisites |
| **Reference** | Find precise information | Complete, structured, API docs |
| **Explanation** | Understand a concept | Architecture, design decisions |

Decision test: "What does the user do after reading this?"
- Completed a task = how-to/tutorial
- Understood something = explanation
- Looked up a detail = reference

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
> - Standard markdown links (e.g., `[Dashboard](/user-guide/dashboard)`) and JSX attributes (e.g., `<Card href="/developer/quickstart">`) MUST NOT contain the `/docs` subpath prefix.
> - The `/docs` subpath is appended dynamically by Mintlify's routing during deployment, and prepending it manually in files will break the local link checker and result in double-prefixed paths (e.g., `/docs/docs/...`) in production.

> [!WARNING]
> **EXCEPTION: Raw HTML tags in `mode: "custom"` pages**
> Pages with `mode: "custom"` in their frontmatter render as pure JSX/HTML and bypass Mintlify's router entirely. In these pages, raw `<a href>` attributes MUST use the full `/docs/` prefix or they will resolve to the root domain. Raw `<img src>` tags must NOT be prefixed because Mintlify's compiler resolves them to S3 CDN paths relative to the repository root.
>
> | Link type | Example | Needs `/docs`? |
> |---|---|---|
> | Markdown link | `[text](/path)` | NO - Mintlify handles it |
> | Mintlify component | `<Card href="/path">` | NO - Mintlify handles it |
> | `docs.json` nav/footer `href` | `"href": "/path"` | NO - Mintlify handles it |
> | Raw HTML in `mode: "custom"` | `<a href="/path">` | **YES - add `/docs/` prefix** |
> | Raw `<img src>` in `mode: "custom"` | `<img src="/path">` | **NO - Mintlify's compiler resolves raw images to CDN URLs relative to root** |
>
> **Current `mode: "custom"` pages:** `index.mdx`
>
> When creating a new `mode: "custom"` page, audit every raw `<a href>` tag and add the `/docs/` prefix to all root-relative paths. Keep raw `<img>` tags relative to the repository root (e.g. `/image.png`) as Mintlify dynamically compiles them to CDN URLs.

---

## Terminology

Use these terms consistently throughout all documentation:

| Use | Not | Context |
|-----|-----|---------|
| "brand" | "merchant", "store" | OwnPay's multi-tenant concept |
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

Mintlify supports Tailwind CSS v3 classes. Arbitrary values like `w-[123px]` are NOT supported in JSX `className` - use `style` prop instead.

### JavaScript (`script.js`)

Custom JS runs on every page. Use for:
- Dynamic content injection (footer description, GitHub stars)
- JSON-LD structured data
- Analytics tracking
- UI enhancements

---

## Mobile responsiveness

All pages MUST work on mobile (375px viewport). Rules:

- Tables should scroll horizontally within their parent container (do NOT use `display: block` on `table`)
- Code blocks (`pre`) should scroll horizontally
- Footer grid: 2 columns on mobile, 4 on desktop
- Test at 375px width before committing changes
- No body-level horizontal scroll allowed

---

## Automatic GitHub Synchronization Pipeline

> [!WARNING]
> **DO NOT EDIT SYNCED FILES DIRECTLY IN THIS REPOSITORY**
> The following documentation pages are synced automatically from the main application repository (`own-pay/OwnPay`, `main` branch). Any manual edits made directly to these files in this repository will be overwritten during the next synchronization run.

| Documentation Path | Source in `own-pay/OwnPay` |
|--------------------|----------------------------|
| `user-guide/changelog.mdx` | `CHANGELOG.md` |
| `resources/architecture.mdx` | `docs/ARCHITECTURE.md` |
| `resources/features.mdx` | `docs/FEATURES.md` |
| `resources/local-setup.mdx` | `docs/LOCAL_SETUP.md` |
| `resources/contributing.mdx` | `CONTRIBUTING.md` |
| `resources/roadmap.mdx` | `ROADMAP.md` |
| `developer/translations.mdx` | `docs/TRANSLATIONS.md` |

### Sync Process details
- **Local Sync Script**: `scripts/sync-github-files.js`
  - Fetches the raw content from the main repository.
  - Automatically parses and preserves the existing frontmatter (`title`, `description`, `keywords`) of the local MDX files.
  - Strips the top-level H1 header from the remote file to avoid duplicate H1 headings (as Mintlify automatically renders the frontmatter title as the H1 header).
- **GitHub Actions Workflow**: `.github/workflows/sync-docs.yml`
  - Runs on a schedule every 6 hours.
  - Can be triggered manually via `workflow_dispatch` or externally via `repository_dispatch` with type `sync-docs`.

To edit these pages, push a change to the corresponding file in `own-pay/OwnPay`, and let the workflow sync them automatically.

---

## Local Validation Rules

Before claiming victory on any documentation updates, AI agents must run the following validation pipeline:

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
> - The reverse proxy is configured natively in Nginx on the origin server at `/etc/nginx/conf.d/vhosts/ownpay.org.ssl.conf`.
> - It routes all `/docs` and `/docs/` requests directly to `ownpay.mintlify.dev`, bypassing Varnish/Apache.
> - It uses Nginx `sub_filter` to dynamically rewrite Open Graph and Facebook meta tags from `name="og:..."` to `property="og:..."` for crawler compatibility.
