// services/ad.server.js
const http = require("http");
const https = require("https");
const url = require("url");
const { logError } = require("./ad.ERRSYS.js");
const { handleHtmlResponse } = require("./ad.routes.js"); // Import handleHtmlResponse

function createServer(targetUrl) {
  return http.createServer((req, res) => {
    // Log incoming request details
    console.log(`Received request for ${req.url} with method ${req.method}`);

    // Parse the target URL
    const targetParsed = url.parse(targetUrl);

    // Determine whether to use 'http' or 'https' for the proxy request
    const proxy = targetParsed.protocol === "https:" ? https : http;

    // Create the proxy request
    const proxyReq = proxy.request(targetUrl, (proxyRes) => {
      // Log response details from the target site
      console.log(`Proxy received response with status ${proxyRes.statusCode}`);

      // Check if the response is HTML content
      const contentType = proxyRes.headers["content-type"];
      if (contentType && contentType.includes("text/html")) {
        // Read and modify the HTML content
        let htmlContent = "";
        proxyRes.on("data", (chunk) => {
          htmlContent += chunk;
        });
        proxyRes.on("end", () => {
          // Handle HTML response and rewrite links
          handleHtmlResponse(req, res, targetUrl, htmlContent);
        });
      } else {
        // Forward non-HTML responses directly
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    });

    // Handle errors during the proxy request
    proxyReq.on("error", (error) => {
      // Log and handle the proxy request error
      logError(error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Proxy Error");
    });

    // Pipe the client request to the proxy request
    req.pipe(proxyReq);

    // Handle errors on the client request
    req.on("error", (error) => {
      // Log and handle the client request error
      logError(error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Client Request Error");
    });
  });
}

module.exports = createServer;
