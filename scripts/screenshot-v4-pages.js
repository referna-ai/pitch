const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  // Render at actual 8.5in × 11in = 816 × 1056 px
  const ctx = await browser.newContext({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8765/one-pager/v4-deck-loyal.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // Capture each .page individually
  const pages = await page.$$('.page');
  for (let i = 0; i < pages.length; i++) {
    await pages[i].screenshot({ path: `/tmp/v4-page-${i+1}.png` });
    console.log(`saved /tmp/v4-page-${i+1}.png`);
  }
  await ctx.close();
  await browser.close();
})();
