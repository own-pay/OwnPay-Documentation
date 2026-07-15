// ===== Dynamic Footer Description =====
function injectFooterDescription() {
  const logoImg = document.querySelector('footer img[src*="logo"]') || document.querySelector('footer img[src*="light"]') || document.querySelector('footer img[src*="dark"]');
  const logoLink = logoImg ? logoImg.closest('a') : (document.querySelector('footer a[href*="/docs"]') || document.querySelector('footer a[href="/"]'));
  
  if (logoLink && !document.querySelector('footer .footer-description')) {
    const desc = document.createElement('p');
    desc.className = 'footer-description';
    desc.textContent = 'Self-hosted payment orchestrator with multi-brand support, white-label domains, and 100+ payment gateways.';
    logoLink.parentNode.insertBefore(desc, logoLink.nextSibling);
  }
}

// ===== GEO: Structured Data (JSON-LD) =====
function injectStructuredData() {
  // 1. SoftwareApplication - global, every page (product identity for search + AI)
  if (!document.querySelector('script[data-ownpay-schema="app"]')) {
    const appSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "OwnPay",
      "alternateName": "OwnPay Payment Orchestrator",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Linux, Docker, cPanel, Plesk, DirectAdmin",
      "description": "Self-hosted, open-source payment orchestrator with multi-brand support, 100+ payment gateways, white-label checkout, double-entry ledger, and full REST API. Licensed under AGPL-3.0, free forever.",
      "url": "https://ownpay.org",
      "image": "https://ownpay.org/docs/dashboard.jpg",
      "screenshot": "https://ownpay.org/docs/dashboard.jpg",
      "softwareVersion": "0.2.0",
      "softwareHelp": {
        "@type": "CreativeWork",
        "url": "https://ownpay.org/docs"
      },
      "downloadUrl": "https://github.com/own-pay/OwnPay/releases",
      "installUrl": "https://ownpay.org/docs/installation",
      "license": "https://www.gnu.org/licenses/agpl-3.0.html",
      "isAccessibleForFree": true,
      "inLanguage": "en",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "author": {
        "@type": "Organization",
        "name": "OwnPay",
        "url": "https://ownpay.org"
      },
      "maintainer": {
        "@type": "Organization",
        "name": "OwnPay",
        "url": "https://ownpay.org"
      },
      "sameAs": [
        "https://github.com/own-pay/OwnPay"
      ],
      "featureList": [
        "Multi-brand payment management with tenant isolation",
        "100+ payment gateway integrations including Stripe, PayPal, bKash, Nagad, GCash",
        "White-label checkout pages with custom domains",
        "Double-entry ledger bookkeeping for financial integrity",
        "REST API with Merchant, Mobile, and Admin endpoints",
        "Webhook system for real-time event notifications",
        "Plugin architecture for gateways, addons, and themes",
        "Mobile SMS verification via Android companion app",
        "Role-based access control with granular permissions",
        "Self-hosted deployment on shared hosting, VPS, or Docker"
      ],
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2", ".description"]
      }
    };

    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-ownpay-schema', 'app');
    el.textContent = JSON.stringify(appSchema);
    document.head.appendChild(el);
  }

  // 2. Organization - global, every page (brand identity for Knowledge Panel)
  if (!document.querySelector('script[data-ownpay-schema="org"]')) {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "OwnPay",
      "url": "https://ownpay.org",
      "logo": "https://ownpay.org/docs/logo/light.svg",
      "description": "OwnPay is an open-source, self-hosted payment orchestrator for managing multiple brands, 100+ payment gateways, and white-label checkout experiences.",
      "sameAs": [
        "https://github.com/own-pay/OwnPay",
        "https://x.com/ownpayorg",
        "https://youtube.com/@ownpayorg",
        "https://facebook.com/ownpay.org",
        "https://plugins.ownpay.org",
        "https://update.ownpay.org",
        "https://facebook.com/groups/ownpay.org",
        "https://blog.ownpay.org"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@ownpay.org",
        "contactType": "customer support",
        "url": "https://github.com/own-pay/OwnPay/issues/new"
      }
    };

    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-ownpay-schema', 'org');
    el.textContent = JSON.stringify(orgSchema);
    document.head.appendChild(el);
  }

  // 3. WebSite with SearchAction - global (enables sitelinks search box)
  if (!document.querySelector('script[data-ownpay-schema="website"]')) {
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "OwnPay Documentation",
      "url": "https://ownpay.org/docs",
      "inLanguage": "en",
      "publisher": {
        "@type": "Organization",
        "name": "OwnPay"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://ownpay.org/docs/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-ownpay-schema', 'website');
    el.textContent = JSON.stringify(websiteSchema);
    document.head.appendChild(el);
  }

  // 4. BreadcrumbList - dynamic, based on current URL path
  if (!document.querySelector('script[data-ownpay-schema="breadcrumb"]')) {
    const path = window.location.pathname.replace(/^\/docs\/?/, '').replace(/\/$/, '');
    if (path) {
      const segments = path.split('/').filter(Boolean);
      const itemListElement = [
        { "@type": "ListItem", "position": 1, "name": "Documentation", "item": "https://ownpay.org/docs" }
      ];

      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += '/' + segment;
        const name = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        itemListElement.push({
          "@type": "ListItem",
          "position": index + 2,
          "name": name,
          "item": "https://ownpay.org/docs" + currentPath
        });
      });

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": itemListElement
      };

      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-ownpay-schema', 'breadcrumb');
      el.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(el);
    }
  }

  // 5. FAQPage - ONLY on the FAQ page
  if (window.location.pathname.includes('/advanced-topics/faq') && !document.querySelector('script[data-ownpay-schema="faq"]')) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "name": "OwnPay Frequently Asked Questions",
      "description": "Common questions and answers about OwnPay installation, licensing, payment gateways, plugins, SMS verification, and troubleshooting.",
      "datePublished": "2025-01-01",
      "dateModified": "2026-07-15",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is OwnPay?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OwnPay is a self-hosted payment orchestrator. It allows a single platform owner to manage multiple white-labeled merchant stores (brands) under one installation, with double-entry ledger bookkeeping, 100+ payment gateways, and Android SMS verification."
          }
        },
        {
          "@type": "Question",
          "name": "Is OwnPay a SaaS platform?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. OwnPay is infrastructure you deploy and own. You control the server, database, credentials, and data. No third-party has access to your transactions."
          }
        },
        {
          "@type": "Question",
          "name": "Is OwnPay free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, OwnPay is open-source and licensed under AGPL-3.0. You deploy it on your own server and pay only for your hosting and payment gateway processing fees. There are no licensing fees."
          }
        },
        {
          "@type": "Question",
          "name": "How do I install OwnPay?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OwnPay supports shared hosting (cPanel, Plesk, DirectAdmin), VPS, and Docker. Requirements: PHP 8.3+, MySQL 5.7+ or MariaDB 10.3+, 512MB RAM minimum. Upload files, create a database, and visit your domain to run the web installer."
          }
        },
        {
          "@type": "Question",
          "name": "What payment gateways does OwnPay support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OwnPay supports 100+ payment gateways including Stripe, PayPal, bKash, Nagad, GCash, Square, Razorpay, bank transfers, and more. You can also build custom gateway plugins using the plugin system."
          }
        },
        {
          "@type": "Question",
          "name": "How is OwnPay different from Stripe or PayPal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Stripe and PayPal are payment processors. OwnPay is a payment orchestrator - it connects to multiple gateways (including Stripe and PayPal) and gives you a unified interface to manage all payment methods across multiple brands."
          }
        },
        {
          "@type": "Question",
          "name": "What are the system requirements for OwnPay?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PHP 8.3 or higher, MySQL 5.7+ or MariaDB 10.3+, 512MB RAM minimum (2GB+ recommended), 1GB disk space minimum, and an SSL certificate for production."
          }
        },
        {
          "@type": "Question",
          "name": "Does OwnPay have an API?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. OwnPay provides three REST APIs: Merchant API for payment operations, Mobile API for companion app integration, and Admin API for platform management. All APIs use Bearer token authentication and include webhook support."
          }
        }
      ]
    };

    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-ownpay-schema', 'faq');
    el.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(el);
  }
}

