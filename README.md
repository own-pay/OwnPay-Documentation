# OwnPay Documentation

Documentation for [OwnPay](https://ownpay.org) - the self-hosted, open-source payment orchestrator licensed under AGPL-3.0. Manage multiple brands, connect to 100+ payment gateways, and provide white-label checkout experiences. Free forever - no licensing fees.

**Live site:** [https://ownpay.org/docs](https://ownpay.org/docs)
**LLM summary:** [llms.txt](https://ownpay.org/docs/llms.txt) - Append `.md` to any page URL for clean Markdown (e.g. `https://ownpay.org/docs/quickstart.md`).

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint) to preview changes locally:

```bash
npm i -g mint
```

Run the dev server:

```bash
mint dev
```

View your local preview at `http://localhost:3000`.

### Validation

Before committing changes, run the validation pipeline:

```bash
# Clear local Mintlify cache
Remove-Item -Recurse -Force .mintlify

# Validate MDX and docs.json configuration
mint validate

# Check for broken internal links
mint broken-links --check-anchors --check-redirects --check-snippets

# Check accessibility
mint a11y
```

## Publishing changes

**Branch strategy:**
- `master` = Mintlify documentation (live site)
- `main` = Original Astro/Starlight documentation (legacy, do not modify)

**Deployment workflow:**
1. Edit files locally on `master` branch
2. Stage and commit changes
3. Push to `origin master` - Mintlify auto-deploys from GitHub
4. Nginx reverse proxy routes `ownpay.org/docs` to `ownpay.mintlify.dev`

**Commit co-author:** Every commit by an AI agent must include the bot co-author trailer:

```
Co-authored-by: OwnPay Bot <bot@ownpay.org>
```

## Project structure

```
ownpay_docs/
├── docs.json                    # Site configuration (theme, navigation, SEO)
├── index.mdx                    # Homepage (mode: custom)
├── introduction.mdx             # Documentation hub and feature overview
├── demo.mdx                     # Live demo sandbox
├── quickstart.mdx               # Quick start guide
├── installation.mdx             # Installation guide (shared hosting, VPS, Docker)
├── llms.txt                     # LLM-readable project summary
├── script.js                    # Custom JS (GitHub stars, JSON-LD structured data)
├── style.css                    # Custom CSS (footer, layout overrides)
├── AGENTS.md                    # AI agent instructions
│
├── concepts/                    # Core concepts
│   ├── index.mdx                # Overview: brands, gateways, payment flow, ledger
│   ├── brands.mdx
│   ├── gateways.mdx
│   ├── plugins.mdx
│   ├── ledger.mdx
│   ├── domains.mdx
│   └── payment-flow.mdx
│
├── user-guide/                  # User guide
│   ├── dashboard.mdx
│   ├── changelog.mdx            # Auto-synced from main repo
│   ├── subscribe.mdx
│   ├── people/                  # Brands, staff, roles, customers
│   ├── payments/                # Transactions, invoices, payment links, ledger
│   ├── gateways/                # Gateway setup, currencies
│   ├── mobile-sms/              # Devices, SMS templates, logs
│   ├── system/                  # Settings, domains, plugins, addons, updates
│   ├── appearance/              # Branding, themes, landing page
│   ├── auth/                    # Login, forgot password, 2FA
│   ├── account/                 # My account
│   ├── reports-finance/         # Reports, audit log, balance verification
│   ├── developers/              # Developer hub
│   └── public/                  # Checkout
│
├── developer/                   # Developer guide
│   ├── quickstart.mdx
│   ├── ai-overview.mdx          # AI tools overview
│   ├── ai-mcp.mdx               # MCP server setup guide
│   ├── ai-skills.mdx            # AI skills setup guide
│   ├── translations.mdx         # Auto-synced from main repo
│   ├── integration/             # PHP, Node.js, WooCommerce, WHMCS SDKs
│   ├── plugins/                 # Overview, hooks, events, capabilities
│   └── plugin-types/            # Gateway, addon, theme development + AI prompts
│
├── api/                         # OpenAPI specifications and API docs
│   ├── merchant_api.yaml
│   ├── mobile_api.yaml
│   ├── admin_api.yaml
│   ├── overview.mdx
│   ├── authentication.mdx
│   ├── errors.mdx
│   └── webhooks.mdx
│
├── api-reference/               # API reference pages
│   ├── merchant.mdx
│   ├── mobile.mdx
│   └── admin.mdx
│
├── resources/                   # Resources
│   ├── architecture.mdx         # Auto-synced from main repo
│   ├── features.mdx             # Auto-synced from main repo
│   ├── ecosystem.mdx
│   ├── glossary.mdx
│   ├── contributing.mdx         # Auto-synced from main repo
│   ├── roadmap.mdx              # Auto-synced from main repo
│   ├── local-setup.mdx          # Auto-synced from main repo
│   ├── code-examples.mdx
│   └── integrations/
│       └── rest-api.mdx
│
├── advanced-topics/             # Advanced topics
│   ├── security-compliance.mdx
│   ├── performance-scaling.mdx
│   ├── troubleshooting.mdx
│   └── faq.mdx
│
├── scripts/                     # Build and sync scripts
│   └── sync-github-files.js     # Auto-sync files from main OwnPay repo
│
├── snippets/                    # Reusable MDX components
│   └── llms-directive.mdx
│
├── logo/                        # Brand logos
│   ├── light.svg
│   └── dark.svg
```

## Navigation tabs

The site uses 7 header tabs defined in `docs.json`:

| Tab | Content |
|-----|---------|
| **Documentation** | Get Started, Manage People, Payments & Gateways, Mobile & SMS, Configuration, Access & Security, Reports & Monitoring |
| **API Reference** | Overview, Merchant API, Mobile API, Admin API (auto-generated from OpenAPI YAML) |
| **Developer** | Getting Started, SDK Integration, Webhooks & Events, Plugin System, AI Tools |
| **Core Concepts** | Fundamentals (brands, gateways, plugins, ledger, domains, payment flow) |
| **Resources** | Platform, Community, Advanced |
| **Changelog** | Release history (auto-synced from main repo) |

## MCP server

OwnPay provides an MCP server for programmatic documentation queries:

- **URL:** `https://ownpay.org/docs/mcp`
- **Docs:** See [AI Tools](/developer/ai-mcp) for setup instructions

## Synced files

Several documentation pages are auto-synced from the main [OwnPay](https://github.com/own-pay/OwnPay) repository. Do not edit these files directly in this repo - changes will be overwritten.

| Documentation path | Source in OwnPay |
|--------------------|------------------|
| `user-guide/changelog.mdx` | `CHANGELOG.md` |
| `resources/architecture.mdx` | `docs/ARCHITECTURE.md` |
| `resources/features.mdx` | `docs/FEATURES.md` |
| `resources/local-setup.mdx` | `docs/LOCAL_SETUP.md` |
| `resources/contributing.mdx` | `CONTRIBUTING.md` |
| `resources/roadmap.mdx` | `ROADMAP.md` |
| `developer/translations.mdx` | `docs/TRANSLATIONS.md` |

## Resources

- [Mintlify documentation](https://mintlify.com/docs)
- [OwnPay GitHub](https://github.com/own-pay/OwnPay)
- [Support](mailto:support@ownpay.org)
