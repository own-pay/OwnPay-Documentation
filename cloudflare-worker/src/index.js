addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const urlObject = new URL(request.url);
    
    // If the request is to a Vercel verification path, allow it to pass through
    if (urlObject.pathname.startsWith('/.well-known/')) {
      return await fetch(request);
    }
    
    // If the request is to the docs subpath
    if (/^\/docs/.test(urlObject.pathname)) {
      // Then Proxy to Mintlify
      const DOCS_URL = "ownpay.mintlify.site";
      const CUSTOM_URL = "ownpay.org";

      let url = new URL(request.url);
      url.hostname = DOCS_URL;

      let proxyRequest = new Request(url, request);

      proxyRequest.headers.set("Host", DOCS_URL);
      proxyRequest.headers.set("X-Forwarded-Host", CUSTOM_URL);
      proxyRequest.headers.set("X-Forwarded-Proto", "https");
      // If deploying to Vercel, preserve client IP
      proxyRequest.headers.set("CF-Connecting-IP", request.headers.get("CF-Connecting-IP"));

      return await fetch(proxyRequest);
    }
  } catch (error) {
    // If no action found, play the regular request
    return await fetch(request);
  }
}