// ===== GEO: llms.txt Discovery Link (head link + body directive) =====
function injectLlmsTxtLink() {
  // 1. <link> tag in <head> for crawlers that probe link relations
  if (!document.querySelector('link[rel="llms-txt"]')) {
    const link = document.createElement('link');
    link.rel = 'llms-txt';
    link.href = 'https://ownpay.org/docs/llms.txt';
    document.head.appendChild(link);
  }

  // 2. Visually-hidden body directive for agents that read page body
  // clip-rect technique: exists in DOM but invisible to sighted users
  if (!document.querySelector('[data-llms-directive]')) {
    const div = document.createElement('div');
    div.setAttribute('data-llms-directive', 'true');
    div.setAttribute('aria-hidden', 'true');
    div.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    div.innerHTML = 'For the complete OwnPay documentation index, see <a href="https://ownpay.org/docs/llms.txt">llms.txt</a>. Pages are available as Markdown by appending <code>.md</code> to any URL.';
    if (document.body.firstChild) {
      document.body.insertBefore(div, document.body.firstChild);
    } else {
      document.body.appendChild(div);
    }
  }
}

// ===== Rewrite Native Issue Links Client-Side =====
function rewriteNativeIssueLinks() {
  const links = document.querySelectorAll('a[href*="OwnPay-Documentation/issues/new"]');
  links.forEach(link => {
    const oldUrl = link.getAttribute('href');
    if (oldUrl && oldUrl.includes('OwnPay-Documentation/issues/new')) {
      const newUrl = oldUrl.replace('OwnPay-Documentation/issues/new', 'OwnPay/issues/new');
      link.setAttribute('href', newUrl);
    }
  });
}

