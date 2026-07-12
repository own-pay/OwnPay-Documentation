# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Live at `https://ownpay.org/docs` (proxied via Cloudflare Worker to `ownpay.mintlify.site`)
- GitHub repo: `own-pay/OwnPay-Documentation` (master branch)
- Pushes to `master` auto-deploy to Mintlify

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
- `cloudflare-bindings` - Cloudflare Workers, KV, R2, D1 storage and compute
- `cloudflare-observability` - Worker logs, analytics, and debugging
- `cloudflare-browser` - Fetch web pages as markdown for research

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

## Terminology

- Use "brand" not "merchant" or "store" when referring to OwnPay's multi-tenant concept
- Use "gateway" not "payment provider" or "processor"
- Use "super admin" or "administrator" for the platform owner
- Use "staff" for brand-level users
- Use "checkout" for the customer payment page
- Use "companion app" for the Android mobile application

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise - one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references
- Use callouts (Tip, Warning, Note, Info) for important information
- Use Steps component for multi-step procedures
- Use Tabs component for alternative approaches (e.g., Shared Hosting vs VPS)
- Use CodeGroup for showing code in multiple languages

## SEO and GEO guidelines

- Every page must have `title` and `description` in frontmatter
- Add `keywords` to key pages (homepage, installation, quickstart, developer guide)
- Use structured headings (H2 > H3 > H4) for hierarchy
- Include tables for structured data that search engines can parse
- Use `CardGroup` and `Card` components for scannable link lists
- Use `Steps` component for procedures (generates rich snippets)
- The `llms.txt` file at root provides AI search engines with a project summary
- JSON-LD structured data is injected via `script.js` (SoftwareApplication, FAQPage, BreadcrumbList)

## Content boundaries

- Document user-facing features, not internal implementation details
- Include code examples for developer-focused content
- Provide troubleshooting sections for complex features
- Keep API reference concise with request/response examples
- Include security warnings for sensitive operations

## Link Resolution Rules

> [!IMPORTANT]
> **NO `/docs` PREFIX FOR INTERNAL LINKS - except raw HTML in `mode: "custom"` pages**
> - Standard markdown links (e.g., `[Dashboard](/user-guide/dashboard)`) and JSX attributes (e.g., `<Card href="/developer/quickstart">`) MUST NOT contain the `/docs` subpath prefix.
> - The `/docs` subpath is appended dynamically by Mintlify's routing during deployment, and prepending it manually in files will break the local link checker and result in double-prefixed paths (e.g., `/docs/docs/...`) in production.

> [!WARNING]
> **EXCEPTION: Raw HTML tags in `mode: "custom"` pages**
> Pages with `mode: "custom"` in their frontmatter render as pure JSX/HTML and bypass Mintlify's router entirely. In these pages, raw `<a href>` and `<img src>` attributes MUST use the full `/docs/` prefix or they will resolve to the root domain instead of the docs subdirectory.
>
> | Link type | Example | Needs `/docs`? |
> |---|---|---|
> | Markdown link | `[text](/path)` | NO - Mintlify handles it |
> | Mintlify component | `<Card href="/path">` | NO - Mintlify handles it |
> | `docs.json` nav/footer `href` | `"href": "/path"` | NO - Mintlify handles it |
> | Raw HTML in `mode: "custom"` | `<a href="/path">` | **YES - add `/docs/` prefix** |
> | Raw `<img src>` in `mode: "custom"` | `<img src="/path">` | **YES - add `/docs/` prefix** |
>
> **Current `mode: "custom"` pages:** `index.mdx`, `resources/architecture.mdx`, `user-guide/system/settings.mdx`
>
> When creating a new `mode: "custom"` page, audit every raw `<a href>` and `<img src>` tag and add the `/docs/` prefix to all root-relative paths.

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

## Deployment

1. Edit files locally.
2. Stage and commit changes to `master` branch on `own-pay/OwnPay-Documentation`.
3. Push to `origin master` - Mintlify auto-deploys from GitHub.
4. Cloudflare Worker proxies `ownpay.org/docs` to the Mintlify deployment.

> [!WARNING]
> **CLOUDFLARE WORKER PROXY DESTINATION HOST**
> - The Cloudflare Worker reverse-proxy destination (`DOCS_HOST` inside `cloudflare-worker/src/index.js`) must be set to `ownpay.mintlify.site`.
> - Do **NOT** change it to `ownpay.mintlify.app`. The `.site` domain is configured explicitly for subdirectory mapping and domain verification in the dashboard; changing it to `.app` will cause proxy routing failures.

