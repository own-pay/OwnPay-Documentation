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
  title: 'OwnPay Documentation — Help & Guides',
  description: 'Official Documentation for OwnPay — self-hosted, open-source payment Gateway.',

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
      { text: 'User Guide', link: '/user-guide/', activeMatch: '/user-guide/' },
      { text: 'Developer', link: '/developer/', activeMatch: '/developer/' },
      { text: 'API Reference', link: 'https://docs.ownpay.org' },
      { text: 'Plugins', link: 'https://plugins.ownpay.org' },
    ],

    sidebar: {
      '/user-guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/user-guide/introduction' },
            { text: 'Architecture', link: '/user-guide/architecture' },
            { text: 'Installation', link: '/user-guide/installation' },
          ],
        },
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/user-guide/' },
            { text: 'Requirements', link: '/user-guide/requirements' },
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
            { text: 'Hook Reference', link: '/developer/hooks-reference' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/own-pay/OwnPay-Documentation' },
      { icon: 'facebook', link: 'https://fb.com/ownpay.org' },
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
    theme: 'github-dark'
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
    
    // context.title contains the resolved page title (e.g. "Transactions | OwnPay Documentation — Help & Guides")
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
