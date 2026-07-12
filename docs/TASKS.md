# OwnPay Documentation - Implementation Tasks

> **Last updated:** 2026-07-12
> **Status:** Active - Pending implementation
> **Owner:** OwnPay team

This document is the single source of truth for all pending improvements to the OwnPay documentation site. It is written for an AI agent that will execute these tasks. Read every section carefully before touching any file.

---

## Agent Instructions

Before starting any task, you MUST:

1. **Read all relevant skills** - Skills are located in `.agents/skills/`. Read them before using Mintlify components or APIs.
2. **Brainstorm before writing new content** - Before writing any new MDX page or creating new documentation content (TASK-05, TASK-08, TASK-09, TASK-10, TASK-11, TASK-12, TASK-13, TASK-14), invoke the `brainstorming` superpowers skill from the global skills directory. This explores intent and design before implementation. Announce: "Using brainstorming skill to explore [task name]."
3. **Query Mintlify docs via MCP** - Use the `mintlify-docs` MCP (`https://www.mintlify.com/docs/mcp`) to confirm component syntax and configuration options. Never rely on training data alone.
4. **Use `mintlify-guides` MCP** - Use it to follow Mintlify best practices for writing, structure, and navigation.
5. **Use `mintlify-learn` MCP** - Use it to understand how Mintlify features work before implementing.
6. **Use the `mintlify` MCP** - Use it for direct read/write access to the OwnPay Mintlify account and deployment.
7. **Run validation before claiming done** - After every task, run the local validation pipeline (see bottom of this file). Never claim a task is complete without running validation.
8. **Do NOT push to GitHub** - Work locally. Push only when explicitly told by the user.
9. **Philosophy** - Make it simple, premium, professional. Users come here for help. If it looks complex or confusing, you have failed.

### Required skills to read

- `.agents/skills/mintlify/SKILL.md` - Core Mintlify guidelines (read before every task)
- `.agents/skills/mintlify-api/SKILL.md` - Mintlify REST API access
- `.agents/skills/mintlify-docs/SKILL.md` - Mintlify documentation querying

### Superpowers skills (invoke these when they apply)

These skills are in the global skills directory (not in `.agents/skills/`). Invoke them before the relevant tasks:

| Skill | When to use |
|-------|-------------|
| `brainstorming` | Before writing any new MDX page or new documentation content |
| `systematic-debugging` | When something is not rendering correctly or validation fails |
| `verification-before-completion` | Before marking any task complete - run validation and confirm output |
| `writing-plans` | If a task is complex enough to need a mini implementation plan before starting |

### Available MCP servers

- `mintlify` - Edit OwnPay docs via Mintlify dashboard (`https://mcp.mintlify.com`)
- `mintlify-docs` - Query Mintlify documentation (`https://www.mintlify.com/docs/mcp`)
- `mintlify-guides` - Query Mintlify guides for advanced documentation patterns and examples (`https://www.mintlify.com/guides/mcp`)
- `mintlify-learn` - Search Mintlify Learn resources for MCP and interactive features (`https://learn.mintlify.com/mcp`)
- `cloudflare-bindings` - Cloudflare Workers, KV, R2, D1
- `cloudflare-observability` - Analytics and logs
- `cloudflare-browser` - Fetch web pages as markdown

### Key project facts

- Mintlify theme: `mint`
- Primary color: `#0F97ED` (OwnPay blue)
- Font: `Inter`
- GitHub repo: `own-pay/OwnPay-Documentation` (master branch)
- Live URL: `https://ownpay.org/docs` (proxied via Cloudflare Worker from `ownpay.mintlify.site`)
- Do NOT add `/docs` prefix to internal links - Mintlify appends it automatically
- Config file: `docs.json` (NEVER use `mint.json` - it is deprecated)

### Do NOT edit these files directly (they are auto-synced)

| File | Source |
|------|--------|
| `user-guide/changelog.mdx` | `own-pay/OwnPay` - `CHANGELOG.md` |
| `resources/architecture.mdx` | `own-pay/OwnPay` - `docs/ARCHITECTURE.md` |
| `resources/features.mdx` | `own-pay/OwnPay` - `docs/FEATURES.md` |
| `resources/local-setup.mdx` | `own-pay/OwnPay` - `docs/LOCAL_SETUP.md` |
| `resources/contributing.mdx` | `own-pay/OwnPay` - `CONTRIBUTING.md` |
| `resources/roadmap.mdx` | `own-pay/OwnPay` - `ROADMAP.md` |
| `developer/translations.mdx` | `own-pay/OwnPay` - `docs/TRANSLATIONS.md` |

---

## Validation Pipeline

Run this after completing every task. Do not claim done until all pass.

