// ad.proxy.js
const httpProxy = require('http-proxy');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

module.exports = proxy;
