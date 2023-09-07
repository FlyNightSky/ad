const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

// Create an HTTP server that will act as a proxy server
const proxyServer = http.createServer((req, res) => {
  // Define the target URL to proxy
  const targetURL = 'https://www.youtube.com/'; // Replace with the URL you want to proxy

  // Forward the request to the target URL
  proxy.web(req, res, { target: targetURL });

  // Log the request
  console.log(`Proxying request to ${targetURL}`);
});

// Listen on a specific port (e.g., 8080)
const port = 8080;
proxyServer.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});

// Handle errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Proxy error.');
});