```powershell
# 1. Clear local Mintlify cache
Remove-Item -Recurse -Force C:\Users\iamna\.mintlify

# 2. Validate configuration and MDX
npx mintlify validate

# 3. Check for broken links and anchors
npx mintlify broken-links --check-anchors --check-redirects --check-snippets

# 4. Accessibility check
npx mintlify a11y
```

---

## Completed Tasks

These tasks have already been implemented. Do not redo them.

- [x] OwnPay branding color applied (`#0F97ED` primary)
- [x] Header GitHub stars count shown dynamically (via `script.js`)
- [x] Getting Started CTA button removed from header
- [x] Footer dynamic description injected via `script.js`
- [x] Installation page redesigned with Tabs, Steps, and Accordion components
- [x] Subscribe page redesigned with channel hub cards
- [x] Ecosystem page updated with REST API registry docs
- [x] Mintlify validation passed

---

## Pending Tasks

Tasks are ordered by priority. Work through them in order unless parallelism is possible.

---

### TASK-01: Fix footer internal links

**Priority:** High - broken navigation
**Files:** `docs.json`
**Skill:** `.agents/skills/mintlify/SKILL.md`

**Problem:** Footer links currently have a `/docs` prefix hardcoded (e.g., `"/docs/quickstart"`). Mintlify automatically prepends `/docs` during deployment, so these paths result in double-prefixing (`/docs/docs/quickstart`). They must use paths without the `/docs` prefix.

**Implementation:**

1. Open `docs.json`
2. Find the `footer.links` array (around line 368)
3. Change all `href` values to remove the `/docs` prefix:
   - `"/docs/quickstart"` -> `"/quickstart"`
   - `"/docs/resources/architecture"` -> `"/resources/architecture"`
   - `"/docs/resources/features"` -> `"/resources/features"`
   - `"/docs/resources/local-setup"` -> `"/resources/local-setup"`
   - `"/docs/resources/glossary"` -> `"/resources/glossary"`
   - `"/docs/advanced-topics/faq"` -> `"/advanced-topics/faq"`
   - `"/docs/developer/quickstart"` -> `"/developer/quickstart"`
   - `"/docs/user-guide/developers/developer-hub"` -> `"/user-guide/developers/developer-hub"`
   - `"/docs/resources/ecosystem"` -> `"/resources/ecosystem"`
   - `"/docs/developer/plugins/events"` -> `"/developer/plugins/events"`
   - `"/docs/developer/plugins/overview"` -> `"/developer/plugins/overview"`
   - `"/docs/api-reference/merchant"` -> `"/api-reference/merchant"`
   - `"/docs/user-guide/dashboard"` -> `"/user-guide/dashboard"`
   - `"/docs/concepts/brands"` -> `"/concepts/brands"`
   - `"/docs/concepts/payment-flow"` -> `"/concepts/payment-flow"`
   - `"/docs/concepts/ledger"` -> `"/concepts/ledger"`
   - `"/docs/advanced-topics/security-compliance"` -> `"/advanced-topics/security-compliance"`
   - `"/docs/advanced-topics/troubleshooting"` -> `"/advanced-topics/troubleshooting"`
   - `"/docs/resources/contributing"` -> `"/resources/contributing"`
   - `"/docs/resources/roadmap"` -> `"/resources/roadmap"`
   - `"/docs/user-guide/changelog"` -> `"/user-guide/changelog"`
4. Keep all `https://github.com/...` and other external `href` values as-is (they are absolute URLs and must NOT be changed)
5. Run validation

**Acceptance criteria:**

- All footer links use paths without `/docs` prefix
- External GitHub links remain unchanged
- `npx mintlify broken-links` passes

---

### TASK-02: Update WHMCS link to marketplace URL

**Priority:** High
**Files:** `docs.json`, `developer/integration/whmcs.mdx`
**Skill:** `.agents/skills/mintlify/SKILL.md`

**Problem:** The WHMCS integration currently links to the GitHub repository. The user wants it to point to the WHMCS Marketplace listing instead.

**Implementation:**

1. In `docs.json`, update the `variables.githubWhmcs` value:
   - Current: `"https://github.com/own-pay/OwnPay-WHMCS"`
   - New: `"https://marketplace.whmcs.com/product/8845-ownpay-whmcs"`
2. In `developer/integration/whmcs.mdx`, update the Card component to reflect the marketplace context:
   - Change `title` from `"OwnPay WHMCS Repository"` to `"OwnPay on WHMCS Marketplace"`
   - Change the description text to: `Download the official OwnPay module from the WHMCS Marketplace.`
3. Also add a second Card linking to the GitHub source:

   ```mdx
   <Card
     title="Source Code on GitHub"
     href="https://github.com/own-pay/OwnPay-WHMCS"
   >
     View the open-source code, report bugs, or contribute on GitHub.
   </Card>
   ```

