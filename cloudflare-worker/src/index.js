const MINTLIFY_HOST = 'ownpay.mintlify.app';
const DOCS_PREFIX = '/docs';

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

      // Forward request to Mintlify
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

      // For HTML responses, rewrite URLs
      if (contentType.includes('text/html')) {
        let body = await response.text();

        // Rewrite absolute Mintlify URLs to our /docs prefix
        body = body.replaceAll(`https://${MINTLIFY_HOST}`, 'https://ownpay.org/docs');
        
        // Rewrite root-relative URLs (e.g. /_next/..., /favicon.svg) to /docs/...
        body = body.replace(/(href|src|action|content)="\/(?!docs|https:|http:|\/\/)/g, '$1="/docs/');
        body = body.replace(/(href|src|action|content)='\/(?!docs|https:|http:|\/\/)/g, "$1='/docs/");
        
        // Rewrite URL() references in inline scripts
        body = body.replace(/url\(\/(?!docs|https:|http:|\/\/)/g, 'url(/docs/');
        
        // Rewrite fetch/API paths in inline scripts  
        body = body.replace(/fetch\(\"\//g, 'fetch("/docs/');
        body = body.replace(/fetch\(\'\//g, "fetch('/docs/");

        return new Response(body, {
          status: response.status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          }
        });
      }

      // For non-HTML responses (CSS, JS, images, fonts), pass through directly
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cache-Control', 'public, max-age=86400');
      newHeaders.delete('X-Frame-Options');
      newHeaders.delete('Content-Security-Policy');

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
