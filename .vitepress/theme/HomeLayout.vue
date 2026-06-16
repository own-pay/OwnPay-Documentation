<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

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
}

const navLinks = [
  { text: 'User Guide',    href: '/user-guide/',               external: false },
  { text: 'Developer',     href: '/developer/',                external: false },
  { text: 'API Reference', href: 'https://docs.ownpay.org',    external: true  },
  { text: 'Plugins',       href: 'https://plugin.ownpay.org',  external: true  },
]

const gateways = ['bKash', 'Nagad', 'Rocket', 'Upay', 'SSLCommerz', 'Stripe', 'PayPal', 'Razorpay', 'Flutterwave', 'Paystack', 'M-Pesa', 'USDT / Crypto']

const bento = [
  { icon: 'globe', large: true, badge: 'Industry First', title: 'White-Label Custom Domains', desc: 'Every brand runs on its own custom domain with its own SSL certificate. Your customers see your brand — never OwnPay.', domain: 'checkout.your-brand.com' },
  { icon: 'puzzle',  title: 'Plugin Gateways',  desc: '123+ sandboxed gateway plugins — bKash, Stripe, Razorpay, crypto, and more.' },
  { icon: 'ledger',  title: 'Double-Entry Ledger', desc: 'bcmath-precise, atomic, audit-complete bookkeeping for every transaction.' },
  { icon: 'phone',   title: 'Mobile SMS Gateway', desc: 'Pair an Android device to auto-parse mobile banking SMS — zero API needed.' },
  { icon: 'shield',  title: 'Enterprise Security', desc: 'AES-256-GCM encryption, Argon2id hashing, strict CSP, and granular RBAC.' },
]

const compareSelf = [
  { yes: true,  text: 'Source code you fully own and can audit' },
  { yes: true,  text: 'Zero per-transaction platform fees' },
  { yes: true,  text: 'Unlimited brands on unlimited custom domains' },
  { yes: true,  text: 'Your data stays on your own infrastructure' },
]
const compareSaas = [
  { yes: false, text: 'Closed source, vendor-controlled roadmap' },
  { yes: false, text: 'A cut of every transaction you process' },
  { yes: false, text: 'Branding tied to the provider’s domain' },
  { yes: false, text: 'Customer data lives on someone else’s servers' },
]

const steps = [
  { title: 'Download & deploy',        desc: 'Extract the release, point your web server root at public/, then open the browser and visit /install.' },
  { title: 'Create brands & gateways', desc: 'Spin up fully isolated merchant brands, assign custom domains, and activate gateway plugins per brand.' },
  { title: 'Start collecting payments', desc: 'Generate payment links, issue invoices, or call the REST API — every transaction hits the ledger automatically.' },
]

const explore = [
  { icon: 'book',     title: 'User Guide',     desc: 'Admin panel walkthrough — gateways, brands, payments, reports, and settings.', href: '/user-guide/',              external: false },
  { icon: 'code',     title: 'Developer Docs', desc: 'PHP & Node.js integration, webhook setup, building custom payment plugins.',    href: '/developer/',               external: false },
  { icon: 'cube',     title: 'Plugin Catalog', desc: 'Browse 123+ payment gateway plugins and community-built extensions.',           href: 'https://plugin.ownpay.org', external: true  },
  { icon: 'terminal', title: 'API Reference',  desc: 'Full OpenAPI specification with request/response schemas and live samples.',    href: 'https://docs.ownpay.org',   external: true  },
]
</script>

