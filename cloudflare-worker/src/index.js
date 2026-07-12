// Cloudflare Worker: reverse proxy /docs to ownpay.mintlify.site
// Preserves the /docs subpath as required by Mintlify subdirectory custom domains.

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // If the request is to a Vercel/Let's Encrypt verification path, allow it to pass through
      if (url.pathname.startsWith('/.well-known/')) {
        return fetch(request);
      }

      // Only handle /docs paths
      if (!url.pathname.startsWith('/docs')) {
        return fetch(request);
      }

      const DOCS_HOST = 'ownpay.mintlify.site';
      const CUSTOM_HOST = 'ownpay.org';

      let newUrl = new URL(request.url);
      newUrl.hostname = DOCS_HOST;
      newUrl.protocol = 'https';

      let proxyRequest = new Request(newUrl.toString(), request);

      // Set necessary headers for Mintlify custom domain verification and routing
      proxyRequest.headers.set('Host', DOCS_HOST);
      proxyRequest.headers.set('X-Forwarded-Host', CUSTOM_HOST);
      proxyRequest.headers.set('X-Forwarded-Proto', 'https');
      
      if (request.headers.get('CF-Connecting-IP')) {
        proxyRequest.headers.set('CF-Connecting-IP', request.headers.get('CF-Connecting-IP'));
      }

      let response = await fetch(proxyRequest);

      // Only rewrite HTML responses to fix og: and fb: tags attributes (name -> property)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        response = new HTMLRewriter()
          .on('meta[name^="og:"], meta[name^="fb:"]', {
            element(element) {
              const name = element.getAttribute('name');
              element.setAttribute('property', name);
              element.removeAttribute('name');
            }
          })
          .transform(response);
      }

      return response;

    } catch (error) {
      return new Response('Proxy Error: ' + error.message, { status: 500 });
    }
  }
};
