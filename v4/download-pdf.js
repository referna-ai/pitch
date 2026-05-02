(function () {
  const btn = document.querySelector('.pdf-download-btn');
  if (!btn) return;
  const tooltip = btn.querySelector('.pdf-download-tooltip');
  const defaultTooltip = tooltip ? tooltip.textContent : '';
  const LIB_URL = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/dist/html2pdf.bundle.min.js';
  let busy = false;
  let libPromise = null;

  function setTooltip(text, state) {
    if (tooltip) tooltip.textContent = text;
    btn.classList.remove('pdf-download-btn-ok', 'pdf-download-btn-err');
    if (state) btn.classList.add('pdf-download-btn-' + state);
  }
  function resetTooltip() { setTooltip(defaultTooltip, null); }

  function loadLib() {
    if (window.html2pdf) return Promise.resolve(window.html2pdf);
    if (libPromise) return libPromise;
    libPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = LIB_URL;
      s.onload = () => resolve(window.html2pdf);
      s.onerror = () => { libPromise = null; reject(new Error('html2pdf load failed')); };
      document.head.appendChild(s);
    });
    return libPromise;
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
      const slide = doc.querySelector('.slide');
      if (!slide) return;
      // Some slides ship per-page <style> overrides scoped via body[data-slide="..."].
      // Re-attach those styles and apply the data-slide attribute on a wrapper so
      // the selectors still match inside the export root.
      const slideName = doc.body && doc.body.getAttribute('data-slide');
      const inlineStyles = Array.from(doc.head.querySelectorAll('style'));

      const page = document.createElement('div');
      page.className = 'pdf-page';
      if (slideName) page.setAttribute('data-slide', slideName);

      // Rewrite per-slide selectors from `body[data-slide="X"]` to `[data-slide="X"]`
      // so they apply to our wrapper rather than the page <body>.
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

  async function generate() {
    const html2pdf = await loadLib();
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }
    const root = await buildContainer();
    try {
      await html2pdf().set({
        margin: 0,
        filename: 'intouch-pitch.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          backgroundColor: '#0d0d0d',
          useCORS: true,
          logging: false,
          windowWidth: 1260
        },
        jsPDF: {
          unit: 'px',
          format: [1260, 738],
          orientation: 'landscape',
          hotfixes: ['px_scaling'],
          compress: true
        },
        pagebreak: { mode: ['css'], before: '.pdf-page', avoid: '.slide' }
      }).from(root).save();
    } finally {
      root.remove();
    }
  }

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    busy = true;
    btn.setAttribute('disabled', '');
    setTooltip('Building…', null);
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
