# OwnPay Documentation

Documentation for [OwnPay](https://ownpay.org) - the self-hosted, enterprise-grade single-owner payment orchestrator.

**Live site:** [https://ownpay.org/docs](https://ownpay.org/docs)

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

## Publishing changes

**Branch strategy:**
- `master` = Mintlify documentation (live site)
- `main` = Original Astro/Starlight documentation (legacy, do not modify)

**Deployment workflow:**
1. Edit files locally on `master` branch
2. Commit and push to `master`: `git push origin master`
3. Mintlify auto-deploys from `master`
4. Cloudflare Worker proxies `ownpay.org/docs` to `ownpay.mintlify.app`

## Project structure

```
ownpay_docs/
├── docs.json                    # Site configuration (theme, navigation, SEO)
├── index.mdx                    # Homepage
├── quickstart.mdx               # Quick start guide
├── installation.mdx             # Installation guide (shared hosting, VPS, Docker)
├── llms.txt                     # LLM-readable project summary
├── script.js                    # Custom JS (GitHub stars, JSON-LD structured data)
├── style.css                    # Custom CSS (footer, layout overrides)
│
├── concepts/                    # Core concepts
│   ├── index.mdx
│   ├── brands.mdx
│   ├── gateways.mdx
│   ├── plugins.mdx
│   ├── ledger.mdx
│   ├── domains.mdx
│   └── payment-flow.mdx
│
├── user-guide/                  # User guide
│   ├── dashboard.mdx
│   ├── changelog.mdx
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
│   ├── ai-mcp.mdx              # MCP server setup guide
│   ├── ai-skills.mdx           # AI skills setup guide
│   ├── integration/             # PHP, Node.js, WooCommerce, WHMCS SDKs
│   ├── plugins/                 # Overview, hooks, events, capabilities
│   └── plugin-types/            # Gateway, addon, theme development
│
├── api/                         # OpenAPI specifications
│   ├── merchant_api.yaml
│   ├── mobile_api.yaml
│   ├── admin_api.yaml
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
│   ├── architecture.mdx
│   ├── features.mdx
│   ├── glossary.mdx
│   ├── contributing.mdx
│   ├── roadmap.mdx
│   ├── local-setup.mdx
│   └── integrations/
│       └── rest-api.mdx
│
├── advanced-topics/             # Advanced topics
│   ├── security-compliance.mdx
│   ├── performance-scaling.mdx
│   ├── troubleshooting.mdx
│   └── faq.mdx
│
├── cloudflare-worker/           # Cloudflare Worker for /docs proxy
│   ├── wrangler.toml
│   └── src/
│       └── index.js
│
└── logo/                        # Brand logos
    ├── light.svg
    └── dark.svg
```

## Navigation tabs

| Tab | Content |
|-----|---------|
| **Documentation** | Getting Started, User Guide, People, Payments, Gateways, Mobile & SMS, System, Appearance, Auth & Account, Reports |
| **API Reference** | Merchant API, Mobile API, Admin API |
| **Developer** | Quickstart, SDK Integration, Webhooks, Plugin System, AI Tools |
| **Core Concepts** | Brands, Gateways, Plugins, Ledger, Domains, Payment Flow |
| **Resources** | Architecture, Features, Glossary, Contributing, Roadmap, Local Setup, REST API, Security, Performance, Troubleshooting, FAQ |
| **Changelog** | Release history |

## Resources

- [Mintlify documentation](https://mintlify.com/docs)
- [OwnPay GitHub](https://github.com/own-pay/OwnPay)
- [Support](mailto:support@ownpay.org)