// ===== Dynamic Latest Version Download Logic =====
let isFetchingVersion = false;

async function fetchLatestVersion() {
  const versionElements = document.querySelectorAll('[data-latest-version]');
  const downloadElements = document.querySelectorAll('[data-latest-download]');
  
  if (versionElements.length === 0 && downloadElements.length === 0) {
    return;
  }

  // 1. Try Cache
  try {
    const cachedData = sessionStorage.getItem('ownpay_latest_version');
    if (cachedData) {
      const { version, downloadUrl } = JSON.parse(cachedData);
      updateVersionDOM(versionElements, downloadElements, version, downloadUrl);
      return;
    }
  } catch (e) {
    // Ignore cache error
  }

  // 2. Fetch API
  // AbortController: cancel if the server takes more than 5 seconds.
  // Guide: AbortController and AbortSignal (Modern Web Guidance)
  // priority: 'low': deprioritize so this does not compete with user requests.
  // Guide: deprioritize-background-fetches (Modern Web Guidance)
  if (isFetchingVersion) return;
  isFetchingVersion = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://update.ownpay.org/api/v1/release', {
      signal: controller.signal,
      priority: 'low'
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    
    if (data && data.latest) {
      const version = data.latest.version;
      const downloadUrl = data.latest.download_url && data.latest.download_url.github;
      
      if (version && downloadUrl) {
        sessionStorage.setItem('ownpay_latest_version', JSON.stringify({ version, downloadUrl }));
        updateVersionDOM(versionElements, downloadElements, version, downloadUrl);
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    // Fail silently (includes AbortError from timeout)
  } finally {
    isFetchingVersion = false;
  }
}

function updateVersionDOM(versionElements, downloadElements, version, downloadUrl) {
  versionElements.forEach(el => {
    if (el.textContent !== version) {
      el.textContent = version;
    }
  });
  downloadElements.forEach(el => {
    if (el.getAttribute('href') !== downloadUrl) {
      el.setAttribute('href', downloadUrl);
    }
  });
}

// ===== Initialize =====
function init() {
  injectFooterDescription();
  injectStructuredData();
  injectLlmsTxtLink();
  rewriteNativeIssueLinks();
  fetchLatestVersion();
}

let initTimeout = null;
function debouncedInit() {
  if (initTimeout) clearTimeout(initTimeout);
  initTimeout = setTimeout(init, 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

const observer = new MutationObserver(debouncedInit);
observer.observe(document.body, { childList: true, subtree: true });
