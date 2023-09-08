// services/ad.routes.js
const url = require("url");
const request = require("request");
const cheerio = require("cheerio");
const { logError } = require("./ad.ERRSYS.js");

function handleResourceRequest(req, res, targetUrl, errorCallback) {
  const parsedUrl = url.parse(req.url);
  if (parsedUrl.pathname.startsWith("/adresource/")) {
    // Create a resource URL by decoding and removing the '/adresource/' prefix
    const resourceUrl = decodeURIComponent(
      parsedUrl.pathname.slice("/adresource/".length)
    );

    // Proxy resource requests
    const proxyReq = request(resourceUrl);
    proxyReq.on("error", (error) => {
      logError(error);
      errorCallback(res, 500, "Internal Server Error");
    });
    proxyReq.pipe(res);
  }
}

function handleHtmlResponse(req, res, targetUrl, htmlContent) {
  try {
    const $ = cheerio.load(htmlContent);

    // Rewrite all anchor (a) elements to point to the proxied URL
    $("a").each(function () {
      const originalHref = $(this).attr("href");
      if (originalHref) {
        // Encode and rewrite the href attribute
        const encodedHref = `/adresource/${encodeURIComponent(
          targetUrl + originalHref
        )}`;
        $(this).attr("href", encodedHref);
      }
    });

    // Serve the modified HTML content through the proxy
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end($.html());
  } catch (error) {
    logError(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("HTML Parsing Error");
  }
}

module.exports = {
  handleResourceRequest,
  handleHtmlResponse,
};
