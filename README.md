# OwnPay Documentation Portal

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/dark_mode.svg">
    <source media="(prefers-color-scheme: light)" srcset="public/light_mode.svg">
    <img alt="OwnPay Logo" src="public/light_mode.svg" width="320">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/own-pay/OwnPay">
    <img src="https://img.shields.io/github/stars/own-pay/OwnPay?style=for-the-badge&logo=github&color=102963&labelColor=0c1c49" alt="GitHub stars" />
  </a>
  <a href="https://learn.ownpay.org">
    <img src="https://img.shields.io/badge/Documentation-learn.ownpay.org-0F97ED?style=for-the-badge&logo=gitbook&logoColor=white&labelColor=102963" alt="Documentation Website" />
  </a>
  <img src="https://img.shields.io/badge/Node.js-24.15.0-green?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1c1e2f" alt="Node.js version" />
</p>

---

## What is OwnPay?

**OwnPay** is a self-hosted, open-source payment infrastructure designed to run entirely on your own server. Unlike standard payment processors or SaaS gateways, OwnPay provides complete control over your transaction ledger, isolated white-label store domains, sandboxed plugin gateways (supporting 123+ platforms including bKash, Nagad, Stripe, and PayPal), and native Android SMS parsing.

This repository contains the source code for the official OwnPay documentation portal hosted at [learn.ownpay.org](https://learn.ownpay.org).

- **Main Repository:** [own-pay/OwnPay](https://github.com/own-pay/OwnPay)
- **Official Website:** [ownpay.org](https://ownpay.org)

---

## Local Development

To run the documentation portal locally, make sure you have **Node.js v24.15.0** installed.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Development Server

```bash
npm run dev
```

The dev server will boot up locally (typically at `http://localhost:5173/`).

### 3. Production Build

```bash
npm run build
```

Generates statically compiled files in `.vitepress/dist/` along with a dynamic `sitemap.xml`.

---

## Contribution & Writing Guide

We welcome improvements and additions to the guides. Follow the instructions below to add or modify content.

### How to Update an Existing Guide

1. Find the target Markdown (`.md`) file inside the workspace (e.g., inside `user-guide/` or `developer/`).
2. Implement your edits following the standard Markdown syntax.
3. Verify your layout and formatting look correct on the local development server before staging.

### How to Add a New Guide

1. Create a new `.md` file in the appropriate directory (e.g., `user-guide/new-section/guide-name.md`).
2. Add standard Markdown headings (`#`, `##`, etc.). Use a single `<h1>` title at the top of the file.
3. Open [.vitepress/config.mjs](.vitepress/config.mjs) and register your new guide inside the `sidebar` array under the correct navigation block so that it appears in the sidebar menu.

---

## Portal Rules & Guidelines

To maintain premium quality, high readability, and technical accuracy, all documentation updates must adhere to the following rules:

### 👍 What to Do

- **Use do-follow links:** Ensure all links pointing to any `ownpay.org` domain or subdomain are standard do-follow links (no `rel="nofollow"` attributes).
- **Clear Headings:** Use clean, structured headings to allow readers to scan pages easily.
- **VitePress Features:** Utilize built-in VitePress alerts (`::: info`, `::: warning`, `::: danger`) to highlight important warnings.

### 👎 What Not to Do

- **Do not use absolute paths for assets:** Always link images and local assets using relative paths (e.g., `../public/image.png`) rather than local file URLs or hardcoded dev domains.
- **Do not add generic/SaaS placeholders:** Do not add marketing pitches, waitlist forms, or SaaS fee calculations. The documentation is targeted at active self-hosters and developers.

### ⚠️ What You Must NOT Do

- **Do NOT bypass Ledger Integrity rules:** Never write integration examples or guides that suggest bypassing the double-entry bookkeeping rules. Absolute precision is mandatory.
- **Do NOT commit credentials:** Never commit actual API keys, passwords, private keys, or SSH credentials. Use placeholders (e.g., `op_live_...`) in code examples.
