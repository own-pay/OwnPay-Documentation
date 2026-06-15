<script setup>
const icons = {
  globe:    `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  puzzle:   `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  ledger:   `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  phone:    `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
  api:      `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  shield:   `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  book:     `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  code:     `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  cube:     `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  arrow:    `<svg viewBox="0 0 16 16" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
  extarrow: `<svg viewBox="0 0 11 11" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9L9 2M9 2H4M9 2v5"/></svg>`,
}

const features = [
  { icon: 'globe',   badge: 'Industry First',  badgeColor: 'gold', title: 'White-Label Custom Domains',  desc: 'Every brand runs on its own custom domain with unique SSL. Your customers see your logo — never OwnPay.' },
  { icon: 'puzzle',  badge: '123 Built-in',     badgeColor: 'blue', title: 'Plugin Payment Gateways',     desc: 'Stripe, bKash, Nagad, M-Pesa, Razorpay, Crypto, and 115+ more. Sandboxed plugins that never touch core code.' },
  { icon: 'ledger',  badge: 'bcmath Precise',   badgeColor: 'teal', title: 'Double-Entry Ledger',         desc: 'Every transaction creates balanced debit and credit records. Atomic, rollback-safe, audit-complete bookkeeping.' },
  { icon: 'phone',   badge: 'Android App',      badgeColor: 'blue', title: 'Mobile SMS Gateway',          desc: 'Pair Android devices to auto-parse mobile banking SMS from bKash, Nagad, and local wallets. Zero API dependency.' },
  { icon: 'api',     badge: 'REST + Webhooks',  badgeColor: 'teal', title: 'Full API & Webhook Engine',   desc: 'Merchant, mobile, and admin REST APIs with HMAC-verified webhooks. Integrate any stack, any language.' },
  { icon: 'shield',  badge: 'PHPStan Lvl 9',    badgeColor: 'gold', title: 'Enterprise Security',         desc: 'AES-256-GCM field encryption, Argon2id passwords, strict CSP, rate limiting, CSRF guards, and granular RBAC.' },
]

const steps = [
  { num: '01', title: 'Download & Deploy',         desc: 'Extract the release, point your web server root at public/, then open the browser and navigate to /install.' },
  { num: '02', title: 'Create Brands & Gateways',  desc: 'Create fully isolated merchant brands, assign custom domains, and activate gateway plugins per brand.' },
  { num: '03', title: 'Start Collecting Payments', desc: 'Generate payment links, issue invoices, or call the REST API. Every transaction hits the ledger automatically.' },
]

const docSections = [
  { icon: 'book',     title: 'User Guide',     desc: 'Admin panel walkthrough: gateways, brands, payments, reports, and system settings.',         href: '/user-guide/',               external: false },
  { icon: 'code',     title: 'Developer Docs', desc: 'PHP & Node.js integration guides, webhook setup, and building custom payment plugins.',       href: '/developer/',                external: false },
  { icon: 'cube',     title: 'Plugin Catalog', desc: 'Browse 123+ payment gateway plugins and community-built extensions for OwnPay.',              href: 'https://plugin.ownpay.org',  external: true  },
  { icon: 'terminal', title: 'API Reference',  desc: 'Full OpenAPI specification with request/response schemas and live code samples.',              href: 'https://docs.ownpay.org',    external: true  },
]

const navLinks = [
  { text: 'User Guide',    href: '/user-guide/',                   external: false },
  { text: 'Developer',     href: '/developer/',                    external: false },
  { text: 'Plugins',       href: 'https://plugin.ownpay.org',     external: true  },
  { text: 'API Reference', href: 'https://docs.ownpay.org',       external: true  },
  { text: 'GitHub',        href: 'https://github.com/own-pay/OwnPay', external: true },
]
</script>

