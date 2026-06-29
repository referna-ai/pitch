const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const pages = [
    ['v1-brief.html', 'v1-brief', { width: 850, height: 1100 }],
    ['v2-narrative.html', 'v2-narrative-p1', { width: 850, height: 1100 }],
    ['v3-tearsheet.html', 'v3-tearsheet-p1', { width: 850, height: 1100 }],
  ];
  for (const [path, name, viewport] of pages) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:8765/one-pager/${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `/tmp/${name}.png`, fullPage: true });
    console.log(`saved /tmp/${name}.png`);
    await ctx.close();
  }
  await browser.close();
})();
