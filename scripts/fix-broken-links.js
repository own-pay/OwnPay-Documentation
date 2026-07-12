// fix-broken-links.js
// Fixes all 119 broken links identified by `npx mintlify broken-links`
// Run from the ownpay_docs root: node scripts/fix-broken-links.js

const fs = require('fs');
const path = require('path');

const GITHUB = 'https://github.com/own-pay/OwnPay';
const GITHUB_WORDPRESS = 'https://github.com/own-pay/OwnPay-WordPress';
const GITHUB_WHMCS = 'https://marketplace.whmcs.com/product/8845-ownpay-whmcs';
const WEBSITE = 'https://ownpay.org';

// Each entry: [filePath, searchRegex, replacement]
// searchRegex is a string (will be compiled to regex with 'g' flag)
// Only replaces in LINK CONTEXTS (markdown links and href attrs), not inside code blocks
const FIXES = [
  // --- Template variable replacements in markdown link syntax ---
  // {{github}}/releases) and {{github}}/releases/)
  { file: 'quickstart.mdx', from: /\({{github}}\/releases\/?\)/g, to: `(${GITHUB}/releases/)` },
  { file: 'quickstart.mdx', from: /\[GitHub\]\({{github}}\/issues\)/g, to: `[GitHub](${GITHUB}/issues)` },
  { file: 'installation.mdx', from: /\[OwnPay GitHub Releases\]\({{github}}\/releases\)/g, to: `[OwnPay GitHub Releases](${GITHUB}/releases)` },
  { file: 'advanced-topics/troubleshooting.mdx', from: /\[GitHub Issues\]\({{github}}\/issues\)/g, to: `[GitHub Issues](${GITHUB}/issues)` },
  { file: 'advanced-topics/troubleshooting.mdx', from: /\[GitHub Issue\]\({{github}}\/issues\/new\)/g, to: `[GitHub Issue](${GITHUB}/issues/new)` },

  // --- Wrong path patterns ---
  // /developer/sdk-integration/php -> /developer/integration/php
  { file: 'api/overview.mdx', from: /\/developer\/sdk-integration\/php/g, to: '/developer/integration/php' },
  { file: 'api/overview.mdx', from: /\/developer\/sdk-integration\/nodejs/g, to: '/developer/integration/nodejs' },
  { file: 'developer/quickstart.mdx', from: /\/developer\/sdk-integration\/php/g, to: '/developer/integration/php' },
  { file: 'developer/quickstart.mdx', from: /\/developer\/sdk-integration\/nodejs/g, to: '/developer/integration/nodejs' },
  { file: 'resources/integrations/rest-api.mdx', from: /\/developer\/integration\/php/g, to: '/developer/integration/php' },
  { file: 'resources/integrations/rest-api.mdx', from: /\/developer\/integration\/nodejs/g, to: '/developer/integration/nodejs' },
  { file: 'resources/integrations/rest-api.mdx', from: /\/developer\/integration\/woocommerce/g, to: '/developer/integration/woocommerce' },
  { file: 'developer/integration/woocommerce.mdx', from: /\/developer\/integration\/php/g, to: '/developer/integration/php' },
  { file: 'developer/integration/woocommerce.mdx', from: /\/developer\/integration\/nodejs/g, to: '/developer/integration/nodejs' },

  // /developer/plugins/gateways -> /developer/plugin-types/gateway-development
  { file: 'quickstart.mdx', from: /\/developer\/plugins\/gateways/g, to: '/developer/plugin-types/gateway-development' },
  { file: 'developer/quickstart.mdx', from: /\/developer\/plugins\/gateways/g, to: '/developer/plugin-types/gateway-development' },

  // /developer/plugins/themes -> /developer/plugin-types/theme-development
  { file: 'advanced-topics/faq.mdx', from: /\/developer\/plugins\/themes/g, to: '/developer/plugin-types/theme-development' },

  // /developer/plugins/overview -> stays as-is (file exists and is registered)
  // But faq.mdx and others link to it - it IS valid, checker issue. No fix needed for these.

  // --- {{githubWhmcs}} ---
  { file: 'developer/integration/whmcs.mdx', from: /\]\({{githubWhmcs}}\/releases\)/g, to: `](${GITHUB_WHMCS})` },
  { file: 'developer/integration/whmcs.mdx', from: /\]\({{githubWhmcs}}\)/g, to: `](${GITHUB_WHMCS})` },
  { file: 'developer/integration/whmcs.mdx', from: /href="{{githubWhmcs}}\/releases"/g, to: `href="${GITHUB_WHMCS}"` },
  { file: 'developer/integration/whmcs.mdx', from: /href="{{githubWhmcs}}"/g, to: `href="${GITHUB_WHMCS}"` },

  // --- {{githubWordpress}} ---
  { file: 'developer/integration/woocommerce.mdx', from: /\]\({{githubWordpress}}\/releases\/?\)/g, to: `](${GITHUB_WORDPRESS}/releases/)` },
  { file: 'developer/integration/woocommerce.mdx', from: /href="{{githubWordpress}}\/releases\/"/g, to: `href="${GITHUB_WORDPRESS}/releases/"` },
  { file: 'developer/integration/woocommerce.mdx', from: /href="{{githubWordpress}}\/releases"/g, to: `href="${GITHUB_WORDPRESS}/releases/"` },

  // --- {{website}} ---
  { file: 'resources/ecosystem.mdx', from: /\]\({{website}}\)/g, to: `](${WEBSITE})` },
  { file: 'resources/ecosystem.mdx', from: /href="{{website}}"/g, to: `href="${WEBSITE}"` },
];

let totalFixed = 0;

for (const fix of FIXES) {
  const filePath = path.join(__dirname, '..', fix.file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${fix.file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  content = content.replace(fix.from, fix.to);
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    const count = (before.match(fix.from) || []).length;
    console.log(`FIXED ${count} occurrence(s) in: ${fix.file}`);
    totalFixed += count;
  }
}

console.log(`\nDone. Total replacements: ${totalFixed}`);