<template>
  <div class="op-root">

    <!-- ── NAV ──────────────────────────────────────────────── -->
    <header class="op-nav">
      <div class="op-nav__inner">
        <a class="op-nav__logo" href="/">
          <img src="/ownpay-symbol.svg" class="op-nav__logo-img" alt="" />
          <span class="op-nav__wordmark"><b>Own</b><span>pay</span></span>
          <span class="op-nav__badge">Docs</span>
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
        <div class="op-nav__right">
          <a class="op-nav__icon-btn" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener" v-html="icons.github" aria-label="GitHub"></a>
          <a class="op-nav__cta" href="/user-guide/">Get Started</a>
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
          <a class="op-nav__cta op-nav__cta--block" href="/user-guide/" @click="mobileMenuOpen = false">Get Started</a>
          <a class="op-nav__icon-btn" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener" v-html="icons.github" aria-label="GitHub"></a>
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
              Public Beta v0.1.0 — Out Now
              <span v-html="icons.extarrow"></span>
            </a>

            <h1 class="op-hero__h1">Payment infrastructure,<br><em>on your own server.</em></h1>

            <p class="op-hero__sub">
              123 gateways, multi-brand white-label domains, a double-entry ledger, and a full REST API —
              self-hosted, open-source, and entirely yours.
            </p>

            <div class="op-hero__actions">
              <a class="op-btn op-btn--primary" href="/user-guide/">Read the Docs <span v-html="icons.arrow"></span></a>
              <a class="op-btn op-btn--secondary" href="/developer/">Developer Guide</a>
              <a class="op-btn op-btn--ghost" href="https://demo.ownpay.org" target="_blank" rel="noopener">Live Demo <span v-html="icons.extarrow"></span></a>
            </div>

            <div class="op-hero__chips">
              <span class="op-chip">PHP 8.3+</span>
              <span class="op-chip">AGPL-3.0 · Free Forever</span>
              <span class="op-chip">PHPStan Level 9</span>
              <span class="op-chip">Zero SaaS Fees</span>
            </div>
          </div>

          <div class="op-mock">
            <div class="op-mock__bar">
              <span class="op-mock__dot op-mock__dot--r"></span>
              <span class="op-mock__dot op-mock__dot--y"></span>
              <span class="op-mock__dot op-mock__dot--g"></span>
              <span class="op-mock__url">dashboard.your-brand.com</span>
            </div>
            <div class="op-mock__body">
              <div class="op-mock__stat-label">Today's Volume</div>
              <div class="op-mock__stat-value">৳ 482,310</div>
              <div class="op-mock__stat-delta">↑ 12.4% vs yesterday</div>
              <div class="op-mock__bars">
                <span style="height:35%"></span><span style="height:55%"></span><span style="height:40%"></span>
                <span style="height:70%"></span><span style="height:50%" class="is-active"></span>
                <span style="height:85%" class="is-active"></span><span style="height:60%"></span><span style="height:90%" class="is-active"></span>
              </div>
              <div class="op-mock__row">
                <span class="op-mock__row-id">pi_8af2…c19</span>
                <span class="op-mock__row-amt">৳ 1,500</span>
                <span class="op-pill-status op-pill-status--paid">Paid</span>
              </div>
              <div class="op-mock__row">
                <span class="op-mock__row-id">pi_77be…0d4</span>
                <span class="op-mock__row-amt">৳ 4,200</span>
                <span class="op-pill-status op-pill-status--pending">Pending</span>
              </div>
              <div class="op-mock__row">
                <span class="op-mock__row-id">pi_2c01…9aa</span>
                <span class="op-mock__row-amt">৳ 950</span>
                <span class="op-pill-status op-pill-status--failed">Failed</span>
              </div>
            </div>
            <div class="op-mock__float" v-html="icons.check + '<span>Webhook delivered</span>'"></div>
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
        <p class="op-eyebrow">Platform Capabilities</p>
        <h2 class="op-h2">Everything you need.<br>Nothing you don't.</h2>
        <p class="op-lead">
          Built for requirements off-the-shelf platforms can't solve — multi-brand domain isolation,
          a sandboxed plugin engine, and a financial-grade ledger you own end-to-end.
        </p>

        <div class="op-bento">
          <div v-for="(f, i) in bento" :key="i" :class="['op-tile', f.large ? 'op-bento__lg' : '']">
            <span v-if="f.badge" class="op-tile__badge">{{ f.badge }}</span>
            <div class="op-tile__icon" v-html="icons[f.icon]"></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
            <div v-if="f.domain" class="op-bento__lg-domain" v-html="'<span>●</span> ' + f.domain"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── COMPARE ───────────────────────────────────────────── -->
    <section class="op-compare">
      <div class="op-container">
        <p class="op-eyebrow">Why Self-Host</p>
        <h2 class="op-h2">Own the platform.<br>Not just an account on it.</h2>
        <div class="op-compare__grid">
          <div class="op-compare__col op-compare__col--hi">
            <div class="op-compare__head">
              <h4>OwnPay</h4>
              <span>Self-Hosted</span>
            </div>
            <div class="op-compare__list">
              <div v-for="(r, i) in compareSelf" :key="i" class="op-compare__row op-compare__row--yes">
                <span v-html="icons.check"></span><span>{{ r.text }}</span>
              </div>
            </div>
          </div>
          <div class="op-compare__col">
            <div class="op-compare__head">
              <h4>Typical Hosted Gateway</h4>
              <span>SaaS</span>
            </div>
            <div class="op-compare__list">
              <div v-for="(r, i) in compareSaas" :key="i" class="op-compare__row op-compare__row--no">
                <span v-html="icons.dash"></span><span>{{ r.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── QUICKSTART ────────────────────────────────────────── -->
    <section class="op-how">
      <div class="op-container">
        <div class="op-how__inner">
          <div>
            <p class="op-eyebrow">Quick Start</p>
            <h2 class="op-h2">Deploy in three steps.</h2>

            <div class="op-timeline">
              <div v-for="(s, i) in steps" :key="i" class="op-tl-item">
                <div class="op-tl-num">{{ i + 1 }}</div>
                <div>
                  <h3>{{ s.title }}</h3>
                  <p>{{ s.desc }}</p>
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

    <!-- ── DOCS EXPLORER ─────────────────────────────────────── -->
    <section class="op-explore">
      <div class="op-container">
        <p class="op-eyebrow">Documentation</p>
        <h2 class="op-h2">Find what you need, fast.</h2>

        <div class="op-palette">
          <div class="op-palette__search">
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
          <h2 class="op-cta__h2">Your infrastructure.<br>On your server, <em>forever free.</em></h2>
          <p class="op-cta__p">
            AGPL-3.0 licensed. No license fees, no per-transaction cuts, no vendor lock-in.
            Deploy today and own everything.
          </p>
          <div class="op-cta__btns">
            <a class="op-btn op-btn--white" href="/user-guide/">Start Reading the Docs</a>
            <a class="op-btn op-btn--outline-w" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener">
              <span v-html="icons.github" style="width:16px;height:16px;display:inline-flex"></span> Star on GitHub
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
              <img src="/ownpay-symbol.svg" class="op-footer__logo-img" alt="" />
              <span class="op-footer__brand-name">OwnPay</span>
            </div>
            <span class="op-footer__brand-sub">Self-hosted, open-source payment infrastructure.</span>
            <div class="op-footer__social">
              <a href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener" v-html="icons.github" aria-label="GitHub"></a>
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
              <a href="https://plugin.ownpay.org" target="_blank" rel="noopener">Plugin Catalog ↗</a>
              <a href="https://demo.ownpay.org" target="_blank" rel="noopener">Live Demo ↗</a>
            </div>
          </div>
        </div>
        <div class="op-footer__bottom">
          <span class="op-footer__copy">© 2024–2026 OwnPay</span>
          <span class="op-footer__license">AGPL-3.0 Licensed</span>
        </div>
      </div>
    </footer>

  </div>
</template>