4. Wrap both cards in a `<CardGroup cols={2}>` component
5. Run validation

**Acceptance criteria:**

- `{{githubWhmcs}}` variable now resolves to the marketplace URL
- WHMCS page shows two cards: marketplace and GitHub
- Links are valid

---

### TASK-03: Enable Mintlify telemetry and email collection

**Priority:** Medium
**Files:** `docs.json`
**MCP:** `mintlify-docs` (query: "telemetry analytics email collection feedback")

**Problem:** Mintlify telemetry is not enabled. The user wants to collect page view analytics and enable email collection from the feedback widget.

**Implementation:**

1. Query `mintlify-docs` MCP for the correct configuration keys for telemetry and email collection
2. Add an `"analytics"` section to `docs.json` if supported, or the relevant telemetry keys
3. Enable email collection for the feedback widget - check if `feedback.emailFeedback` or similar key exists in the Mintlify schema at `https://mintlify.com/docs.json`
4. Check the schema for any `"telemetry"` key at the top level of `docs.json`

**Research first:** Before implementing, use the `mintlify-docs` MCP to search for "feedback email" and "telemetry" in the Mintlify documentation. The exact keys may have changed. Do not guess - verify with MCP.

**Acceptance criteria:**

- `docs.json` has correct telemetry/analytics configuration
- `npx mintlify validate` passes with no schema errors

---

### TASK-04: Add Microsoft Clarity tracking script

**Priority:** Medium
**Files:** `docs.json`, `script.js`
**MCP:** `mintlify-docs` (query: "custom scripts analytics head injection")

**Problem:** Microsoft Clarity needs to be added for user behavior analytics. It must be injected in the document head without degrading page performance.

**Implementation:**

1. Query `mintlify-docs` MCP for how to inject custom scripts in `docs.json` (look for `"custom"` -> `"scripts"` or `"head"` configuration)
2. The Clarity script pattern is:

   ```javascript
   <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "xfbp4tcicy");

</script>
   ```

   **Note:** Check `script.js` in the repo root for any existing Clarity references or project ID. If not found, add a placeholder and document that the project ID must be configured.

1. Add the script via `docs.json` using the correct Mintlify configuration key (likely `"scripts"` array with `"src"` or inline `"content"`)
2. If Mintlify does not support inline scripts in `docs.json`, add it to `script.js` in the project root (Mintlify loads `script.js` automatically)
3. Ensure the script is loaded asynchronously to avoid render blocking

**Research first:** Check `script.js` in repo root for any existing analytics setup. Then query MCP for the correct approach.

**Acceptance criteria:**

- Clarity script is loaded on every page
- Script does not block page rendering
- `npx mintlify validate` passes

---

### TASK-05: Design a standalone home page (index.mdx)

**Priority:** High - first impression
**Files:** `index.mdx` (existing), `docs.json`
**Skills:** `.agents/skills/mintlify/SKILL.md`, brainstorming superpowers skill
**MCP:** `mintlify-docs`, `mintlify-guides`

**Problem:** The current `index.mdx` is a basic page. The user wants a dedicated standalone homepage similar to `https://learn.ownpay.org` - no sidebar, full-width layout, welcoming and easy to navigate.

**Design principles (think as a user, not a developer):**

- User arrives and immediately understands what OwnPay is and what the docs cover
- Clear call-to-action paths: "Install OwnPay", "Quick Start", "API Reference", "Developer Guide"
- Not overwhelming - clean and scannable
- Premium feel without marketing fluff

**Implementation:**

1. Query `mintlify-docs` MCP for `mode: "custom"` or full-width page layouts
2. Check Mintlify schema for `"layout"` frontmatter to disable sidebar
3. Update `index.mdx` frontmatter:

   ```yaml
   ---
   title: OwnPay Documentation
   description: Self-hosted payment orchestration platform. Install, configure, and extend OwnPay.
   mode: custom
   ---
   ```

4. Structure the page using Mintlify components only (no custom HTML unless unavoidable):
   - **Hero section:** Brief one-sentence value proposition + two primary CTA buttons (Get Started -> `/quickstart`, View on GitHub -> `https://github.com/own-pay/OwnPay`)
   - **Quick navigation cards:** 4 cards in a `<CardGroup cols={2}>`:
     - Install OwnPay (`/installation`)
     - Developer Quickstart (`/developer/quickstart`)
     - API Reference (`/api-reference/merchant`)
     - Plugin System (`/developer/plugins/overview`)
   - **What is OwnPay section:** 2-3 sentences description. Factual, no marketing language.
   - **Key capabilities section:** `<CardGroup cols={3}>` showing: Multi-brand support, 100+ gateways, White-label domains, Mobile companion app, Webhook system, Open source
   - **Next steps section:** `<Steps>` with 3 steps: Install -> Configure -> Go live

