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
  if (document.querySelector('script[data-ownpay-schema]')) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OwnPay",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Linux, Docker",
    "description": "Self-hosted payment orchestrator with multi-brand support, 100+ payment gateways, white-label checkout, and full REST API.",
    "url": "https://ownpay.org",
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": "https://ownpay.org/docs"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "OwnPay",
      "url": "https://ownpay.org"
    },
    "featureList": [
      "Multi-brand payment management",
      "100+ payment gateway integrations",
      "White-label checkout pages",
      "Double-entry ledger bookkeeping",
      "REST API with webhooks",
      "Plugin system for gateways and themes",
      "Mobile SMS verification",
      "Role-based access control"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is OwnPay?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OwnPay is a self-hosted, open-source payment gateway platform that allows you to manage multiple brands, connect to 100+ payment gateways, and provide white-label checkout experiences. You control the server, database, and all transaction data."
        }
      },
      {
        "@type": "Question",
        "name": "How do I install OwnPay?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OwnPay has a built-in web installer. Upload the files to your server (shared hosting, VPS, or Docker), create a MySQL database, and visit your domain to run the installer. No command-line knowledge required for shared hosting installations."
        }
      },
      {
        "@type": "Question",
        "name": "What payment gateways does OwnPay support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OwnPay supports 100+ payment gateways including Stripe, PayPal, bKash, Nagad, GCash, Square, Razorpay, bank transfers, and more. You can also build custom gateway plugins."
        }
      },
      {
        "@type": "Question",
        "name": "Is OwnPay free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, OwnPay is open-source and free to use. You deploy it on your own server and pay only for your hosting and payment gateway processing fees."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Documentation", "item": "https://ownpay.org/docs" },
      { "@type": "ListItem", "position": 2, "name": "Getting Started", "item": "https://ownpay.org/docs/quickstart" },
      { "@type": "ListItem", "position": 3, "name": "Installation", "item": "https://ownpay.org/docs/installation" }
    ]
  };

  [schema, faqSchema, breadcrumbSchema].forEach(s => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-ownpay-schema', 'true');
    el.textContent = JSON.stringify(s);
    document.head.appendChild(el);
  });
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
