<script setup>
const features = [
  {
    badge: 'Industry First',
    badgeType: 'gold',
    title: 'White-Label Custom Domains',
    desc: 'The only self-hosted platform where every brand runs on its own custom domain. Your customers see your logo — never OwnPay.',
  },
  {
    badge: '123 Built-in',
    badgeType: 'blue',
    title: 'Payment Gateway Plugins',
    desc: 'Stripe, PayPal, bKash, Nagad, M-Pesa, GCash, Razorpay, Crypto, and 115+ more — all sandboxed plugins, zero core changes.',
  },
  {
    badge: 'bcmath Precision',
    badgeType: 'teal',
    title: 'Double-Entry Ledger',
    desc: 'Every transaction creates balanced debit and credit records. Atomic, rollback-safe, audit-complete financial bookkeeping.',
  },
  {
    badge: 'Android App',
    badgeType: 'blue',
    title: 'Mobile SMS Gateway',
    desc: 'Pair Android devices to auto-parse mobile-banking SMS alerts from bKash, Nagad, and local wallets. Full automation, zero API dependency.',
  },
  {
    badge: 'REST + Webhooks',
    badgeType: 'teal',
    title: 'Full API & Webhook Engine',
    desc: 'Merchant, mobile, and admin REST APIs with HMAC-verified webhooks. Integrate any stack, any language, any workflow.',
  },
  {
    badge: 'PHPStan Level 9',
    badgeType: 'gold',
    title: 'Enterprise-Grade Security',
    desc: 'AES-256-GCM field encryption, Argon2id passwords, strict CSP, rate limiting, CSRF guards, SSRF protection, and granular RBAC.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Self-Host in Minutes',
    desc: 'Upload the release archive, point your domain at public/, run the /install wizard. No Composer needed on shared hosting.',
  },
  {
    num: '02',
    title: 'Create Brands & Configure Gateways',
    desc: 'Create fully isolated merchant brands, map custom domains, and activate 123+ payment gateway plugins per brand with separate credentials.',
  },
  {
    num: '03',
    title: 'Collect Payments',
    desc: 'Generate payment links, issue invoices, or call the REST API. Every transaction is automatically logged in the double-entry ledger.',
  },
]

const navLinks = [
  { text: 'Guide', href: '/guide/introduction' },
  { text: 'User Guide', href: '/user-guide/' },
  { text: 'API Reference', href: '/api-reference/' },
  { text: 'GitHub', href: 'https://github.com/own-pay/OwnPay', external: true },
]
</script>

<template>
  <div class="op-root">

    <!-- ── TOP NAV ──────────────────────────────────────────────────────── -->
    <header class="op-nav">
      <div class="op-nav__inner">
        <a class="op-nav__logo" href="/">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#0066ff"/>
            <path d="M14 7a7 7 0 100 14A7 7 0 0014 7zm0 2.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" fill="white" fill-opacity=".2"/>
            <path d="M14 10.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" fill="white"/>
          </svg>
          <span>OwnPay</span>
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
          >{{ l.text }}</a>
          <a class="op-nav__cta" href="/guide/introduction">Get Started</a>
        </nav>
      </div>
    </header>

    <!-- ── HERO ─────────────────────────────────────────────────────────── -->
    <section class="op-hero">
      <div class="op-hero__bg">
        <div class="op-dots"></div>
        <div class="op-orb op-orb--1"></div>
        <div class="op-orb op-orb--2"></div>
        <div class="op-orb op-orb--3"></div>
      </div>

      <div class="op-container">
        <a class="op-pill" href="https://github.com/own-pay/OwnPay/releases/latest" target="_blank" rel="noopener">
          <span class="op-pill__dot"></span>
          Public Beta v0.1.0 — Out Now
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>

        <h1 class="op-hero__h1">
          Your Gateway.<br>
          Your Server.<br>
          <em class="op-hero__em">Your Rules.</em>
        </h1>

        <p class="op-hero__sub">
          The self-hosted, open-source payment gateway automation platform.<br class="op-desktop-br">
          123 gateways · Multi-brand white-label · Double-entry ledger · API-first.
        </p>

        <div class="op-hero__actions">
          <a class="op-btn op-btn--primary" href="/guide/introduction">
            Get Started
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3l4 4.5-4 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a class="op-btn op-btn--secondary" href="/user-guide/">User Guide</a>
          <a class="op-btn op-btn--ghost" href="https://demo.ownpay.org" target="_blank" rel="noopener">
            Live Demo
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>

        <div class="op-chips">
          <span class="op-chip">PHP 8.3+</span>
          <span class="op-chip">AGPL-3.0 Free Forever</span>
          <span class="op-chip">PHPStan Level 9</span>
          <span class="op-chip">AES-256-GCM Encrypted</span>
        </div>
      </div>
    </section>

    <!-- ── STATS ─────────────────────────────────────────────────────────── -->
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

    <!-- ── FEATURES ──────────────────────────────────────────────────────── -->
    <section class="op-features">
      <div class="op-container">
        <p class="op-eyebrow">Platform Capabilities</p>
        <h2 class="op-h2">Everything you need.<br>Nothing you don't.</h2>
        <p class="op-lead">
          Built around requirements off-the-shelf platforms can't solve — multi-brand domain isolation,
          a sandboxed plugin engine, and a financial-grade ledger you own end-to-end.
        </p>

        <div class="op-cards">
          <div v-for="(f, i) in features" :key="i" class="op-card">
            <span :class="['op-card__badge', 'op-card__badge--' + f.badgeType]">{{ f.badge }}</span>
            <h3 class="op-card__h3">{{ f.title }}</h3>
            <p class="op-card__p">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ──────────────────────────────────────────────────── -->
    <section class="op-how">
      <div class="op-container">
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

        <div class="op-code">
          <div class="op-code__bar">
            <span class="op-dot op-dot--r"></span>
            <span class="op-dot op-dot--y"></span>
            <span class="op-dot op-dot--g"></span>
            <span class="op-code__file">bash</span>
          </div>
          <pre class="op-code__pre"><code><span class="c-dim"># 1. Download and extract the release</span>
