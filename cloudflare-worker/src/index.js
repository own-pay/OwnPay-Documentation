const MINTLIFY_HOST = 'ownpay.mintlify.app';
const DOCS_PREFIX = '/docs';

const CUSTOM_CSS = `
footer a[href*="mintlify.com"] { display: none !important; }
footer [data-component-name="theme-toggle"],
footer button[aria-label*="theme"] { display: none !important; }
footer .py-16, footer .md\\:py-20, footer .lg\\:py-28,
#footer .py-16, #footer .md\\:py-20, #footer .lg\\:py-28 {
  padding-top: 1rem !important; padding-bottom: 0 !important;
}
footer .gap-12, #footer .gap-12 { gap: 0.75rem !important; }
footer .px-8, #footer .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
footer ul li a, #footer ul li a { font-size: 13px !important; line-height: 1.6 !important; }
footer h4, #footer h4 { font-size: 13px !important; margin-bottom: 0.25rem !important; }
footer::after {
  content: "Built by the Community, for the Community.";
  display: block; text-align: center; font-size: 12px; color: #9ca3af;
  padding: 0.5rem 0; margin: 0;
}
#navbar nav a[href*="github.com/own-pay"] span { display: none !important; }
.github-stars-badge {
  display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600;
  color: #374151; padding: 2px 8px; border-radius: 9999px; border: 1px solid #e5e7eb;
  background: #f9fafb; line-height: 1; margin-left: -4px;
}
.dark .github-stars-badge { color: #d1d5db; border-color: #374151; background: #1f2937; }
.github-stars-badge svg { width: 12px; height: 12px; fill: #fbbf24; }
`;

const CUSTOM_JS = `
async function updateGitHubStars() {
  try {
    const r = await fetch('https://api.github.com/repos/own-pay/OwnPay');
    const d = await r.json();
    const s = d.stargazers_count;
    const display = s >= 1000 ? (s/1000).toFixed(1).replace(/\\.0$/,'') + 'k' : s.toString();
    const link = document.querySelector('a[href*="github.com/own-pay/OwnPay"]');
    if (link && !link.querySelector('.github-stars-badge')) {
      const b = document.createElement('span');
      b.className = 'github-stars-badge';
      b.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg><span class="star-count">'+display+'</span>';
      link.appendChild(b);
    }
  } catch(e) {}
}
function injectSchema() {
  if (document.querySelector('script[data-ownpay-schema]')) return;
  var schemas = [
    {"@context":"https://schema.org","@type":"SoftwareApplication","name":"OwnPay","applicationCategory":"FinanceApplication","operatingSystem":"Linux, Docker","description":"Self-hosted, open-source payment gateway platform with multi-brand support, 100+ payment gateways, white-label checkout, and full REST API.","url":"https://ownpay.org","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Organization","name":"OwnPay","url":"https://ownpay.org"}},
    {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is OwnPay?","acceptedAnswer":{"@type":"Answer","text":"OwnPay is a self-hosted, open-source payment gateway platform that allows you to manage multiple brands, connect to 100+ payment gateways, and provide white-label checkout experiences."}},{"@type":"Question","name":"How do I install OwnPay?","acceptedAnswer":{"@type":"Answer","text":"OwnPay has a built-in web installer. Upload the files to your server, create a MySQL database, and visit your domain to run the installer."}},{"@type":"Question","name":"What payment gateways does OwnPay support?","acceptedAnswer":{"@type":"Answer","text":"OwnPay supports 100+ payment gateways including Stripe, PayPal, bKash, Nagad, GCash, Square, Razorpay, bank transfers, and more."}},{"@type":"Question","name":"Is OwnPay free?","acceptedAnswer":{"@type":"Answer","text":"Yes, OwnPay is open-source and free to use. You deploy it on your own server and pay only for hosting and payment gateway processing fees."}}]}
  ];
  schemas.forEach(function(s) {
    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-ownpay-schema', 'true');
    el.textContent = JSON.stringify(s);
    document.head.appendChild(el);
  });
}
function init() { updateGitHubStars(); injectSchema(); }
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
new MutationObserver(function(){ init(); }).observe(document.body, { childList: true, subtree: true });
`;

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);

      // Pass through .well-known
      if (url.pathname.startsWith('/.well-known/')) {
        return await fetch(request);
      }

      // Only handle /docs paths
      if (!url.pathname.startsWith(DOCS_PREFIX)) {
        return fetch(request);
      }

      // Strip /docs prefix and build target URL
      const pathAfterDocs = url.pathname.slice(DOCS_PREFIX.length) || '/';
      const target = new URL(pathAfterDocs, `https://${MINTLIFY_HOST}`);
      target.search = url.search;

      // Forward request to Mintlify with follow redirects
      const response = await fetch(target.toString(), {
        method: request.method,
        headers: {
          'Accept': request.headers.get('Accept') || '*/*',
          'Accept-Encoding': request.headers.get('Accept-Encoding') || '',
          'Accept-Language': request.headers.get('Accept-Language') || '',
          'User-Agent': request.headers.get('User-Agent') || '',
        },
        redirect: 'follow'
      });

      const contentType = response.headers.get('Content-Type') || '';

      // Only modify HTML responses
      if (contentType.includes('text/html')) {
        let body = await response.text();

        // Rewrite absolute Mintlify URLs
        body = body.replaceAll(`https://${MINTLIFY_HOST}`, 'https://ownpay.org/docs');

        // Rewrite root-relative navigation links (not assets)
        // Only rewrite href/src for navigation, not CDN assets
        body = body.replace(/href="\/(?!docs|https:|http:|\/\/|mintcdn\.com|static\.|_next\/)/g, 'href="/docs/');
        body = body.replace(/href='\/(?!docs|https:|http:|\/\/|mintcdn\.com|static\.|_next\/)/g, "href='/docs/");

        // Rewrite fetch/API paths for SPA navigation
        body = body.replace(/fetch\("\/(?!docs|https:|http:|\/\/|mintcdn\.com)/g, 'fetch("/docs/');

        // Inject custom CSS and JS
        body = body.replace('</head>', '<style>' + CUSTOM_CSS + '</style></head>');
        body = body.replace('</body>', '<script>' + CUSTOM_JS + '</script></body>');

        return new Response(body, {
          status: response.status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          }
        });
      }

      // For non-HTML responses (CSS, JS, images), pass through directly
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cache-Control', 'public, max-age=86400');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (e) {
      return new Response('Proxy error: ' + e.message, { status: 502 });
    }
  }
};