<template>
  <div class="op-root">

    <!-- ── NAV ──────────────────────────────────────────────── -->
    <header class="op-nav">
      <div class="op-nav__inner">
        <a class="op-nav__logo" href="/">
          <img src="/ownpay-logo.svg" class="op-nav__logo-img" alt="OwnPay" />
          <span class="op-nav__logo-badge">Docs</span>
        </a>
        <nav class="op-nav__links">
          <a
            v-for="l in navLinks"
            :key="l.href"
            :href="l.href"
            :target="l.external ? '_blank' : undefined"
            :rel="l.external ? 'noopener' : undefined"
            class="op-nav__link"
          >
            {{ l.text }}
            <span v-if="l.external" class="op-nav__link-ext" v-html="icons.extarrow"></span>
          </a>
        </nav>
        <a class="op-nav__cta" href="/user-guide/">Get Started</a>
      </div>
    </header>

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section class="op-hero">
      <div class="op-container">
        <div class="op-hero__inner">

          <a
            class="op-hero__release"
            href="https://github.com/own-pay/OwnPay/releases/latest"
            target="_blank"
            rel="noopener"
          >
            <span class="op-hero__release-dot"></span>
            Public Beta v0.1.0 — Out Now
            <span v-html="icons.extarrow"></span>
          </a>

          <h1 class="op-hero__h1">
            Your Gateway.<br>
            Your Server.<br>
            <em class="op-hero__em">Your Rules.</em>
          </h1>

          <p class="op-hero__sub">
            The self-hosted, open-source payment infrastructure platform.
            123 gateways, multi-brand white-label, double-entry ledger, and full API access — on your own server.
          </p>

          <div class="op-hero__actions">
            <a class="op-btn op-btn--primary" href="/user-guide/">
              Read the Docs
              <span v-html="icons.arrow"></span>
            </a>
            <a class="op-btn op-btn--secondary" href="/developer/">Developer Guide</a>
            <a
              class="op-btn op-btn--ghost"
              href="https://demo.ownpay.org"
              target="_blank"
              rel="noopener"
            >
              Live Demo <span v-html="icons.extarrow"></span>
            </a>
          </div>

          <div class="op-hero__chips">
            <span class="op-chip">PHP 8.3+</span>
            <span class="op-chip">AGPL-3.0 Free Forever</span>
            <span class="op-chip">PHPStan Level 9</span>
            <span class="op-chip">AES-256-GCM Encrypted</span>
            <span class="op-chip">Zero SaaS Fees</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STATS ─────────────────────────────────────────────── -->
    <div class="op-stats">
      <div class="op-container">
        <div class="op-stats__row">
          <div class="op-stat">
            <span class="op-stat__n">123<sup>+</sup></span>
            <span class="op-stat__l">Payment Gateways</span>
          </div>
          <div class="op-stat__sep"></div>
          <div class="op-stat">
            <span class="op-stat__n">∞</span>
            <span class="op-stat__l">Brands per Install</span>
          </div>
          <div class="op-stat__sep"></div>
          <div class="op-stat">
            <span class="op-stat__n">$0</span>
            <span class="op-stat__l">SaaS Fees. Ever.</span>
          </div>
          <div class="op-stat__sep"></div>
          <div class="op-stat">
            <span class="op-stat__n">100<sup>%</sup></span>
            <span class="op-stat__l">Data Sovereignty</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── FEATURES ──────────────────────────────────────────── -->
    <section class="op-features">
      <div class="op-container">
        <p class="op-eyebrow">Platform Capabilities</p>
        <h2 class="op-h2">Everything you need.<br>Nothing you don't.</h2>
        <p class="op-lead">
          Built for requirements off-the-shelf platforms can't solve — multi-brand domain isolation,
          a sandboxed plugin engine, and a financial-grade ledger you own end-to-end.
        </p>
        <div class="op-cards">
          <div v-for="(f, i) in features" :key="i" class="op-card">
            <div class="op-card__icon" v-html="icons[f.icon]"></div>
            <span :class="['op-card__badge', 'op-card__badge--' + f.badgeColor]">{{ f.badge }}</span>
            <h3 class="op-card__h3">{{ f.title }}</h3>
            <p class="op-card__p">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ───────────────────────────────────────── -->
    <section class="op-how">
      <div class="op-container">
        <div class="op-how__inner">
          <div class="op-how__left">
            <p class="op-eyebrow">Quick Start</p>
            <h2 class="op-h2">Deploy in three steps.</h2>

            <div class="op-steps">
              <div v-for="(s, i) in steps" :key="i" class="op-step">
                <div class="op-step__num">{{ s.num }}</div>
                <div>
                  <h3 class="op-step__h3">{{ s.title }}</h3>
                  <p class="op-step__p">{{ s.desc }}</p>
                </div>
              </div>
            </div>

            <div class="op-how__btns">
              <a class="op-btn op-btn--primary" href="/user-guide/">Read the User Guide</a>
              <a class="op-btn op-btn--ghost" href="/developer/">Developer Guide →</a>
            </div>
          </div>

          <div class="op-code">
            <div class="op-code__bar">
              <span class="op-dot op-dot--r"></span>
              <span class="op-dot op-dot--y"></span>
              <span class="op-dot op-dot--g"></span>
              <span class="op-code__file">terminal</span>
            </div>
            <pre class="op-code__pre"><code><span class="c-dim"># 1. Download and extract the latest release</span>
