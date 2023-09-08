// ad.js
const readline = require('readline');
const createServer = require('./services/ad.server.js');
const { logError } = require('./services/ad.ERRSYS.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the target site URL you want to proxy: ', (inputUrl) => {
  // Check if the user input starts with "http://" or "https://"
  if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
    // If not, add "https://" automatically
    inputUrl = `https://${inputUrl}`;
  }

  const server = createServer(inputUrl);

  server.on('error', (error) => {
    // Log and handle server errors
    logError(error);
  });

  const port = 3000;
  server.listen(port, () => {
    console.log(`Proxy server is listening on port ${port}`);
    console.log(`Proxying requests to: ${inputUrl}`);
  });

  rl.close();
});
