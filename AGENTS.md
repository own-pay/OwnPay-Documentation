# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Live at `https://ownpay.org/docs` (proxied via Cloudflare Worker to `ownpay.mintlify.app`)
- GitHub repo: `own-pay/OwnPay-Documentation` (master branch)
- Pushes to `master` auto-deploy to Mintlify

## MCP servers

- Use the Mintlify MCP server (`https://mcp.mintlify.com`) to edit content and settings
- Use the Mintlify docs MCP server (`https://www.mintlify.com/docs/mcp`) to query Mintlify documentation
- Cloudflare MCP servers are configured in `.mcp.json` for DNS, Workers, and infrastructure

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

## Writing guidelines

- Start pages with a clear description of what the page covers
- Use hierarchical headings (H2 > H3 > H4)
- Include prerequisites sections where relevant
- Link to related pages using relative paths
- Keep paragraphs short (3-5 sentences max)
- Use tables for structured data (settings, comparisons, etc.)
- Use mermaid diagrams for architecture and flow visualization

## Custom files

| File | Purpose |
|------|---------|
| `script.js` | GitHub star count badge, JSON-LD structured data injection |
| `style.css` | Compact footer, hide "Powered by Mintlify", styling overrides |
| `llms.txt` | LLM-readable project summary for AI search engines |
| `cloudflare-worker/` | Reverse proxy Worker routing `ownpay.org/docs` to `ownpay.mintlify.app` |

## Deployment

1. Edit files locally
2. Commit and push to `master` branch on `own-pay/OwnPay-Documentation`
3. Mintlify auto-deploys from GitHub
4. Cloudflare Worker proxies `ownpay.org/docs` to the Mintlify deployment
