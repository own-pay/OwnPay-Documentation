addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const urlObject = new URL(request.url);
    
    if (urlObject.pathname.startsWith('/.well-known/')) {
      return await fetch(request);
    }
    
    if (/^\/docs/.test(urlObject.pathname)) {
      const DOCS_URL = "ownpay.mintlify.dev";
      const CUSTOM_URL = "ownpay.org";

      let url = new URL(request.url);
      url.hostname = DOCS_URL;

      let proxyRequest = new Request(url, request);

      proxyRequest.headers.set("Host", DOCS_URL);
      proxyRequest.headers.set("X-Forwarded-Host", CUSTOM_URL);
      proxyRequest.headers.set("X-Forwarded-Proto", "https");
      proxyRequest.headers.set("CF-Connecting-IP", request.headers.get("CF-Connecting-IP"));

      return await fetch(proxyRequest);
    }

    // ✅ Add this: default response for all other paths
    return new Response("Not Found", { status: 404 });
  } catch (error) {
    return await fetch(request);
  }
}
