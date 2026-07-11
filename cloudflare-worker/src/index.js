// Cloudflare Worker: redirect /docs to ownpay.mintlify.app
// Uses a simple redirect to preserve 100% Mintlify functionality
// (mobile nav, SPA routing, contextual menu, MCP server, etc.)

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);

      // Pass through .well-known
      if (url.pathname.startsWith('/.well-known/')) {
        return await fetch(request);
      }

      // Only handle /docs paths
      if (!url.pathname.startsWith('/docs')) {
        return fetch(request);
      }

      // Build target URL on Mintlify
      const pathAfterDocs = url.pathname.slice('/docs'.length) || '/';
      const target = new URL(pathAfterDocs, 'https://ownpay.mintlify.app');
      target.search = url.search;

      // 302 redirect to Mintlify
      return Response.redirect(target.toString(), 302);

    } catch (e) {
      return new Response('Error: ' + e.message, { status: 500 });
    }
  }
};
