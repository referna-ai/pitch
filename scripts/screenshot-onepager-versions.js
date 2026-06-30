const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
  const versions = process.argv.slice(2);
  if (versions.length === 0) versions.push('v4-deck-loyal', 'v5-cover-styled', 'v6-compact');
  for (const v of versions) {
    const page = await ctx.newPage();
    await page.goto(`http://localhost:8765/one-pager/${v}.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const pages = await page.$$('.page');
    for (let i = 0; i < pages.length; i++) {
      await pages[i].screenshot({ path: `/tmp/${v}-p${i+1}.png` });
      console.log(`saved /tmp/${v}-p${i+1}.png`);
    }
    await page.close();
  }
  await ctx.close();
  await browser.close();
})();