5. In `docs.json`, ensure `index` is the first page in the Getting Started group (it already is)
6. Run validation

**Style rules:**

- Second-person voice ("you")
- No marketing language ("powerful", "seamless", "robust")
- No emoji
- All headings in sentence case
- Keep text concise - one idea per sentence

**Acceptance criteria:**

- Homepage renders full-width with no sidebar
- 4 navigation cards are correct and links work
- All text is factual and uses active voice
- `npx mintlify validate` passes

---

### TASK-06: Redesign the changelog page

**Priority:** Medium
**Files:** `user-guide/changelog.mdx` - **WARNING: This file is auto-synced. Do NOT edit content below frontmatter.**
**MCP:** `mintlify-docs` (query: "changelog page design updates release notes")

**Problem:** The changelog page needs a premium design treatment. Since the content is auto-synced from the main repository, only the frontmatter and structural wrapper can be modified.

**Implementation:**

1. Query `mintlify-docs` MCP for changelog component and page configuration
2. Read `mintlify-guides` MCP for changelog best practices
3. The file is synced - the sync script preserves frontmatter. You may update frontmatter safely:

   ```yaml
   ---
   title: Changelog
   description: Release history and version notes for OwnPay.
   keywords: [changelog, releases, version history, updates]
   mode: wide
   ---
   ```

4. Check if Mintlify has a built-in `changelog` page type or `Update` component
5. If Mintlify offers an `Update` component for structured changelogs, document how to use it and add a note at the top explaining that content is auto-synced (MDX comment: `{/* Content below is auto-synced from OwnPay main repository */}`)
6. If no special component exists, ensure `mode: wide` and clean frontmatter are applied

**Important:** Do not change any content below the frontmatter - it is controlled by the sync script.

**Acceptance criteria:**

- Frontmatter has correct title, description, and `mode: wide`
- No content below frontmatter is modified
- `npx mintlify validate` passes

---

### TASK-07: Dynamic latest version in installation page

**Priority:** Medium
**Files:** `installation.mdx`, `script.js`

**Problem:** The installation page has a hardcoded version number. It should dynamically show the latest version from the OwnPay update registry API.

**Update Registry API - verified details (no SSH needed):**

The update registry is a public, unauthenticated REST API. No credentials required.

```
GET https://update.ownpay.org/api/v1/release
```

Response shape:

```json
{
  "latest": {
    "version": "0.2.0",
    "version_code": "0.2.0",
    "channel": "stable",
    "download_url": {
      "github": "https://github.com/own-pay/OwnPay/releases/download/v0.2.0/ownpay-0.2.0.zip",
      "local": "https://update.ownpay.org/releases/download/0.2.0/ownpay-0.2.0.zip"
    },
    "checksum_sha256": "...",
    "signature_url": "https://github.com/own-pay/OwnPay/releases/download/v0.2.0/signature.sig",
    "changelog_url": "https://github.com/own-pay/OwnPay/releases/download/v0.2.0/changelog.md",
    "release_date": "2026-07-xx",
    "size_bytes": 26210554,
    "min_php_version": "8.3.0",
    "breaking_changes": false
  },
  "releases": [ ... ]
}
```

Key fields to use: `latest.version`, `latest.download_url.github`, `latest.download_url.local`, `latest.checksum_sha256`, `latest.min_php_version`.

**Implementation:**

1. Read `script.js` to understand existing structure before adding new code
2. In `script.js`, add a `fetchLatestVersion()` async function:
   - Call `GET https://update.ownpay.org/api/v1/release`
   - Parse `response.latest.version` and `response.latest.download_url.github`
   - Update all DOM elements with `data-latest-version` attribute with the version string
   - Update all DOM elements with `data-latest-download` attribute with the GitHub download URL
   - Wrap in try/catch - on any error, silently fall back (do not show error to user)
   - Cache result in `sessionStorage` with key `ownpay_latest_version` to avoid repeated calls on navigation
3. Call `fetchLatestVersion()` on `DOMContentLoaded`
4. In `installation.mdx`, locate any hardcoded version references (e.g., `0.2.0` in download links or badge) and replace with:

   ```html
   <span data-latest-version>0.2.0</span>
   ```

   And for download links use:

   ```html
   <a href="https://github.com/own-pay/OwnPay/releases/latest" data-latest-download>Download latest</a>
   ```

5. The static fallback values (`0.2.0` in the span, GitHub releases/latest URL) must always be valid so the page works even if the API is unreachable

**Acceptance criteria:**

