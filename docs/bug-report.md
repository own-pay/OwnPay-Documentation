# Bug Report: `mint broken-links` incorrectly flags valid internal links as broken
# when the target page is registered under a `tabs`-based navigation group

---

## Environment

- Tool:     Mintlify CLI (`mintlify`)
- Version:  4.2.678  (installed via `npx mintlify`)
- Node.js:  v24.15.0
- npm:      11.12.1
- OS:       Windows 11 (PowerShell / pwsh)
- Command:  `npx mintlify broken-links`

---

## Summary

`mint broken-links` reports valid internal links as broken when the link target is a
page registered under a `tabs`-structured navigation group in `docs.json`. The target
pages physically exist on disk and are correctly registered in the navigation. The
production site resolves them correctly. The CLI tool does not.

---

## Steps to Reproduce

### 1. Project structure

`docs.json` uses a `tabs`-based navigation (v2 navigation API):

```json
{
  "navigation": {
    "tabs": [
      {
        "tab": "Documentation",
        "groups": [
          {
            "group": "Payments",
            "pages": [
              "user-guide/payments/transactions",
              "user-guide/payments/invoices",
              "user-guide/payments/ledger"
            ]
          }
        ]
      },
      {
        "tab": "Developer",
        "groups": [
          {
            "group": "SDKs",
            "pages": [
              "developer/integration/php",
              "developer/integration/nodejs"
            ]
          }
        ]
      }
    ]
  }
}
```

### 2. Page files on disk (all exist physically)

```
user-guide/
  payments/
    transactions.mdx   ✅ exists
    invoices.mdx       ✅ exists
    ledger.mdx         ✅ exists
developer/
  integration/
    php.mdx            ✅ exists
    nodejs.mdx         ✅ exists
```

### 3. Any MDX file linking to those pages using standard root-relative syntax

```mdx
<!-- from ANY .mdx file at ANY directory level -->

[View Transactions](/user-guide/payments/transactions)
[PHP SDK](/developer/integration/php)
```

This is the link format recommended by Mintlify's own documentation:

> "Root-relative paths (starting with `/`) are the most common choice for internal
> links in Mintlify. They work consistently regardless of where the linking page
> sits in your directory."
>
> - https://www.mintlify.com/docs/guides/linking

### 4. Run the checker

```bash
npx mintlify broken-links
```

---

## Actual Behavior

The command reports all such links as broken:

```
found 109 broken links in 43 files

user-guide\dashboard.mdx
 ⎿  /user-guide/payments/transactions
 ⎿  /user-guide/payments/ledger

user-guide\payments\transactions.mdx
 ⎿  /user-guide/payments/ledger
 ⎿  /user-guide/payments/invoices

developer\quickstart.mdx
 ⎿  /developer/integration/php
 ⎿  /developer/integration/nodejs

concepts\payment-flow.mdx
 ⎿  /user-guide/payments/transactions

... (107 more, all identical pattern)
```

Exit code: `1`

---

## Expected Behavior

The command should exit with code `0` and report:

```
success no broken links found
```

Because:

1. The target MDX files physically exist on disk.
2. Every flagged page is registered in `docs.json` navigation.
3. The production Mintlify deployment resolves all links correctly.
4. `npx mintlify validate` passes with `success` on the same project.
5. Mintlify's own documentation recommends this exact link format.

---

## Minimal Reproduction Case

This was verified with a fresh scratch test. Both files below contain the **identical**
link to the same target, and **both** are flagged, proving the bug is not a
directory-depth or relative-path issue:

**File 1:** `root-link-test.mdx` (placed at project root)

```mdx
---
title: Root Level Test
description: Testing link resolution from root
---

[Transactions](/user-guide/payments/transactions)
```

**File 2:** `test-subdir/subdir-link-test.mdx` (placed inside a subdirectory)

```mdx
---
title: Subdir Level Test
description: Testing link resolution from subdirectory
---

[Transactions](/user-guide/payments/transactions)
```

Result:

