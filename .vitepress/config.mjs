import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'OwnPay Documentation — Help & Guides',
  description: 'Official Documentation for OwnPay — self-hosted, open-source payment Gateway.',

  cleanUrls: true,
  appearance: 'light',
  srcExclude: ['**/README.md'],

  sitemap: {
    hostname: 'https://learn.ownpay.org'
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/ownpay-symbol.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/ownpay_icon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/ownpay_icon.png' }],
    ['meta', { name: 'theme-color', content: '#112964' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
    ['meta', { property: 'og:site_name', content: 'OwnPay' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'OwnPay Documentation — Help & Guides' }],
    ['meta', { property: 'og:description', content: 'Official guides, developer integration, and API reference for OwnPay, the self-hosted payment gateway platform.' }],
    ['meta', { property: 'og:url', content: 'https://learn.ownpay.org/' }],
    ['meta', { property: 'og:image', content: 'https://learn.ownpay.org/ownpay_og.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'OwnPay Documentation — Help & Guides' }],
    ['meta', { name: 'twitter:description', content: 'Official guides, developer integration, and API reference for OwnPay, the self-hosted payment gateway platform.' }],
    ['meta', { name: 'twitter:image', content: 'https://learn.ownpay.org/ownpay_og.png' }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'OwnPay Documentation',
        'url': 'https://learn.ownpay.org/',
        'description': 'Official guides, developer integration, and API reference documentation for OwnPay, the open source self-hosted payment gateway platform.',
        'publisher': {
          '@type': 'Organization',
          'name': 'OwnPay',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://learn.ownpay.org/ownpay_logo.png'
          }
        }
      })
    ]
  ],

  themeConfig: {
    logo: {
      light: '/light_mode.svg',
      dark: '/dark_mode.svg'
    },
    siteTitle: false,

    nav: [
      { text: 'User Guide', link: '/user-guide/', activeMatch: '/user-guide/' },
      { text: 'Developer', link: '/developer/', activeMatch: '/developer/' },
      { text: 'API Reference', link: 'https://docs.ownpay.org' },
      { text: 'Plugins', link: 'https://plugins.ownpay.org' },
    ],

    sidebar: {
      '/user-guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/user-guide/' },
          ],
        },
        {
          text: 'Authentication',
          collapsed: false,
          items: [
            { text: 'Login', link: '/user-guide/auth/login' },
            { text: 'Forgot Password', link: '/user-guide/auth/forgot-password' },
            { text: 'Two-Factor Auth', link: '/user-guide/auth/two-factor' },
          ],
        },
        {
          text: 'Dashboard',
          collapsed: false,
          items: [
            { text: 'Main Dashboard', link: '/user-guide/dashboard/dashboard' },
          ],
        },
        {
          text: 'Payments & Finance',
          collapsed: false,
          items: [
            { text: 'Transactions', link: '/user-guide/payments/transactions' },
            { text: 'Invoices', link: '/user-guide/payments/invoices' },
            { text: 'Payment Links', link: '/user-guide/payments/payment-links' },
            { text: 'Ledger Bookkeeping', link: '/user-guide/payments/ledger' },
          ],
        },
        {
          text: 'Gateways & Localization',
          collapsed: false,
          items: [
            { text: 'Payment Gateways', link: '/user-guide/gateways/gateways' },
            { text: 'Currencies & Rates', link: '/user-guide/gateways/currencies' },
          ],
        },
        {
          text: 'People & Permissions',
          collapsed: false,
          items: [
            { text: 'Brands & Stores', link: '/user-guide/people/brands' },
            { text: 'Customers', link: '/user-guide/people/customers' },
            { text: 'Staff Directory', link: '/user-guide/people/staff' },
            { text: 'Roles & Permissions', link: '/user-guide/people/roles' },
          ],
        },
        {
          text: 'Mobile & SMS',
          collapsed: true,
          items: [
            { text: 'Paired Devices', link: '/user-guide/mobile-sms/devices' },
            { text: 'SMS Templates', link: '/user-guide/mobile-sms/sms-templates' },
            { text: 'SMS Match Logs', link: '/user-guide/mobile-sms/sms-logs' },
          ],
        },
        {
          text: 'Reports & Audits',
          collapsed: true,
          items: [
            { text: 'Financial Reports', link: '/user-guide/reports-finance/reports' },
            { text: 'Audit Log', link: '/user-guide/reports-finance/audit-log' },
            { text: 'Balance Verification', link: '/user-guide/reports-finance/balance-verification' },
          ],
        },
        {
          text: 'Branding & Appearance',
          collapsed: true,
          items: [
            { text: 'Branding Settings', link: '/user-guide/appearance/branding-settings' },
            { text: 'Landing Page', link: '/user-guide/appearance/landing-page' },
            { text: 'Themes', link: '/user-guide/appearance/themes' },
          ],
        },
        {
          text: 'System Management',
          collapsed: true,
          items: [
            { text: 'General Settings', link: '/user-guide/system/settings' },
            { text: 'Plugins Manager', link: '/user-guide/system/plugins' },
            { text: 'Addons', link: '/user-guide/system/addons' },
            { text: 'Custom Domains', link: '/user-guide/system/domains' },
            { text: 'System Update', link: '/user-guide/system/system-update' },
          ],
        },
        {
          text: 'Account',
          collapsed: true,
          items: [
            { text: 'My Account', link: '/user-guide/account/my-account' },
          ],
        },
        {
          text: 'Public Checkout',
          collapsed: true,
          items: [
            { text: 'Checkout Experience', link: '/user-guide/public/checkout' },
          ],
        },
      ],

      '/developer/': [
        {
          text: 'Developer Guide',
          items: [
            { text: 'Overview', link: '/developer/' },
          ],
        },
        {
          text: 'Integration',
          collapsed: false,
          items: [
            { text: 'PHP', link: '/developer/integration/php' },
            { text: 'Node.js', link: '/developer/integration/nodejs' },
          ],
        },
        {
          text: 'Webhooks',
          collapsed: false,
          items: [
            { text: 'Setup & Verification', link: '/developer/webhooks' },
          ],
        },
        {
          text: 'Plugin Development',
          collapsed: false,
          items: [
            { text: 'Building Plugins', link: '/developer/plugin-development' },
          ],
        },
      ],

      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/own-pay/OwnPay-Documentation' },
      { icon: 'facebook', link: 'https://fb.com/ownpay.org' },
      { icon: 'youtube', link: 'https://youtube.com/@ownpayorg' },
    ],

    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Copyright © 2026-present OwnPay',
    },

    editLink: {
      pattern: 'https://github.com/own-pay/OwnPay-Documentation/edit/main/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
    },
  },

  markdown: {
    lineNumbers: true,
  },
  vite: {
    build: {
      target: 'esnext'
    },
    esbuild: {
      target: 'esnext'
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  }
})