- `script.js` contains a `fetchLatestVersion()` function that calls `https://update.ownpay.org/api/v1/release`
- Function reads `latest.version` and `latest.download_url.github` from the response
- Result is cached in `sessionStorage`
- Falls back silently to static values on API failure
- `installation.mdx` has `data-latest-version` and/or `data-latest-download` attributes on relevant elements

---

### TASK-08: Gateway plugin AI prompt template

**Priority:** Medium
**Files:** Create `developer/plugin-types/gateway-prompt.mdx`
**Skills:** `.agents/skills/mintlify/SKILL.md`
**Reference:** `developer/plugin-types/gateway-development.mdx`, `developer/plugins/hooks.mdx`

**Problem:** Developers want to use AI assistants to scaffold new gateway plugins. The docs need a high-quality, usable prompt template - not a placeholder.

**Implementation:**

1. Read `developer/plugin-types/gateway-development.mdx` to understand the gateway plugin structure, hooks, required methods, and file layout
2. Read `developer/plugins/hooks.mdx` to understand available hooks and events
3. Create `developer/plugin-types/gateway-prompt.mdx` with:
   - Frontmatter: `title`, `description`, `keywords`
   - Introduction: Explain what this page is (a prompt template for AI-assisted gateway development)
   - A `<Note>` stating that the prompts work best with Claude, GPT-4, or Gemini
   - **System Prompt section:** A fenced code block (`language: text`) with a complete system prompt that instructs an AI to understand the OwnPay plugin contract, follow OwnPay PHP coding standards, and generate a gateway plugin scaffold with all required methods stubbed
   - **User Prompt example section:** A practical example prompt a developer would type
   - **Expected output structure section:** Show the expected file structure as a fenced code block
4. Add the page to `docs.json` under Developer > Plugin System group

**Style rules:**

- Real, usable prompts - not placeholders
- Concrete PHP code examples
- No marketing language

**Acceptance criteria:**

- Page renders correctly
- Prompt templates are functional, not placeholder text
- Page is listed in `docs.json` navigation

---

### TASK-09: Addon plugin AI prompt template

**Priority:** Medium
**Files:** Create `developer/plugin-types/addon-prompt.mdx`
**Reference:** `developer/plugin-types/addon-development.mdx`, TASK-08 above

**Implementation:** Follow the same approach as TASK-08 but for addon plugins. Read `addon-development.mdx` first to understand the addon plugin contract, then create a high-quality prompt template. Add to `docs.json` navigation under the Plugin System group.

---

### TASK-10: Theme plugin AI prompt template

**Priority:** Medium
**Files:** Create `developer/plugin-types/theme-prompt.mdx`
**Reference:** `developer/plugin-types/theme-development.mdx`, TASK-08 above

**Implementation:** Follow the same approach as TASK-08 but for theme plugins. Read `theme-development.mdx` first to understand the theming system (CSS variables, layout overrides, template structure), then create a high-quality prompt template. Add to `docs.json` navigation under the Plugin System group.

---

### TASK-11: Third-party integration AI prompt template

**Priority:** Low
**Files:** Create `developer/plugin-types/integration-prompt.mdx`
**Reference:** `developer/plugins/overview.mdx`, `developer/plugins/hooks.mdx`

**Implementation:** Create a prompt template for developers building third-party integrations (e.g., integrating OwnPay with an external CRM or e-commerce platform via webhooks and API). Add to `docs.json` navigation under the Plugin System group.

---

### TASK-12: AI Agent documentation page (`/developer/ai-mcp`)

**Priority:** Medium
**Files:** `developer/ai-mcp.mdx` (existing)
**Skills:** `.agents/skills/mintlify/SKILL.md`

**Problem:** The `developer/ai-mcp.mdx` page needs to be optimized so that AI assistants (Claude, GPT, Gemini, Cursor, etc.) can use the OwnPay docs as a knowledge source. This means clear system instructions, MCP server configuration, and usage examples that an AI agent would actually need.

**Context:**

- The `contextual` section in `docs.json` already includes: copy, view, chatgpt, claude, perplexity, grok, aistudio, devin, mcp, add-mcp, cursor, vscode, devin-mcp, windsurf, assistant, download-spec, download-pdf
- The MCP endpoint is `https://ownpay.org/docs/mcp` (stored in `variables.mcpUrl`)
- The skills file URL is `https://ownpay.org/docs/skill.md` (stored in `variables.skillsUrl`)

**Implementation:**

