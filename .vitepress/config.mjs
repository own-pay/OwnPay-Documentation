import { defineConfig } from 'vitepress'

// Helper function to extract a neat description from the HTML content if no frontmatter description is present
function getPageDescription(context) {
  if (context.pageData.frontmatter && context.pageData.frontmatter.description) {
    return context.pageData.frontmatter.description;
  }

  const htmlContent = context.content || '';
  if (!htmlContent) {
    return context.description || '';
  }

  // Extract the main article content wrapper first to avoid headers/footers
  const mainMatch = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || htmlContent.match(/<div class="vp-doc[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const articleHtml = mainMatch ? mainMatch[1] : htmlContent;

  // Find the first blockquote or paragraph inside the article body
  const blockquoteMatch = articleHtml.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  let candidateText = '';
  if (blockquoteMatch && blockquoteMatch[1]) {
    candidateText = blockquoteMatch[1];
  } else {
    // Look for the first non-empty paragraph that doesn't start with "Purpose:"
    const paragraphs = articleHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    for (const p of paragraphs) {
      const cleanP = p.replace(/<[^>]+>/g, '').trim();
      if (cleanP && !cleanP.startsWith('Purpose:')) {
        candidateText = p;
        break;
      }
    }
  }

  if (candidateText) {
    // Strip HTML tags
    let text = candidateText.replace(/<[^>]+>/g, ' ');

    // Decode common entities and normalize spaces
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Clean up "Purpose:" label if it came from a blockquote
    text = text.replace(/^Purpose:\s*/i, '');

    if (text) {
      if (text.length > 160) {
        text = text.substring(0, 157) + '...';
      }
      return text;
    }
  }

  return context.description || '';
}

// Helper function to extract the first image in compiled HTML and resolve it to a full URL
function getPageImage(context) {
  const htmlContent = context.content || '';
  if (!htmlContent) {
    return 'https://learn.ownpay.org/ownpay_og.png';
  }

  // Extract the main article content wrapper first to avoid logo images in headers
  const mainMatch = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || htmlContent.match(/<div class="vp-doc[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const articleHtml = mainMatch ? mainMatch[1] : htmlContent;

  const imgMatch = articleHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const imgPath = imgMatch[1];
    if (/^https?:\/\//i.test(imgPath)) {
      return imgPath;
    }
    return `https://learn.ownpay.org${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  }

  return 'https://learn.ownpay.org/ownpay_og.png';
}

export default defineConfig({
  lang: 'en-US',
  title: 'OwnPay Academy - Guides & Documentation',
  description: 'OwnPay Academy: Official documentation, guides, integrations, and resources for the self-hosted payment gateway platform.',

  cleanUrls: true,
  appearance: true,
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
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],

  themeConfig: {
    logo: {
      light: '/light_mode.svg',
      dark: '/dark_mode.svg'
    },
    siteTitle: false,

    nav: [
      { text: 'Getting Started', link: '/getting-started/', activeMatch: '/getting-started/' },
      { text: 'Core Concepts', link: '/core-concepts/', activeMatch: '/core-concepts/' },
      { text: 'User Guide', link: '/user-guide/', activeMatch: '/user-guide/' },
      { text: 'Developer', link: '/developer/', activeMatch: '/developer/' },
      { text: 'Advanced Topics', link: '/advanced-topics/', activeMatch: '/advanced-topics/' },
      { text: 'Resources', link: '/resources/', activeMatch: '/resources/' },
      { text: 'API Docs', link: 'https://docs.ownpay.org', target: '_blank' },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/getting-started/' },
            { text: 'What is OwnPay?', link: '/getting-started/introduction' },
            { text: 'System Requirements', link: '/getting-started/requirements' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'First Steps', link: '/getting-started/first-steps' },
          ],
        },
      ],

      '/core-concepts/': [
        {
          text: 'Core Concepts',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/core-concepts/' },
            { text: 'Brands and Stores', link: '/core-concepts/brands-and-stores' },
            { text: 'Payment Flow', link: '/core-concepts/payment-flow' },
            { text: 'User Roles & Permissions', link: '/core-concepts/user-roles-permissions' },
            { text: 'Payment Gateways', link: '/core-concepts/gateways' },
            { text: 'Webhooks & Events', link: '/core-concepts/webhooks-events' },
          ],
        },
      ],

      '/user-guide/': [
        {
          text: 'Overview',
          items: [
            { text: 'User Guide', link: '/user-guide/' },
            { text: 'System Architecture', link: '/resources/architecture' },
            { text: 'Change Log', link: '/user-guide/changelog' },
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
          text: 'Managing Payments',
          collapsed: false,
          items: [
            { text: 'Transactions', link: '/user-guide/payments/transactions' },
            { text: 'Invoices', link: '/user-guide/payments/invoices' },
            { text: 'Payment Links', link: '/user-guide/payments/payment-links' },
            { text: 'Ledger & Bookkeeping', link: '/user-guide/payments/ledger' },
          ],
        },
        {
          text: 'Payment Gateways',
          collapsed: false,
          items: [
            { text: 'Gateway Setup', link: '/user-guide/gateways/gateways' },
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
          text: 'Account Settings',
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
        {
          text: 'Developer Hub',
          collapsed: true,
          items: [
            { text: 'API Keys & Webhooks', link: '/user-guide/developers/developer-hub' },
          ],
        },
      ],

      '/developer/': [
        {
          text: 'Developer Guide',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/developer/' },
            { text: 'Quickstart', link: '/developer/quickstart' },
          ],
        },
        {
          text: 'SDK Integration',
          collapsed: false,
          items: [
            { text: 'PHP SDK', link: '/developer/integration/php' },
            { text: 'Node.js SDK', link: '/developer/integration/nodejs' },
            { text: 'WordPress WooCommerce', link: '/developer/integration/woocommerce' },
            { text: 'More SDKs →', link: '/resources/integrations/' },
          ],
        },
        {
          text: 'Webhooks & Events',
          collapsed: false,
          items: [
            { text: 'Setup & Verification', link: '/developer/webhooks' },
          ],
        },
        {
          text: 'Plugin System',
          collapsed: false,
          items: [
            { text: 'Plugin Overview', link: '/developer/plugins/overview' },
            { text: 'Gateway Development', link: '/developer/plugin-types/gateway-development' },
            { text: 'Addon Development', link: '/developer/plugin-types/addon-development' },
            { text: 'Theme Development', link: '/developer/plugin-types/theme-development' },
            { text: 'Hooks Reference', link: '/developer/plugins/hooks' },
            { text: 'Events Reference', link: '/developer/plugins/events' },
            { text: 'Capabilities & Permissions', link: '/developer/plugins/capabilities' },
          ],
        },
      ],

      '/advanced-topics/': [
        {
          text: 'Advanced Topics',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/advanced-topics/' },
            { text: 'Troubleshooting', link: '/advanced-topics/troubleshooting' },
            { text: 'FAQ', link: '/advanced-topics/faq' },
            { text: 'Security & Compliance', link: '/advanced-topics/security-compliance' },
            { text: 'Performance & Scaling', link: '/advanced-topics/performance-scaling' },
          ],
        },
      ],

      '/resources/': [
        {
          text: 'Resources & References',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/resources/' },
            { text: 'Architecture', link: '/resources/architecture' },
            { text: 'Features & Capabilities', link: '/resources/features' },
            { text: 'Local Setup', link: '/resources/local-setup' },
            { text: 'Contributing', link: '/resources/contributing' },
            { text: 'Roadmap', link: '/resources/roadmap' },
          ],
        },
        {
          text: 'Integration Guides',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/resources/integrations/' },
            { text: 'REST API', link: '/resources/integrations/rest-api' },
            { text: 'Python', link: '/resources/integrations/python' },
            { text: 'Java', link: '/resources/integrations/java' },
            { text: 'Go', link: '/resources/integrations/go' },
            { text: 'Ruby', link: '/resources/integrations/ruby' },
            { text: 'JavaScript/TypeScript', link: '/resources/integrations/javascript' },
            { text: '.NET / C#', link: '/resources/integrations/dotnet' },
            { text: 'Mobile (iOS/Android)', link: '/resources/integrations/mobile' },
          ],
        },
        {
          text: 'Additional Resources',
          collapsed: true,
          items: [
            { text: 'Glossary', link: '/resources/glossary' },
            { text: 'Code Examples', link: '/resources/code-examples' },
          ],
        },
        {
          text: 'External Services',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/resources/external-services/' },
            { text: 'Main Website', link: '/resources/external-services/main-website' },
            { text: 'Plugin Marketplace', link: '/resources/external-services/plugin-marketplace' },
            { text: 'Blog & News', link: '/resources/external-services/blog' },
            { text: 'Live Demo', link: '/resources/external-services/demo' },
            { text: 'Version Registry', link: '/resources/external-services/version-registry' },
            { text: 'Enterprise Support', link: '/resources/external-services/enterprise-support' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/own-pay/OwnPay' },
      { icon: 'facebook', link: 'https://facebook.com/group/ownpay.org' },
      { icon: 'youtube', link: 'https://youtube.com/@ownpayorg' },
    ],

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
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  vite: {
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('shiki') || id.includes('@shikijs')) {
              return 'shiki'
            }
          }
        }
      }
    },
    esbuild: {
      target: 'esnext'
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  },
  async transformHead(context) {
    if (context.page === '404.md') {
      return [];
    }

    const { relativePath } = context.pageData;

    // Normalize relative path to clean URL path
    let canonicalPath = relativePath.replace(/\.md$/, '');
    if (canonicalPath === 'index') {
      canonicalPath = '';
    } else if (canonicalPath.endsWith('/index')) {
      canonicalPath = canonicalPath.slice(0, -5);
    }
    const cleanPath = canonicalPath ? '/' + canonicalPath : '/';
    const pageUrl = `https://learn.ownpay.org${cleanPath}`;

    // Resolve Page Title, Description, and OG Image
    const isHome = cleanPath === '/';
    const siteName = 'OwnPay';

    // context.title contains the resolved page title (e.g. "Transactions | OwnPay Documentation - Help & Guides")
    const pageTitle = isHome ? context.siteData.title : context.title;
    const pageDescription = isHome ? context.siteData.description : getPageDescription(context);
    const pageImage = isHome ? 'https://learn.ownpay.org/ownpay_og.png' : getPageImage(context);

    // Build standard SEO tags
    const headTags = [
      ['link', { rel: 'canonical', href: pageUrl }],
      ['meta', { property: 'og:site_name', content: siteName }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: pageUrl }],
      ['meta', { property: 'og:image', content: pageImage }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { name: 'twitter:image', content: pageImage }],
    ];

    // Build dynamic JSON-LD structured data
    let schema = {};
    if (isHome) {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'OwnPay Documentation',
        'url': pageUrl,
        'description': pageDescription,
        'publisher': {
          '@type': 'Organization',
          'name': siteName,
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://learn.ownpay.org/ownpay-symbol.svg'
          }
        }
      };
    } else {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': pageTitle,
        'description': pageDescription,
        'url': pageUrl,
        'image': pageImage,
        'inLanguage': 'en-US',
        'mainEntityOfPage': pageUrl,
        'publisher': {
          '@type': 'Organization',
          'name': siteName,
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://learn.ownpay.org/ownpay-symbol.svg'
          }
        }
      };
    }

    headTags.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(schema)
    ]);

    return headTags;
  }
})