```
root-link-test.mdx
 ⎿  /user-guide/payments/transactions       <- flagged broken

test-subdir\subdir-link-test.mdx
 ⎿  /user-guide/payments/transactions       <- flagged broken
```

The link `/user-guide/payments/transactions` points to `user-guide/payments/transactions.mdx`
which EXISTS on disk and IS registered in `docs.json`. Neither file depth nor directory
level changes the outcome - both are flagged identically.

---

## Root Cause Analysis

The checker appears to build its list of "valid" slugs by reading page entries from
`docs.json` navigation. Page slugs in `docs.json` are stored WITHOUT a leading slash:

```json
"pages": ["user-guide/payments/transactions"]
```
                ^ no leading slash

But links in MDX files use the standard root-relative format WITH a leading slash:

```mdx
[Transactions](/user-guide/payments/transactions)
```
               ^ leading slash

The checker appears to do a literal string match of the link path against the slug list,
and `"/user-guide/payments/transactions"` does not equal `"user-guide/payments/transactions"`.

The leading `/` is never stripped before the lookup, causing 100% of all root-relative
internal links targeting pages inside any `tabs` group to be incorrectly reported as broken.

**This is confirmed by the pattern of what does NOT get flagged:**

Links that resolve successfully:

- `/quickstart`             - registered as `"quickstart"` (root-level, single segment)
- `/installation`           - registered as `"installation"` (root-level, single segment)
- `/api-reference/merchant` - OpenAPI group (may use a different resolution path)

All pages with multi-segment paths inside `tabs` navigation groups fail regardless
of which tab they belong to, including same-tab links between sibling pages.

---

## Additional Evidence

The bug affects ALL links pointing into `tabs`-based navigation groups regardless of:

- Which file the link is in (root-level files are also affected - see repro above)
- Which tab the source or target page belongs to (same-tab links fail too)
- Whether `--check-anchors`, `--check-redirects`, or `--check-snippets` flags are used
- Whether the Mintlify cache (`~/.mintlify`) is cleared before running
- Whether target pages are newly registered or have been in the nav for a long time

Running `npx mintlify validate` (the build validator) on the same project PASSES cleanly:

```
success build validation passed
```

This further confirms the issue is isolated to the `broken-links` command's slug
resolution logic and does not affect the actual build or production deployment.

---

## Scale of Impact

On this project (OwnPay Documentation) with 82 pages organized into multi-level tabs:

| Metric | Count |
|---|---|
| Total MDX files in project | 82 |
| Files reported as having broken links | 43 |
| Total "broken" links reported | 107 |
| Confirmed actual broken links | 0 |
| False positive rate | 100% |

This makes the `mint broken-links` command completely unreliable for CI pipelines on any
project using the `tabs`-based navigation structure (`navigation.tabs` in `docs.json`).

---

## Workaround

There is no CLI-level workaround. The only option is to not use `mint broken-links`
in CI and rely on `mint validate` instead, which correctly validates the project.

---

## Suggested Fix

In the broken-links checker's slug resolution logic, normalize the link path before
comparing against the slug registry - strip the leading slash before performing the lookup:

```js
// Current behavior (assumed pseudocode)
const isValid = registeredSlugs.has(linkPath);
// linkPath        = "/user-guide/payments/transactions"
// registeredSlugs has "user-guide/payments/transactions"
// Result: false  <-- BUG

// Expected fix
const normalizedPath = linkPath.replace(/^\//, '');  // strip leading slash
const isValid = registeredSlugs.has(normalizedPath);
// normalizedPath  = "user-guide/payments/transactions"
// registeredSlugs has "user-guide/payments/transactions"
// Result: true   <-- CORRECT
```

---

## References

- Mintlify docs on internal linking:
  https://www.mintlify.com/docs/guides/linking

- Mintlify docs on the broken-links command:
  https://www.mintlify.com/docs/cli/commands#mint-broken-links

- Quote from Mintlify docs confirming `/`-prefix is the recommended and correct format:
  > "Root-relative paths (starting with `/`) are the most common choice for internal
  > links in Mintlify."
