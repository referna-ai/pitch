#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const { jsPDF }    = require('jspdf');
const { spawn }    = require('child_process');
const { writeFileSync } = require('fs');
const { resolve }  = require('path');

const PAGE_W = 1260;
const PAGE_H = 738;
const PORT   = 3737;
const BASE   = `http://localhost:${PORT}`;
const OUTPUT = resolve(__dirname, '../v6/referna-pitch.pdf');

// Must match PITCH_SLIDES order in nav.js (index.html excluded — handled as first entry here)
const SLIDES = [
  'v6/index.html',
  'v6/slide-1.html',
  'v6/slide-2.html',
  'v6/slide-3.html',
  'v6/slide-4.html',
  'v6/slide-tech.html',
  'v6/slide-5.html',
  'v6/slide-6.html',
  'v6/slide-7.html',
  'v6/slide-8.html',
  'v6/slide-9.html',
  'v6/slide-11.html',
  'v6/slide-10.html',
  'v6/slide-12.html',
  'v6/slide-13.html',
  'v6/slide-14.html',
];

async function waitForServer(url, timeoutMs = 12_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { const r = await fetch(url); if (r.ok || r.status === 304) return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
}

async function main() {
  const server = spawn('npx', ['serve', '.', '-l', String(PORT)], { stdio: 'ignore' });

  try {
    await waitForServer(`${BASE}/v6/index.html`);

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: PAGE_W, height: PAGE_H },
      deviceScaleFactor: 2,  // 2× pixel density → sharp output
    });
    const page = await context.newPage();

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [PAGE_W, PAGE_H],
      hotfixes: ['px_scaling'],
      compress: true,
    });

    for (let i = 0; i < SLIDES.length; i++) {
      process.stdout.write(`[${i + 1}/${SLIDES.length}] ${SLIDES[i]} … `);
      await page.goto(`${BASE}/${SLIDES[i]}`, { waitUntil: 'networkidle' });

      // nav.js sets visibility:hidden until fonts ready + scale applied; wait for .scaled
      await page.waitForSelector('.slide.scaled, .slide-hero.scaled', { timeout: 6000 })
        .catch(() => process.stdout.write('(no .scaled — continuing) '));

      const buf  = await page.screenshot({
        type: 'jpeg', quality: 92,
        clip: { x: 0, y: 0, width: PAGE_W, height: PAGE_H },
      });
      const data = 'data:image/jpeg;base64,' + buf.toString('base64');

      if (i > 0) pdf.addPage([PAGE_W, PAGE_H], 'landscape');
      pdf.addImage(data, 'JPEG', 0, 0, PAGE_W, PAGE_H);
      process.stdout.write('✓\n');
    }

    await browser.close();

    const out = Buffer.from(pdf.output('arraybuffer'));
    writeFileSync(OUTPUT, out);
    console.log(`\nPDF → ${OUTPUT}  (${(out.length / 1024 / 1024).toFixed(1)} MB)`);
  } finally {
    server.kill();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
