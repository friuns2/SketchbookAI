const { webkit } = require('playwright-webkit');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8846');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
