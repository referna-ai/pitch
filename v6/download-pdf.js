(function () {
  const btn = document.querySelector('.pdf-download-btn');
  if (!btn) return;
  const tooltip = btn.querySelector('.pdf-download-tooltip');
  const defaultTooltip = tooltip ? tooltip.textContent : '';
  const H2C_URL = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
  const JSPDF_URL = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  const PAGE_W = 1260;
  const PAGE_H = 738;
  const SCALE = 2;
  let busy = false;
  let libsPromise = null;

  // ── Long-press threshold to trigger fresh generation ──────────────────
  const LONG_PRESS_MS = 900;
  let pressTimer = null;
  let hintTimer = null;
  let longPressTriggered = false;

  function setTooltip(text, state) {
    if (tooltip) tooltip.textContent = text;
    btn.classList.remove('pdf-download-btn-ok', 'pdf-download-btn-err');
    if (state) btn.classList.add('pdf-download-btn-' + state);
  }
  function resetTooltip() { setTooltip(defaultTooltip, null); }

  function trackDownloadClick() {
    try {
      if (window.pitchAnalytics && window.pitchAnalytics.trackAction) {
        window.pitchAnalytics.trackAction('pdf-download', '★ PDF · Download');
      }
    } catch (_) {}
  }

  // ── Static PDF download (default) ─────────────────────────────────────
  function downloadStatic() {
    trackDownloadClick();
    const a = document.createElement('a');
    a.href = 'referna-pitch.pdf';
    a.download = 'referna-pitch.pdf';
    a.click();
    setTooltip('Downloading!', 'ok');
    setTimeout(resetTooltip, 1800);
  }

  // ── Dynamic generation (long-press) ───────────────────────────────────
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Script load failed: ' + src));
      document.head.appendChild(s);
    });
  }
  function loadLibs() {
    if (libsPromise) return libsPromise;
    libsPromise = (async () => {
      if (!window.html2canvas) await loadScript(H2C_URL);
      if (!(window.jspdf && window.jspdf.jsPDF)) await loadScript(JSPDF_URL);
    })();
    return libsPromise;
  }

  function collectUrls() {
    const tabs = document.querySelectorAll('.deck-tabs .deck-tab');
    const urls = [];
    tabs.forEach((a) => {
      const href = a.getAttribute('href');
      if (href && href !== 'index.html') urls.push(href);
    });
    return urls;
  }

  function heroNode() {
    const hero = document.querySelector('.slide-hero');
    if (!hero) return null;
    const clone = hero.cloneNode(true);
    clone.querySelectorAll('.deck-nav, .archive-links, .copy-html-btn, .pdf-download-btn').forEach((n) => n.remove());
    return clone;
  }

  async function buildContainer() {
    const root = document.createElement('div');
    root.className = 'pdf-export-root';

    const hero = heroNode();
    if (hero) {
      const page = document.createElement('div');
      page.className = 'pdf-page';
      page.style.width = PAGE_W + 'px';
      page.appendChild(hero);
      root.appendChild(page);
    }

    const urls = collectUrls();
    const results = await Promise.allSettled(
      urls.map((u) => fetch(u, { cache: 'no-store' }).then((r) => {
        if (!r.ok) throw new Error('Fetch failed: ' + u);
        return r.text();
      }))
    );
    const htmls = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);

    htmls.forEach((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      if (window.PITCH_FILL_SLIDE) window.PITCH_FILL_SLIDE(doc);
      const slide = doc.querySelector('.slide');
      if (!slide) return;
      slide.classList.add('scaled');
      slide.style.setProperty('--slide-scale', '1');
      const slideName = doc.body && doc.body.getAttribute('data-slide');
      const inlineStyles = Array.from(doc.head.querySelectorAll('style'));

      const page = document.createElement('div');
      page.className = 'pdf-page';
      page.style.width = PAGE_W + 'px';
      if (slideName) page.setAttribute('data-slide', slideName);

      inlineStyles.forEach((styleEl) => {
        const s = document.createElement('style');
        s.textContent = (styleEl.textContent || '').replace(/body\[data-slide=/g, '[data-slide=');
        page.appendChild(s);
      });

      const pdfRenderStyle = document.createElement('style');
      pdfRenderStyle.textContent = [
        '*, *::before, *::after { animation: none !important; transition: none !important; }',
        '.story-line { opacity: 1 !important; transform: translateY(0) !important; }',
        '.s9-reveal-item { opacity: 1 !important; }',
        '.s9-apply-inner { zoom: unset !important; transform: scale(0.79); transform-origin: top left; }',
        '[data-slide="slide-8"] .s9-visual { clip-path: none !important; overflow: hidden !important; }',
        '[data-slide="slide-tech"] .slide-label { margin-bottom: 4px !important; }',
        '[data-slide="slide-tech"] .slide-subtitle { font-size: 14px !important; margin-bottom: 0 !important; }',
        '[data-slide="slide-tech"] .tw-chart { margin-top: -10px !important; }',
        '[data-slide="slide-tech"] .tw-chart svg { height: 360px !important; }',
        '[data-slide="slide-tech"] .tw-comparison { margin-top: 4px !important; }',
        '.conclusion { z-index: 50 !important; }',
        '.sources    { z-index: 50 !important; }',
        '[data-slide="slide-8"] .s9-browser-wrap { left: 0 !important; }',
        '[data-slide="slide-8"] .s9-text-col { overflow: hidden !important; gap: 16px !important; }',
        // slide-8: bullets at 22px with 4-line br-separated bullet overflow the column.
        // Reduce font, tighten line-height and padding to fit all three bullets.
        '[data-slide="slide-8"] .s9-pillar-title { font-size: 26px !important; margin-bottom: 14px !important; }',
        '[data-slide="slide-8"] .s9-pillar-bullets li { font-size: 17px !important; line-height: 1.35 !important; padding: 10px 0 10px 28px !important; }',
        '[data-slide="slide-8"] .s9-pillar-bullets li:first-child { padding-top: 0 !important; }',
        '[data-slide="slide-9"] .t-desk-inner  { zoom: unset !important; transform: scale(0.95); transform-origin: top left; }',
        '[data-slide="slide-9"] .t-email-inner { zoom: unset !important; transform: scale(0.82); transform-origin: top left; }',
        '[data-slide="slide-9"] .t-phone-inner { zoom: unset !important; transform: scale(0.90); transform-origin: top left; }',
        '[data-slide="slide-9"] .t-cols { clip-path: none !important; overflow: hidden !important; }',
        '[data-slide="slide-12"] .team-bullet { font-size: 14px !important; line-height: 1.4 !important; }',
        '[data-slide="slide-12"] .team-bullets { gap: 8px !important; }',
        '[data-slide="slide-12"] .team-role { margin-bottom: 12px !important; }',
      ].join('\n');
      page.appendChild(pdfRenderStyle);

      const skipFooter = new Set(['slide-1', 'slide-14']);
      if (!skipFooter.has(slideName)) {
        const brandFooter = document.createElement('div');
        brandFooter.className = 'slide-brand-footer';
        brandFooter.innerHTML = '<img class="sbf-logo" src="logos/lockup-white-on-black.svg" alt="Referna"> · Referral network for independent professionals';
        slide.appendChild(brandFooter);
      }

      page.appendChild(slide);
      root.appendChild(page);
    });

    document.body.appendChild(root);
    return root;
  }

  async function bakeFilteredImages(root) {
    const imgs = Array.from(root.querySelectorAll('img'));
    await Promise.all(imgs.map(async (img) => {
      const f = (getComputedStyle(img).filter || '').toString().trim();
      if (!f || f === 'none') return;
      if (!img.complete || !img.naturalWidth) {
        await new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
      }
      if (!img.naturalWidth) return;
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const isGrayscale = /grayscale\(\s*(?:100%|1(?:\.\d+)?)\s*\)/.test(f);
        const isBrightZeroInvert = /brightness\(\s*0%?\s*\)/.test(f) &&
          /invert\(\s*(?:100%|1(?:\.\d+)?)\s*\)/.test(f);
        if (isGrayscale || isBrightZeroInvert) {
          const id = ctx.getImageData(0, 0, c.width, c.height);
          const d = id.data;
          if (isGrayscale) {
            for (let i = 0; i < d.length; i += 4) {
              const g = Math.round(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
              d[i] = d[i + 1] = d[i + 2] = g;
            }
          } else {
            for (let i = 0; i < d.length; i += 4) {
              if (d[i + 3] > 0) { d[i] = d[i + 1] = d[i + 2] = 255; }
            }
          }
          ctx.putImageData(id, 0, 0);
        } else {
          ctx.clearRect(0, 0, c.width, c.height);
          try { ctx.filter = f; } catch (_) {}
          ctx.drawImage(img, 0, 0);
        }
        const dataUrl = c.toDataURL('image/png');
        await new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
          img.src = dataUrl;
        });
        img.style.filter = 'none';
      } catch (e) {
        console.warn('[pdf] filter bake failed for', img.src, e);
      }
    }));
  }

  async function bakeExternalImages(root) {
    const items = [];
    root.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/^https?:\/\//.test(src) ||
          (/\.svg(?:[?#]|$)/i.test(src) && !src.startsWith('data:'))) {
        items.push({ el: img, attr: 'src', url: src });
      }
    });
    root.querySelectorAll('image').forEach((img) => {
      const href = img.getAttribute('href') ||
        img.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
      if (href && !href.startsWith('data:')) items.push({ el: img, attr: 'href', url: href });
    });
    await Promise.allSettled(items.map(async ({ el, attr, url }) => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) return;
        const blob = await resp.blob();
        const isSvg = /^image\/svg/i.test(blob.type) || /\.svg(?:[?#]|$)/i.test(url);
        if (isSvg) {
          const blobUrl = URL.createObjectURL(blob);
          const dataUrl = await new Promise((res, rej) => {
            const tmp = new Image();
            tmp.onload = () => {
              const w = tmp.naturalWidth || (el.offsetWidth || 300) * 2;
              const h = tmp.naturalHeight ||
                (tmp.naturalWidth ? 0 : (el.offsetHeight || 75) * 2);
              const aspect = (tmp.naturalWidth && tmp.naturalHeight)
                ? tmp.naturalHeight / tmp.naturalWidth : null;
              const ch = aspect ? Math.round(w * aspect) : (h || Math.round(w / 4));
              const c = document.createElement('canvas');
              c.width = w; c.height = ch;
              c.getContext('2d').drawImage(tmp, 0, 0, w, ch);
              URL.revokeObjectURL(blobUrl);
              res(c.toDataURL('image/png'));
            };
            tmp.onerror = () => { URL.revokeObjectURL(blobUrl); rej(new Error('SVG load failed')); };
            tmp.src = blobUrl;
          });
          el.setAttribute(attr, dataUrl);
        } else {
          const dataUrl = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          });
          el.setAttribute(attr, dataUrl);
        }
      } catch (_) {}
    }));
  }

  async function generate() {
    await loadLibs();
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }
    const html2canvas = window.html2canvas;
    const { jsPDF } = window.jspdf;

    const root = await buildContainer();
    await bakeExternalImages(root);
    await bakeFilteredImages(root);
    try {
      const pages = Array.from(root.querySelectorAll('.pdf-page'));
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [PAGE_W, PAGE_H],
        hotfixes: ['px_scaling'],
        compress: true
      });

      for (let i = 0; i < pages.length; i++) {
        setTooltip('Page ' + (i + 1) + '/' + pages.length + '…', null);
        const canvas = await html2canvas(pages[i], {
          scale: SCALE,
          backgroundColor: '#0d0d0d',
          useCORS: true,
          logging: false,
          width: PAGE_W,
          height: PAGE_H,
          windowWidth: PAGE_W,
          windowHeight: PAGE_H
        });
        const img = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage([PAGE_W, PAGE_H], 'landscape');
        pdf.addImage(img, 'JPEG', 0, 0, PAGE_W, PAGE_H);
      }

      pdf.save('referna-pitch.pdf');
    } finally {
      root.remove();
    }
  }

  // ── Input handlers ─────────────────────────────────────────────────────
  function cancelPress() {
    clearTimeout(pressTimer);
    clearTimeout(hintTimer);
    pressTimer = null;
    hintTimer = null;
  }

  function startPress() {
    if (busy) return;
    longPressTriggered = false;
    hintTimer = setTimeout(() => setTooltip('Keep holding…', null), 400);
    pressTimer = setTimeout(async () => {
      longPressTriggered = true;
      cancelPress();
      busy = true;
      btn.setAttribute('disabled', '');
      setTooltip('Building…', null);
      try {
        await generate();
        setTooltip('Generated!', 'ok');
      } catch (err) {
        console.error('[pdf]', err);
        setTooltip('Failed', 'err');
      } finally {
        btn.removeAttribute('disabled');
        setTimeout(() => { resetTooltip(); busy = false; }, 1800);
      }
    }, LONG_PRESS_MS);
  }

  function endPress() {
    if (longPressTriggered) return;
    const wasHolding = !!pressTimer;
    cancelPress();
    if (wasHolding) downloadStatic();
    if (tooltip && tooltip.textContent === 'Keep holding…') resetTooltip();
  }

  btn.addEventListener('mousedown',  (e) => { if (e.button === 0) startPress(); });
  btn.addEventListener('mouseup',    endPress);
  btn.addEventListener('mouseleave', cancelPress);
  btn.addEventListener('touchstart', startPress, { passive: true });
  btn.addEventListener('touchend',   endPress);
  btn.addEventListener('touchcancel', cancelPress);

  // Prevent the synthetic click after touchend from double-firing
  btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  btn.addEventListener('contextmenu', (e) => { e.stopPropagation(); });
})();
