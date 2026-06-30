const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 850, height: 1100 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8765/one-pager/v4-deck-loyal.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/v4-deck-loyal.png', fullPage: true });
  console.log('saved /tmp/v4-deck-loyal.png');
  await ctx.close();
  await browser.close();
})();
