// ===== Dynamic Footer Description =====
function injectFooterDescription() {
  const logoLink = document.querySelector('footer a[href*="/docs"]');
  if (logoLink && !document.querySelector('.footer-description')) {
    const desc = document.createElement('p');
    desc.className = 'footer-description';
    desc.textContent = 'Self-hosted, enterprise-grade payment orchestrator with multi-brand support, white-label domains, and 100+ payment gateways.';
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
    "description": "Self-hosted, open-source payment gateway platform with multi-brand support, 100+ payment gateways, white-label checkout, and full REST API.",
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

// ===== GEO: llms.txt Discovery Link =====
function injectLlmsTxtLink() {
  if (document.querySelector('link[href*="llms.txt"]')) return;
  const link = document.createElement('link');
  link.rel = 'llms-txt';
  link.href = 'https://ownpay.org/docs/llms.txt';
  document.head.appendChild(link);
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

// ===== Initialize =====
function init() {
  injectFooterDescription();
  injectStructuredData();
  injectLlmsTxtLink();
  rewriteNativeIssueLinks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

const observer = new MutationObserver(() => init());
observer.observe(document.body, { childList: true, subtree: true });
