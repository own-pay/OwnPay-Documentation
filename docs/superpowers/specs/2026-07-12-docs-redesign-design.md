# Design Spec: Documentation Redesign & Feature Upgrades

This document outlines the design specification for upgrading the OwnPay documentation theme colors, header CTA layout, footer design, installation guide layout, update checking API documentation, and subscription page portal.

---

## 1. Branding Color Adjustments (`docs.json`)
We will replace the legacy green shades with OwnPay's official brand colors extracted from `logo/light.svg`:
* **Accent Blue (primary)**: `#0F97ED`
* **Hover Accent Blue (light)**: `#7EC8FC`
* **Dark Brand Blue (dark)**: `#102963`

---

## 2. Header CTA Layout (`docs.json` & `script.js`)
* Remove the custom `"primary"` CTA button (`Getting Started` button) from the `navbar` in `docs.json`.
* Add `topbarCtaButton` to the root config:
  ```json
  "topbarCtaButton": {
    "type": "github",
    "url": "https://github.com/own-pay/OwnPay"
  }
  ```
* Remove the redundant GitHub link from `navbar.links` to prevent duplicate GitHub icons.
* Remove the `updateGitHubStars` function from `script.js` since the new `topbarCtaButton` natively displays the star count.

---

## 3. Footer Design Overhaul (`script.js` & `style.css`)
* Remove the pseudo-element `::before` subscribe form label from `style.css`.
* In `script.js`, implement `injectFooterDescription()` inside the DOMContentLoaded listener and MutationObserver:
  * Locate `footer a[href*="/docs"]` (the footer logo).
  * Insert a paragraph `<p class="footer-description">` with content: `"Self-hosted, enterprise-grade payment orchestrator with multi-brand support, white-label domains, and 100+ payment gateways."`
* Style `.footer-description` in `style.css` (font-size 13.5px, margin-top 0.75rem, margin-bottom 1rem, line-height 1.6, max-width 320px, light/dark text colors).
* Ensure social icons are aligned directly below this paragraph.

---

## 4. Installation Guide Redesign (`installation.mdx`)
* **Hero Selector**: Introduce a 3-column `<CardGroup>` at the top pointing to `#shared-hosting`, `#vps-cloud-server`, and `#docker`.
* **Prerequisites Accordion**: Consolidate System Requirements (PHP 8.3+, MySQL 8.0+, extensions) inside an `<Accordion>` to improve scannability.
* **Shared Hosting Walkthrough**: Wrap all steps inside a `<Steps>` container. Use `<Tabs>` for each step (cPanel, Plesk, DirectAdmin, FTP) to display specific walkthroughs cleanly.
* **VPS / Cloud Server Walkthrough**: Update and format system dependencies and Nginx configs within `<Steps>`.
* **Docker Walkthrough**: Wrap steps inside `<Steps>` with docker-compose setup and command explanations.
* **Post-Installation Steps**: Detail the web wizard, cron setup, and SSL configuration.
* **Troubleshooting Accordion**: Add an accordion hub for 500 errors, database connection issues, and permissions.

---

## 5. Subscription Portal Redesign (`user-guide/subscribe.mdx`)
Redesign the page into a multi-channel hub using `<CardGroup>` containing:
* **Email Notifications**: A card containing a clean `mailto` link (`mailto:updates@ownpay.org?subject=Subscribe%20to%20OwnPay%20updates`) to let users easily subscribe.
* **GitHub Release Alerts**: A card directing users to watch the main repository releases.
* **Developer REST API**: A card pointing developers to the public REST API for update check integration.
* **Community & Support**: A card pointing to the Discord/GitHub discussions server.

---

## 6. Update Registry API Documentation (`resources/ecosystem.mdx`)
Replace legacy RSS mention with the official public Update Registry REST API specification:
* **Base URL**: `https://update.ownpay.org/api/v1`
* **Endpoints**:
  * `GET /release` — Returns details of the latest release and historical releases list.
  * `GET /release/{version_code}` — Returns details of a specific release.
* Provide clean request/response JSON block examples.

---

## 7. Category Icons (`docs.json`)
Migrate deprecated Lucide v3 icon names to Lucide v4 format:
* Change `bar-chart` -> `chart-bar` for the `Reports` category.
* Change `more-horizontal` -> `ellipsis` for the `Other` category.
