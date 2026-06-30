const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const url = process.argv[2] || 'http://localhost:8765/one-pager/index.html';
  const outPath = process.argv[3] || path.join(__dirname, '..', 'one-pager', 'referna-one-pager.pdf');

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: outPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });
  console.log(`saved ${outPath}`);
  await browser.close();
})();
