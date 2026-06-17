<script setup>
import { ref } from 'vue'
import { VPNavBarSearch } from 'vitepress/theme'

const mobileMenuOpen = ref(false)

const triggerSearch = () => {
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    code: 'KeyK',
    keyCode: 75,
    which: 75,
    ctrlKey: true,
    metaKey: true,
    bubbles: true,
    cancelable: true
  });
  window.dispatchEvent(event);
}

const icons = {
  burger:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  puzzle:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  ledger:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  phone:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
  shield:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  book:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  code:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  cube:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  arrow:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
  extarrow: `<svg viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9L9 2M9 2H4M9 2v5"/></svg>`,
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  dash:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  github:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>`,
  youtube:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.503 5.837a3.003 3.003 0 0 0 2.11 2.11c1.862.508 9.387.508 9.387.508s7.525 0 9.387-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  users:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
}

const navLinks = [
  { text: 'User Guide',    href: '/user-guide/',               external: false },
  { text: 'Developer',     href: '/developer/',                external: false },
  { text: 'API Reference', href: 'https://docs.ownpay.org',    external: true  },
  { text: 'Plugins',       href: 'https://plugins.ownpay.org',  external: true  },
]

const gateways = ['bKash', 'Nagad', 'Rocket', 'Upay', 'SSLCommerz', 'Stripe', 'PayPal', 'Razorpay', 'Flutterwave', 'Paystack', 'M-Pesa', 'USDT / Crypto']

const bento = [
  { icon: 'globe', large: true, badge: 'System Setup', title: 'White-Label Custom Domains', desc: 'Step-by-step guides on configuring isolated store domains and setting up TLS/SSL certificates per brand.', href: '/user-guide/system/domains', domain: 'learn.ownpay.org' },
  { icon: 'puzzle',  title: 'Payment Gateway Integration',  desc: 'Configure bkash, Stripe, SSLCommerz, Rocket, and other sandboxed payment adapters.', href: '/user-guide/gateways/gateways' },
  { icon: 'ledger',  title: 'Ledger Bookkeeping', desc: 'Understand the mechanics of double-entry ledger bookkeeping and precise transaction logging.', href: '/user-guide/payments/ledger' },
  { icon: 'phone',   title: 'Android SMS Gateway', desc: 'Pair your Android device to automatically parse incoming bank transaction SMS.', href: '/user-guide/mobile-sms/devices' },
  { icon: 'shield',  title: 'Authentication & API Keys', desc: 'Manage staff roles, two-factor authentication, and developer integration credentials.', href: '/user-guide/auth/login' },
]

const steps = [
  { title: 'Download & deploy',        desc: 'Extract the release, point your web server root at public/, then open the browser and visit /install.' },
  { title: 'Create brands & gateways', desc: 'Spin up fully isolated merchant brands, assign custom domains, and activate gateway plugins per brand.' },
  { title: 'Start collecting payments', desc: 'Generate payment links, issue invoices, or call the REST API — every transaction hits the ledger automatically.' },
]

const explore = [
  { icon: 'book',     title: 'User Guide',     desc: 'Admin panel walkthrough — gateways, brands, payments, reports, and settings.', href: '/user-guide/',              external: false },
  { icon: 'code',     title: 'Developer Docs', desc: 'PHP & Node.js integration, webhook setup, building custom payment plugins.',    href: '/developer/',               external: false },
  { icon: 'cube',     title: 'Plugin Catalog', desc: 'Browse 123+ payment gateway plugins and community-built extensions.',           href: 'https://plugins.ownpay.org', external: true  },
  { icon: 'terminal', title: 'API Reference',  desc: 'Full OpenAPI specification with request/response schemas and live samples.',    href: 'https://docs.ownpay.org',   external: true  },
]
</script>

<template>
  <div class="op-root">

    <!-- ── NAV ──────────────────────────────────────────────── -->
    <header class="op-nav">
      <div class="op-nav__inner">
        <a class="op-nav__logo" href="/">
          <img src="/light_mode.svg" class="op-nav__logo-img" alt="OwnPay Logo" style="height: 28px; width: auto; display: block;" />
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
        <VPNavBarSearch style="margin-left: auto; margin-right: 16px; flex: 1; max-width: 520px;" />
        <div class="op-nav__right">
          <a class="op-nav__icon-btn" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener" v-html="icons.github" aria-label="GitHub" data-tooltip="GitHub"></a>
          <a class="op-nav__icon-btn" href="https://fb.com/ownpay.org" target="_blank" rel="noopener" v-html="icons.facebook" aria-label="Facebook Page" data-tooltip="Facebook Page"></a>
          <a class="op-nav__icon-btn" href="https://fb.com/groups/ownpay.org" target="_blank" rel="noopener" v-html="icons.users" aria-label="Facebook Group Community" data-tooltip="Facebook Group"></a>
          <a class="op-nav__icon-btn" href="https://youtube.com/@ownpayorg" target="_blank" rel="noopener" v-html="icons.youtube" aria-label="YouTube Channel" data-tooltip="YouTube"></a>
          <a class="op-nav__cta" href="/guide/installation">Installation</a>
          <button
            class="op-nav__burger"
            type="button"
            :aria-expanded="mobileMenuOpen"
            aria-label="Toggle navigation menu"
            v-html="mobileMenuOpen ? icons.close : icons.burger"
            @click="mobileMenuOpen = !mobileMenuOpen"
          ></button>
        </div>
      </div>
      <div class="op-nav__mobile-panel" v-if="mobileMenuOpen">
        <a
          v-for="l in navLinks"
          :key="l.href"
          :href="l.href"
          :target="l.external ? '_blank' : undefined"
          :rel="l.external ? 'noopener' : undefined"
          class="op-nav__mobile-link"
          @click="mobileMenuOpen = false"
        >
          {{ l.text }}
          <span v-if="l.external" class="op-nav__link-ext" v-html="icons.extarrow"></span>
        </a>
        <div class="op-nav__mobile-actions">
          <a class="op-nav__cta op-nav__cta--block" href="/guide/installation" @click="mobileMenuOpen = false">Installation</a>
          <a class="op-nav__icon-btn" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener" v-html="icons.github" aria-label="GitHub" data-tooltip="GitHub"></a>
          <a class="op-nav__icon-btn" href="https://fb.com/ownpay.org" target="_blank" rel="noopener" v-html="icons.facebook" aria-label="Facebook Page" data-tooltip="Facebook Page"></a>
          <a class="op-nav__icon-btn" href="https://fb.com/groups/ownpay.org" target="_blank" rel="noopener" v-html="icons.users" aria-label="Facebook Group" data-tooltip="Facebook Group"></a>
          <a class="op-nav__icon-btn" href="https://youtube.com/@ownpayorg" target="_blank" rel="noopener" v-html="icons.youtube" aria-label="YouTube Channel" data-tooltip="YouTube"></a>
        </div>
      </div>
    </header>

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section class="op-hero">
      <div class="op-container">
        <div class="op-hero__grid">
          <div>
            <a class="op-hero__pill" href="https://github.com/own-pay/OwnPay/releases/latest" target="_blank" rel="noopener">
              <span class="op-hero__pill-dot"></span>
              Docs Hub — Public Beta v0.1.0
              <span v-html="icons.extarrow"></span>
            </a>

            <h1 class="op-hero__h1">Lets Setup<br><em>OwnPay today?</em></h1>

            <p class="op-hero__sub">
              Access comprehensive setup guides, integration modules, API reference docs, and troubleshooting resources for OwnPay self-hosted gateway.
            </p>

            <!-- Prominent documentation-centric search bar -->
            <div class="op-hero__search-box" @click="triggerSearch" style="display: flex; align-items: center; gap: 12px; background: var(--op-surface); border: 1px solid var(--op-border-2); border-radius: 100px; padding: 14px 24px; margin-bottom: 24px; cursor: pointer; box-shadow: var(--op-shadow-sm); transition: all var(--op-transition); max-width: 480px;">
              <span v-html="icons.search" style="width: 18px; height: 18px; color: var(--op-ink-3); flex-shrink: 0; display: inline-flex;"></span>
              <span style="color: var(--op-ink-3); font-size: 14.5px; flex: 1; user-select: none;">Search documentation...</span>
              <span style="font-family: var(--op-font-mono); font-size: 11px; color: var(--op-ink-3); background: var(--op-bg-alt); border: 1px solid var(--op-border); border-radius: 6px; padding: 2px 7px;">⌘K</span>
            </div>

            <div class="op-hero__actions">
              <a class="op-btn op-btn--primary" href="/guide/installation">Installation Guide <span v-html="icons.arrow"></span></a>
              <a class="op-btn op-btn--secondary" href="/user-guide/">User Guide</a>
              <a class="op-btn op-btn--ghost" href="https://docs.ownpay.org" target="_blank" rel="noopener">API Reference <span v-html="icons.extarrow"></span></a>
            </div>
          </div>

          <!-- Quickstart Terminal on the right side of the hero -->
          <div class="op-code">
            <div class="op-code__bar">
              <span class="op-dot op-dot--r"></span>
              <span class="op-dot op-dot--y"></span>
              <span class="op-dot op-dot--g"></span>
              <span class="op-code__file">quickstart_install.sh</span>
            </div>
            <pre class="op-code__pre"><code><span class="c-dim"># 1. Download and extract the latest release</span>
<span class="c-cmd">curl</span> -L -o ownpay.zip \
  https://github.com/own-pay/OwnPay/releases/latest/download/ownpay.zip
<span class="c-cmd">unzip</span> ownpay.zip -d ownpay <span class="c-dim">&amp;&amp;</span> <span class="c-cmd">cd</span> ownpay

<span class="c-dim"># 2. Point web root at public/ folder</span>
<span class="c-dim">#    e.g., /var/www/ownpay/public</span>

<span class="c-dim"># 3. Boot installer from the web domain</span>
<span class="c-url">→  https://learn.ownpay.org/guide/installation</span></code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ── MARQUEE ───────────────────────────────────────────── -->
    <div class="op-marquee">
      <p class="op-marquee__label">PLUGS INTO 123+ PAYMENT GATEWAYS</p>
      <div class="op-marquee__track-wrap">
        <div class="op-marquee__track">
          <span v-for="(g, i) in [...gateways, ...gateways]" :key="i" class="op-marquee__item">{{ g }}</span>
        </div>
      </div>
    </div>

    <!-- ── BENTO FEATURES ────────────────────────────────────── -->
    <section class="op-features">
      <div class="op-container">
        <p class="op-eyebrow">Documentation Areas</p>
        <h2 class="op-h2">Navigate by component.</h2>
        <p class="op-lead">
          Deep-dive into specific features, administrative workflows, and engineering specs. Select a category below to view detailed guides.
        </p>

        <div class="op-bento">
          <a v-for="(f, i) in bento" :key="i" :href="f.href" :class="['op-tile', f.large ? 'op-bento__lg' : '']">
            <span v-if="f.badge" class="op-tile__badge">{{ f.badge }}</span>
            <div class="op-tile__icon" v-html="icons[f.icon]"></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
            <div v-if="f.domain" class="op-bento__lg-domain" v-html="'<span>●</span> ' + f.domain"></div>
          </a>
        </div>
      </div>
    </section>



    <!-- ── ARCHITECTURE FLOW ─────────────────────────────────── -->
    <section class="op-how">
      <div class="op-container" style="text-align: center;">
        <p class="op-eyebrow" style="justify-content: center;">System Flow</p>
        <h2 class="op-h2">Architecture Overview</h2>
        <p class="op-lead" style="margin: 0 auto 40px auto;">
          Understand how isolated brand domains, the payment adapter manager, and the bcmath double-entry ledger cooperate on your server.
        </p>
        <div style="max-width: 800px; margin: 0 auto; background: var(--op-surface); padding: 32px; border-radius: var(--op-radius-lg); border: 1px solid var(--op-border); box-shadow: var(--op-shadow-sm); margin-bottom: 32px;">
          <img src="/flow.svg" alt="Architecture Flow Diagram" style="width: 100%; height: auto; display: block;" />
        </div>
        <div>
          <a class="op-btn op-btn--primary" href="https://github.com/own-pay/OwnPay/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener">
            Deep-Dive Architecture <span v-html="icons.extarrow"></span>
          </a>
        </div>
      </div>
    </section>

    <!-- ── DOCS EXPLORER ─────────────────────────────────────── -->
    <section class="op-explore">
      <div class="op-container">
        <p class="op-eyebrow">Documentation</p>
        <h2 class="op-h2">Find what you need, fast.</h2>

        <div class="op-palette">
          <div class="op-palette__search" @click="triggerSearch" style="cursor: pointer;">
            <span v-html="icons.search"></span>
            <span>Search documentation…</span>
            <span class="op-palette__kbd">⌘K</span>
          </div>
          <a
            v-for="(s, i) in explore"
            :key="i"
            :href="s.href"
            :target="s.external ? '_blank' : undefined"
            :rel="s.external ? 'noopener' : undefined"
            class="op-palette__row"
          >
            <div class="op-palette__icon" v-html="icons[s.icon]"></div>
            <div class="op-palette__text">
              <h3>{{ s.title }} <span v-if="s.external" class="op-palette__ext">External</span></h3>
              <p>{{ s.desc }}</p>
            </div>
            <div class="op-palette__arrow" v-html="s.external ? icons.extarrow : icons.arrow"></div>
          </a>
        </div>
      </div>
    </section>

    <!-- ── CTA ───────────────────────────────────────────────── -->
    <section class="op-cta">
      <div class="op-container">
        <div class="op-cta__inner">
          <h2 class="op-cta__h2">Still need help?</h2>
          <p class="op-cta__p">
            Explore our GitHub discussions, read developer installation docs, or open an issue for technical support.
          </p>
          <div class="op-cta__btns">
            <a class="op-btn op-btn--white" href="/user-guide/">Read User Guide</a>
            <a class="op-btn op-btn--outline-w" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener">
              <span v-html="icons.github" style="width:16px;height:16px;display:inline-flex"></span> GitHub Community
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
            <div class="op-footer__brand-top">
              <img src="/dark_mode.svg" class="op-footer__logo-img" alt="OwnPay Logo" style="height: 24px; width: auto; display: block;" />
            </div>
            <span class="op-footer__brand-sub">Self-hosted, open-source payment infrastructure.</span>
            <div class="op-footer__social">
              <a href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener" v-html="icons.github" aria-label="GitHub" data-tooltip="GitHub"></a>
              <a href="https://fb.com/ownpay.org" target="_blank" rel="noopener" v-html="icons.facebook" aria-label="Facebook Page" data-tooltip="Facebook Page"></a>
              <a href="https://fb.com/groups/ownpay.org" target="_blank" rel="noopener" v-html="icons.users" aria-label="Facebook Group Community" data-tooltip="Facebook Group"></a>
              <a href="https://youtube.com/@ownpayorg" target="_blank" rel="noopener" v-html="icons.youtube" aria-label="YouTube Channel" data-tooltip="YouTube"></a>
            </div>
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
              <a href="https://plugins.ownpay.org" target="_blank" rel="noopener">Plugin Catalog ↗</a>
              <a href="https://demo.ownpay.org" target="_blank" rel="noopener">Live Demo ↗</a>
            </div>
          </div>
        </div>
        <div class="op-footer__bottom">
          <span class="op-footer__copy">© 2026 OwnPay</span>
          <span class="op-footer__license">AGPL-3.0 Licensed</span>
        </div>
      </div>
    </footer>

  </div>
</template>