<span class="c-cmd">curl</span> -L -o ownpay.zip \
  https://github.com/own-pay/OwnPay/releases/latest/download/ownpay.zip
<span class="c-cmd">unzip</span> ownpay.zip -d ownpay <span class="c-dim">&amp;&amp;</span> <span class="c-cmd">cd</span> ownpay

<span class="c-dim"># 2. Point your web server document root at public/</span>
<span class="c-dim">#    nginx: root /var/www/ownpay/public;</span>
<span class="c-dim">#    apache: DocumentRoot /var/www/ownpay/public</span>

<span class="c-dim"># 3. Open the browser installer</span>
<span class="c-url">→  https://your-domain.com/install</span></code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ── DOC SECTIONS ──────────────────────────────────────── -->
    <section class="op-sections">
      <div class="op-container">
        <p class="op-eyebrow">Documentation</p>
        <h2 class="op-h2">Explore the docs.</h2>
        <div class="op-section-grid">
          <a
            v-for="(s, i) in docSections"
            :key="i"
            :href="s.href"
            :target="s.external ? '_blank' : undefined"
            :rel="s.external ? 'noopener' : undefined"
            class="op-section-card"
          >
            <div class="op-section-card__top">
              <div class="op-section-card__icon" v-html="icons[s.icon]"></div>
              <span v-if="s.external" class="op-section-card__ext">External</span>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
            <div class="op-section-card__arrow">
              Explore <span v-html="s.external ? icons.extarrow : icons.arrow"></span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ── CTA ───────────────────────────────────────────────── -->
    <section class="op-cta">
      <div class="op-container">
        <div class="op-cta__box">
          <h2 class="op-cta__h2">
            Your payment infrastructure.<br>
            On your server. Forever free.
          </h2>
          <p class="op-cta__p">
            AGPL-3.0 licensed. No license fees, no per-transaction cuts, no vendor lock-in.<br>
            Deploy today and own everything.
          </p>
          <div class="op-cta__btns">
            <a class="op-btn op-btn--white" href="/user-guide/">Start Reading the Docs</a>
            <a
              class="op-btn op-btn--outline-w"
              href="https://github.com/own-pay/OwnPay"
              target="_blank"
              rel="noopener"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ────────────────────────────────────────────── -->
    <footer class="op-footer">
      <div class="op-container">
        <div class="op-footer__row">
          <div class="op-footer__brand">
            <span class="op-footer__brand-name">OwnPay</span>
            <span class="op-footer__brand-sub">Your Gateway. Your Server. Your Rules.</span>
            <span class="op-footer__copy">© 2024–2026 OwnPay · AGPL-3.0</span>
          </div>
          <div class="op-footer__cols">
            <div class="op-footer__col">
              <strong>Learn</strong>
              <a href="/user-guide/">User Guide</a>
              <a href="/user-guide/auth/login">Authentication</a>
              <a href="/user-guide/payments/payment-links">Payment Links</a>
              <a href="/user-guide/gateways/gateways">Gateways</a>
            </div>
            <div class="op-footer__col">
              <strong>Developer</strong>
              <a href="/developer/">Overview</a>
              <a href="/developer/integration/php">PHP Integration</a>
              <a href="/developer/integration/nodejs">Node.js Integration</a>
              <a href="/developer/webhooks">Webhooks</a>
            </div>
            <div class="op-footer__col">
              <strong>References</strong>
              <a href="https://docs.ownpay.org" target="_blank" rel="noopener">API Reference ↗</a>
              <a href="https://plugin.ownpay.org" target="_blank" rel="noopener">Plugin Catalog ↗</a>
              <a href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener">GitHub ↗</a>
              <a href="https://demo.ownpay.org" target="_blank" rel="noopener">Live Demo ↗</a>
            </div>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>
