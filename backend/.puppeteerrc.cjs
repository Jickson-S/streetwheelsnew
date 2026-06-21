const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Directs Puppeteer to download the browser inside the backend folder.
  // This ensures the browser is packaged and deployed to Render.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