1. Read the existing `developer/ai-mcp.mdx`
2. Rewrite it to include:
   - **What this page is:** Explains how to configure AI assistants to use OwnPay docs
   - **MCP server configuration section:** Shows exactly how to add OwnPay to Claude Desktop, Cursor, Windsurf, VS Code - use `<Tabs>` for each tool
   - **System prompt for AI assistants:** A fenced code block with a complete, accurate system prompt that any developer can copy into their AI assistant to get OwnPay-aware help. The system prompt must include: OwnPay architecture, key concepts (brands, gateways, plugins), relevant API endpoints, and links to docs
   - **Skills file section:** Explain what `skill.md` provides and how to load it in different AI tools
   - **Example queries section:** 5 real example queries developers would ask
3. Ensure all code blocks have correct language tags
4. Use `<Steps>` for setup procedures

**Acceptance criteria:**

- Page is practical and usable by a developer setting up an AI assistant
- MCP configuration examples are accurate
- `npx mintlify validate` passes

---

### TASK-13: AI Skills documentation page (`/developer/ai-skills`)

**Priority:** Low
**Files:** `developer/ai-skills.mdx` (existing)

**Problem:** The `developer/ai-skills.mdx` page needs to explain the OwnPay AI skill system and provide downloadable/copyable skill definitions.

**Implementation:**

1. Read the existing `developer/ai-skills.mdx`
2. Query `mintlify-docs` MCP for best practices on documentation pages that provide downloadable resources
3. Rewrite to include:
   - What AI skills are in the context of OwnPay
   - How to load the OwnPay skill into an AI assistant
   - Skill file format (YAML frontmatter + markdown body)
   - A copyable code block with a starter skill template for OwnPay developers
4. Add a direct download link to the skills file at `{{skillsUrl}}`

---

### TASK-14: Custom 404 page

**Priority:** Medium
**Files:** `docs.json`, possibly a new `404.mdx`
**MCP:** `mintlify-docs` (query: "custom 404 page error page")

**Problem:** The current 404 configuration is minimal. The user wants a premium 404 experience that guides users to find what they need.

**Current config in `docs.json` (around line 415):**

```json
"errors": {
  "404": {
    "title": "Page not found",
    "description": "The page you're looking for doesn't exist. [Go to homepage](/) or [search the docs](/)."
  }
}
```

**Implementation:**

1. Query `mintlify-docs` MCP for the full range of 404 customization options in Mintlify
2. Check if Mintlify supports a custom 404 MDX page (e.g., `404.mdx`)
3. If MDX 404 page is supported: Create `404.mdx` with:
   - Clear message that the page was not found
   - A `<CardGroup cols={2}>` with the 4 most useful destinations: Home, Installation, API Reference, Getting Help
   - A `<Note>` suggesting the user use the search bar
   - No sidebar (`mode: custom`)
4. If only `errors.404` JSON config is supported: Update the description to be more helpful with multiple links
5. Run validation

**Acceptance criteria:**

- 404 experience guides users to useful pages
- `npx mintlify validate` passes

---

### TASK-15: Header announcement banner upgrade

**Priority:** Low
**Files:** `docs.json`

**Problem:** The current banner is plain text: `"New version 0.2.0 release"`. It should be more informative and include a link to the changelog.

**Implementation:**

1. Query `mintlify-docs` MCP to confirm banner supports Markdown links in `content`
2. Update `docs.json` `banner.content`:

   ```json
   "banner": {
     "content": "OwnPay v0.2.0 is available. [See what's new](/user-guide/changelog)",
     "dismissible": true
   }
   ```

3. Keep it concise - one sentence maximum
4. Run validation

**Acceptance criteria:**

- Banner includes version and a link to changelog
- Banner is dismissible
- `npx mintlify validate` passes

---

### TASK-16: Multi-language (i18n) support

**Priority:** Low
**Files:** `docs.json`
**MCP:** `mintlify-docs` (query: "localization internationalization i18n multiple languages")

**Problem:** The user wants i18n support enabled in `docs.json` to prepare for future localization.

**Implementation:**

1. Query `mintlify-docs` MCP for how Mintlify handles i18n and the required `docs.json` configuration
2. Read the Mintlify schema at `https://mintlify.com/docs.json` for language/localization keys
3. Add the appropriate i18n configuration to `docs.json`
4. If Mintlify requires translated MDX files in language subdirectories, document the structure as a TODO comment in `docs.json` for future implementation
5. Run validation

**Acceptance criteria:**

- `docs.json` has i18n configuration (even if translations are not yet provided)
- `npx mintlify validate` passes with no schema errors

---

### TASK-17: Auto-sync workflow trigger from main repository

**Priority:** Low
**Files:** `.github/workflows/sync-docs.yml` (existing), `scripts/sync-github-files.js` (existing)

**Problem:** The auto-sync workflow runs every 6 hours on a schedule. The user wants it to also trigger automatically when relevant files change in the main `own-pay/OwnPay` repository.

**Implementation:**

