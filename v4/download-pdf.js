(function () {
  const btn = document.querySelector('.pdf-download-btn');
  if (!btn) return;
  const tooltip = btn.querySelector('.pdf-download-tooltip');
  const defaultTooltip = tooltip ? tooltip.textContent : '';
  const H2C_URL = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
  const JSPDF_URL = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  const PAGE_W = 1260;
  const PAGE_H = 738;
  // iOS Safari caps each canvas at ~16M pixels. 1260*738*2*2 = ~7.4M, safe.
  const SCALE = 2;
  let busy = false;
  let libsPromise = null;

  function setTooltip(text, state) {
    if (tooltip) tooltip.textContent = text;
    btn.classList.remove('pdf-download-btn-ok', 'pdf-download-btn-err');
    if (state) btn.classList.add('pdf-download-btn-' + state);
  }
  function resetTooltip() { setTooltip(defaultTooltip, null); }

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
      page.appendChild(hero);
      root.appendChild(page);
    }

    const urls = collectUrls();
    const htmls = await Promise.all(
      urls.map((u) => fetch(u, { cache: 'no-store' }).then((r) => {
        if (!r.ok) throw new Error('Fetch failed: ' + u);
        return r.text();
      }))
    );

    htmls.forEach((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // Fetched DOMs don't run nav.js, so their .slide-label / .slide-number
      // are empty. Populate them from PITCH_SLIDES before rendering.
      if (window.PITCH_FILL_SLIDE) window.PITCH_FILL_SLIDE(doc);
      const slide = doc.querySelector('.slide');
      if (!slide) return;
      const slideName = doc.body && doc.body.getAttribute('data-slide');
      const inlineStyles = Array.from(doc.head.querySelectorAll('style'));

      const page = document.createElement('div');
      page.className = 'pdf-page';
      if (slideName) page.setAttribute('data-slide', slideName);

      // Per-slide overrides are scoped to body[data-slide="..."]; rewrite to
      // [data-slide="..."] so they apply to our wrapper rather than <body>.
      inlineStyles.forEach((styleEl) => {
        const s = document.createElement('style');
        s.textContent = (styleEl.textContent || '').replace(/body\[data-slide=/g, '[data-slide=');
        page.appendChild(s);
      });

      page.appendChild(slide);
      root.appendChild(page);
    });

    document.body.appendChild(root);
    return root;
  }

  // html2canvas does not reliably honor CSS `filter` on raster <img> tags —
  // grayscale photos render in their original color and `brightness(0)
  // invert(1)` silhouettes render as the original colored logo. Bake any
  // computed filter into a same-origin data URL via the Canvas 2D `filter`
  // property, then clear the CSS filter so html2canvas just draws the
  // pre-processed bitmap.
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
        ctx.filter = f;
        ctx.drawImage(img, 0, 0);
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

  async function generate() {
    await loadLibs();
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }
    const html2canvas = window.html2canvas;
    const { jsPDF } = window.jspdf;

    const root = await buildContainer();
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

      pdf.save('intouch-pitch.pdf');
    } finally {
      root.remove();
    }
  }

  function trackDownloadClick() {
    try {
      if (window.pitchAnalytics && window.pitchAnalytics.trackAction) {
        window.pitchAnalytics.trackAction('pdf-download', '★ PDF · Download');
      }
    } catch (_) {}
  }

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    busy = true;
    btn.setAttribute('disabled', '');
    setTooltip('Building…', null);
    trackDownloadClick();
    try {
      await generate();
      setTooltip('Downloaded!', 'ok');
    } catch (err) {
      console.error('[pdf]', err);
      setTooltip('Failed', 'err');
    } finally {
      btn.removeAttribute('disabled');
      setTimeout(() => { resetTooltip(); busy = false; }, 1800);
    }
  });

  btn.addEventListener('contextmenu', (e) => { e.stopPropagation(); });
})();
