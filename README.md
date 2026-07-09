# OwnPay Documentation

Documentation for [OwnPay](https://ownpay.org) - the self-hosted, enterprise-grade single-owner payment orchestrator.

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

Install the GitHub app from your [dashboard](https://dashboard.mintlify.com/settings/organization/github-app) to propagate changes from your repo to your deployment. Changes deploy automatically after pushing to the default branch.

## Project structure

```
ownpay_docs/
+-- docs.json              # Site configuration
+-- index.mdx              # Homepage
+-- quickstart.mdx         # Quick start guide
+-- installation.mdx       # Installation guide
+-- architecture.mdx       # System architecture
+-- concepts/              # Core concepts
|   +-- brands.mdx
|   +-- gateways.mdx
|   +-- plugins.mdx
|   +-- ledger.mdx
|   +-- domains.mdx
+-- guides/                # How-to guides
|   +-- first-payment.mdx
|   +-- multi-brand.mdx
|   +-- custom-domains.mdx
|   +-- gateway-setup.mdx
|   +-- fee-rules.mdx
|   +-- email-notifications.mdx
+-- api/                   # API reference
|   +-- overview.mdx
|   +-- authentication.mdx
|   +-- webhooks.mdx
|   +-- errors.mdx
+-- plugins/               # Plugin development
|   +-- overview.mdx
|   +-- developer-guide.mdx
|   +-- hooks-reference.mdx
|   +-- gateway-plugins.mdx
|   +-- theme-plugins.mdx
+-- mobile/                # Mobile companion
|   +-- overview.mdx
|   +-- pairing.mdx
|   +-- sms-verification.mdx
+-- deployment/            # Deployment guides
|   +-- requirements.mdx
|   +-- installation.mdx
|   +-- configuration.mdx
|   +-- upgrading.mdx
+-- logo/                  # Brand logos
+-- favicon.svg            # Favicon
```

## Resources

- [Mintlify documentation](https://mintlify.com/docs)
- [OwnPay GitHub](https://github.com/own-pay/OwnPay)
- [Support](mailto:support@ownpay.org)