1. Read `.github/workflows/sync-docs.yml` to understand the current workflow
2. Read `scripts/sync-github-files.js` to understand the sync logic
3. The workflow already supports `repository_dispatch` with type `sync-docs`. The missing piece is a trigger in the main `own-pay/OwnPay` repository.
4. Create `.github/workflows/notify-docs.yml` in this repo as a reference template showing the configuration that would need to be added to `own-pay/OwnPay`:

   ```yaml
   # This workflow should be added to the own-pay/OwnPay repository, not here.
   # It triggers the documentation sync when synced files change in the main codebase.
   name: Notify Docs Sync
   on:
     push:
       branches: [main]
       paths:
         - 'CHANGELOG.md'
         - 'CONTRIBUTING.md'
         - 'ROADMAP.md'
         - 'docs/ARCHITECTURE.md'
         - 'docs/FEATURES.md'
         - 'docs/LOCAL_SETUP.md'
         - 'docs/TRANSLATIONS.md'
   jobs:
     notify:
       runs-on: ubuntu-latest
       steps:
         - name: Trigger docs sync
           uses: peter-evans/repository-dispatch@v3
           with:
             token: ${{ secrets.DOCS_SYNC_TOKEN }}
             repository: own-pay/OwnPay-Documentation
             event-type: sync-docs
   ```

5. Add documentation comments to `sync-docs.yml` explaining the full setup

**Acceptance criteria:**

- Reference workflow file is created and clearly labeled as a template
- `sync-docs.yml` has documentation comments explaining the full trigger setup

---

### TASK-18: Footer logo description verification

**Priority:** Medium
**Files:** `script.js`, `style.css`

**Problem:** The `script.js` injects a description below the logo in the footer. Verify this is working correctly and the text is accurate.

**Implementation:**

1. Read `script.js` to find the footer description injection code
2. Verify the description text is accurate and matches the brand voice (factual, no marketing language)
3. Check that the CSS in `style.css` correctly styles the `.footer-description` class
4. If the injection is not working, debug and fix it
5. Preview with `npx mintlify dev` and manually verify the footer shows logo + description

**Acceptance criteria:**

- Footer shows logo + description text below it
- Description text matches brand voice
- Verified working in local preview (`npx mintlify dev`)

---

## Stretch Tasks (Lower Priority)

These tasks require additional research before implementation.

### TASK-S1: `llms.txt` optimization

**Files:** `llms.txt` (root)
**Task:** Review and update the `llms.txt` file for AI search engines. Ensure it accurately describes all documentation sections, key concepts, API endpoints, and links.

### TASK-S2: Feedback email collection

**Research needed:** Query `mintlify-docs` MCP for how Mintlify collects email from the feedback widget. If a configuration key exists, add it to `docs.json`. If not available in the current Mintlify plan, document it as not feasible.

---

## Implementation Notes

### Working with docs.json variables

Variables defined in `docs.json` under `"variables"` can be used in MDX files with double-brace syntax: `{{variableName}}`.

Current variables:

| Variable | Value |
|----------|-------|
| `{{version}}` | `0.2.0` |
| `{{github}}` | `https://github.com/own-pay/OwnPay` |
| `{{githubDocs}}` | `https://github.com/own-pay/OwnPay-Documentation` |
| `{{githubWordpress}}` | `https://github.com/own-pay/OwnPay-WordPress` |
| `{{githubWhmcs}}` | `https://marketplace.whmcs.com/product/8845-ownpay-whmcs` (after TASK-02) |
| `{{website}}` | `https://ownpay.org` |
| `{{docsUrl}}` | `https://ownpay.org/docs` |
| `{{mcpUrl}}` | `https://ownpay.org/docs/mcp` |
| `{{skillsUrl}}` | `https://ownpay.org/docs/skill.md` |
| `{{supportEmail}}` | `support@ownpay.org` |

### Mintlify component quick reference

| Use case | Component |
|----------|-----------|
| Multi-step process | `<Steps>` |
| Multiple options (OS, language) | `<Tabs>` and `<Tab>` |
| Collapsible details | `<Accordion>` and `<AccordionGroup>` |
| Navigation cards | `<Card>` in `<CardGroup>` |
| Code in multiple languages | `<CodeGroup>` |
| Important notice | `<Warning>`, `<Note>`, `<Info>`, `<Tip>` |
| API parameters | `<ParamField>` |
| Full-width layout | `mode: wide` or `mode: custom` in frontmatter |

### File naming conventions

- Kebab-case: `my-page-name.mdx`
- Match existing directory naming patterns
- Internal links: `/path/to/page` (no `.mdx` extension, no `/docs` prefix)

---

## Task Completion Checklist

Before marking any task complete, verify:

- [ ] MDX frontmatter has `title` and `description`
- [ ] All code blocks have language tags
- [ ] Internal links use root-relative paths without `/docs` prefix or `.mdx` extension
- [ ] New pages are added to `docs.json` navigation
- [ ] Content uses sentence case headings
- [ ] No marketing language or filler phrases
- [ ] No emoji in content
- [ ] `npx mintlify validate` passes
- [ ] `npx mintlify broken-links` passes (note: some external link false positives are expected)
- [ ] `npx mintlify a11y` passes
- [ ] Mintlify local preview (`npx mintlify dev`) renders correctly

---

### TASK-19: Add latest version download link to `llms.txt`

**Priority:** High - AI agent discoverability
**Files:** `llms.txt`
**MCP:** None required - straightforward file edit

**Problem:** AI agents that read `llms.txt` (the machine-readable docs map at `https://ownpay.org/docs/llms.txt`) currently have no way to discover or download the latest version of OwnPay. The user wants the latest version download link to be explicitly declared in `llms.txt` so any AI agent (Claude, GPT, Cursor, etc.) can find and retrieve it programmatically.

**Context - Update Registry API:**

The OwnPay Update Registry is a public, unauthenticated REST API at `https://update.ownpay.org/api/v1`. No API key is required.

The endpoint to fetch the latest version and its download links is:

```
GET https://update.ownpay.org/api/v1/release
```

Response shape (truncated to relevant fields):

```json
{
  "latest": {
    "version": "0.2.0",
    "version_code": "0.2.0",
    "channel": "stable",
    "download_url": {
      "github": "https://github.com/own-pay/OwnPay/releases/download/v0.2.0/ownpay-0.2.0.zip",
      "local": "https://update.ownpay.org/releases/download/0.2.0/ownpay-0.2.0.zip"
    },
    "checksum_sha256": "...",
    "signature_url": "https://github.com/own-pay/OwnPay/releases/download/v0.2.0/signature.sig",
    "changelog_url": "https://github.com/own-pay/OwnPay/releases/download/v0.2.0/changelog.md",
    "release_date": "2026-07-xx",
    "size_bytes": 26210554,
    "min_php_version": "8.3.0",
    "breaking_changes": false
  }
}
```

**Implementation:**

1. Open `llms.txt` in the project root
2. Add a new `## Downloads` section after the existing `## Documentation` section with the following content - use static values that match the current latest version in `docs.json` (`variables.version`). The API URL is also included so any AI agent can refresh the link dynamically:

```markdown
## Downloads

The latest stable release can be downloaded from the official update registry.

- **Latest Version:** 0.2.0
- **Registry API:** https://update.ownpay.org/api/v1/release (returns `latest.version` and `latest.download_url`)
- **Download (GitHub):** https://github.com/own-pay/OwnPay/releases/download/v0.2.0/ownpay-0.2.0.zip
- **Download (Mirror):** https://update.ownpay.org/releases/download/0.2.0/ownpay-0.2.0.zip
- **Signature:** https://github.com/own-pay/OwnPay/releases/download/v0.2.0/signature.sig
- **Changelog:** https://github.com/own-pay/OwnPay/releases/download/v0.2.0/changelog.md
- **Minimum PHP:** 8.3.0
```

1. Also add a `## Update Registry` section near the bottom of `llms.txt` to explain the API to any AI agent reading the file:

```markdown
## Update Registry

OwnPay publishes releases to a public update registry with a REST API. AI agents can use this API to fetch the latest version, download URL, SHA-256 checksum, and release notes without authentication.

- **Base URL:** https://update.ownpay.org/api/v1
- **Get latest release:** `GET https://update.ownpay.org/api/v1/release` - returns `latest` object with `version`, `download_url.github`, `download_url.local`, `checksum_sha256`, `signature_url`, `changelog_url`
- **Get specific version:** `GET https://update.ownpay.org/api/v1/release/{version_code}` - e.g., `GET https://update.ownpay.org/api/v1/release/0.2.0`
- **CORS:** Enabled for all origins. No API key required.
```

1. Keep all existing content in `llms.txt` intact. Only add these two new sections.

**Version maintenance note:** The static download links in `llms.txt` will need to be updated each release. This is acceptable for now. TASK-07 (dynamic version in `script.js`) handles the dynamic UI side - `llms.txt` is a static file read by crawlers and agents, not the browser.

**Acceptance criteria:**

- `llms.txt` contains a `## Downloads` section with the current latest version download links
- `llms.txt` contains a `## Update Registry` section explaining the API to AI agents
- All URLs are valid and reachable
- Existing content in `llms.txt` is not modified or removed
- `npx mintlify validate` passes (this file is not MDX but validate should still pass)

---

*This document is maintained by the OwnPay development team. Add new tasks at the end of the Pending Tasks section with a sequential TASK-XX identifier.*