<span class="c-cmd">curl</span> -L -o ownpay.zip https://github.com/own-pay/OwnPay/releases/latest/download/ownpay.zip
<span class="c-cmd">unzip</span> ownpay.zip -d ownpay <span class="c-dim">&amp;&amp;</span> <span class="c-cmd">cd</span> ownpay

<span class="c-dim"># 2. Point your web server document root at  public/</span>
<span class="c-dim"># 3. Open your domain — the /install wizard does the rest</span>
<span class="c-url">→  https://your-domain.com/install</span></code></pre>
        </div>

        <div class="op-how__btns">
          <a class="op-btn op-btn--primary" href="/guide/installation">Full Installation Guide</a>
          <a class="op-btn op-btn--ghost" href="/guide/architecture">Architecture Overview →</a>
        </div>
      </div>
    </section>

    <!-- ── ECOSYSTEM ──────────────────────────────────────────────────────── -->
    <section class="op-eco">
      <div class="op-container">
        <p class="op-eyebrow">Ecosystem</p>
        <h2 class="op-h2">One platform. Many touch points.</h2>
        <div class="op-eco__grid">
          <a class="op-eco-card" href="https://ownpay.org" target="_blank" rel="noopener">
            <span class="op-eco-card__icon">🌐</span>
            <strong>Website</strong>
            <span>ownpay.org</span>
          </a>
          <a class="op-eco-card op-eco-card--hl" href="/user-guide/">
            <span class="op-eco-card__icon">🎓</span>
            <strong>Learn / Guides</strong>
            <span>learn.ownpay.org</span>
          </a>
          <a class="op-eco-card" href="https://docs.ownpay.org" target="_blank" rel="noopener">
            <span class="op-eco-card__icon">📖</span>
            <strong>API Reference</strong>
            <span>docs.ownpay.org</span>
          </a>
          <a class="op-eco-card" href="https://plugin.ownpay.org" target="_blank" rel="noopener">
            <span class="op-eco-card__icon">🧩</span>
            <strong>Plugin Catalog</strong>
            <span>plugin.ownpay.org</span>
          </a>
          <a class="op-eco-card" href="https://demo.ownpay.org" target="_blank" rel="noopener">
            <span class="op-eco-card__icon">▶️</span>
            <strong>Live Demo</strong>
            <span>demo.ownpay.org</span>
          </a>
          <a class="op-eco-card" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener">
            <span class="op-eco-card__icon">⭐</span>
            <strong>GitHub</strong>
            <span>own-pay/OwnPay</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ── CTA ────────────────────────────────────────────────────────────── -->
    <section class="op-cta">
      <div class="op-container">
        <div class="op-cta__box">
          <div class="op-cta__glow"></div>
          <h2 class="op-cta__h2">
            Your payment infrastructure.<br>
            <span class="op-cta__accent">On your server. Forever free.</span>
          </h2>
          <p class="op-cta__p">
            AGPL-3.0 licensed. No license fees. No per-transaction cuts.<br>No vendor lock-in. Deploy today, own everything.
          </p>
          <div class="op-cta__btns">
            <a class="op-btn op-btn--white" href="/guide/introduction">Start Reading the Docs</a>
            <a class="op-btn op-btn--outline-w" href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────────────────────────── -->
    <footer class="op-footer">
      <div class="op-container">
        <div class="op-footer__row">
          <div class="op-footer__brand">
            <span class="op-footer__name">OwnPay</span>
            <span class="op-footer__sub">Your Gateway. Your Server. Your Rules.</span>
            <span class="op-footer__copy">© 2024–2026 OwnPay · AGPL-3.0</span>
          </div>
          <div class="op-footer__cols">
            <div class="op-footer__col">
              <strong>Docs</strong>
              <a href="/guide/introduction">Introduction</a>
              <a href="/guide/architecture">Architecture</a>
              <a href="/guide/installation">Installation</a>
              <a href="/api-reference/">API Reference</a>
            </div>
            <div class="op-footer__col">
              <strong>User Guide</strong>
              <a href="/user-guide/">Overview</a>
              <a href="/user-guide/payments/payment-links">Payment Links</a>
              <a href="/user-guide/gateways/gateways">Gateways</a>
              <a href="/user-guide/developers/developer-hub">Developer Hub</a>
            </div>
            <div class="op-footer__col">
              <strong>Community</strong>
              <a href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener">GitHub</a>
              <a href="https://demo.ownpay.org" target="_blank" rel="noopener">Live Demo</a>
              <a href="https://ownpay.org/donate" target="_blank" rel="noopener">Sponsor</a>
              <a href="https://blog.ownpay.org" target="_blank" rel="noopener">Blog</a>
            </div>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>
