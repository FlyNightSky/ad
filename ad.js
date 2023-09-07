const http = require("http");
const httpProxy = require("http-proxy");
const request = require("request");
const url = require("url");
const cheerio = require("cheerio"); // For parsing HTML

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Define the target URL (the site you want to proxy)
  const targetUrl = "https://openai.com"; // Replace with your target URL

  // Stage 1: Fully encode the target URL
  const parsedUrl = url.parse(req.url);
  const encodedTargetUrl = `${targetUrl}${parsedUrl.path}`;
  const encodedUrl = encodeURIComponent(encodedTargetUrl);
  console.log("Stage 1: Encoding Full Target URL:", encodedUrl);

  // Stage 2: Fetch content from the target URL
  request(encodedTargetUrl, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // Stage 3: Parse HTML content
      const $ = cheerio.load(body);

      // Stage 4: Rewrite resource URLs in HTML (e.g., images, CSS, JavaScript, CSS frameworks, JS frameworks)
      $('img, link[rel="stylesheet"], script').each(function () {
        const resourceUrl = $(this).attr("src") || $(this).attr("href");
        if (resourceUrl) {
          // Encode and rewrite resource URLs
          const encodedResourceUrl = encodeURIComponent(
            `${targetUrl}${resourceUrl}`
          );
          $(this).attr("src", `/adresource/${encodedResourceUrl}`);
        }
      });

      // Stage 5: Serve the modified HTML content through the proxy
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end($.html());
      console.log("Stage 5: Serving Modified HTML Content");
    } else {
      console.error("Fetch Error:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Fetch Error");
    }
  });
});

// Handle requests for resource URLs
server.on("request", (req, res) => {
  const parsedUrl = url.parse(req.url);
  if (parsedUrl.pathname.startsWith("/adresource/")) {
    // Stage 6: Proxy resource requests
    const resourceUrl = decodeURIComponent(
      parsedUrl.pathname.slice("/adresource/".length)
    );
    const headers = req.headers; // Copy original request headers
    headers.host = url.parse(resourceUrl).host; // Update 'Host' header
    headers["x-forwarded-for"] = req.connection.remoteAddress; // Update 'X-Forwarded-For' header
    headers["x-forwarded-proto"] = req.connection.encrypted ? "https" : "http"; // Update 'X-Forwarded-Proto' header

    // Proxy the request with updated headers
    proxy.web(req, res, { target: resourceUrl, headers }, (err) => {
      if (err) {
        console.error("Proxy Error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy Error");
      }
    });
    console.log("Stage 6: Proxying Resource Request");
  }
});

// Handle errors on the proxy server
proxy.on("error", (err) => {
  console.error("Proxy Server Error:", err);
});

// Listen on a port
const port = 3000;
server.listen(port, () => {
  console.log(`Proxy server is listening on port ${port}`);
});
