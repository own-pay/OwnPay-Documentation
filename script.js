// ===== GitHub Star Count =====
async function updateGitHubStars() {
  try {
    const response = await fetch('https://api.github.com/repos/own-pay/OwnPay');
    const data = await response.json();
    const stars = data.stargazers_count;
    let displayStars = stars >= 1000 ? (stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : stars.toString();
    const githubLink = document.querySelector('a[href*="github.com/own-pay/OwnPay"]');
    if (githubLink && !githubLink.querySelector('.github-stars-badge')) {
      const badge = document.createElement('span');
      badge.className = 'github-stars-badge';
      badge.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg><span class="star-count">${displayStars}</span>`;
      githubLink.appendChild(badge);
    }
  } catch (e) { /* silent */ }
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
  updateGitHubStars();
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
