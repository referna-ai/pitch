// Single source of truth for the slide list. Tab strip, slide-label,
// slide-number, analytics.js, copy-deck.js, and download-pdf.js all
// derive from PITCH_SLIDES — never hardcode titles or numbers elsewhere.
(function () {
  const SLIDES = [
    { file: 'index.html',    title: 'Overview' },
    { file: 'slide-1.html',  title: 'Executive summary' },
    { file: 'slide-2.html',  title: 'Customer' },
    { file: 'slide-3.html',  title: 'Solution' },
    { file: 'slide-4.html',  title: 'Product 1' },
    { file: 'slide-5.html',  title: 'Product 2' },
    { file: 'slide-6.html',  title: 'Precedent' },
    { file: 'slide-7.html',  title: 'Smoke Test' },
    { file: 'slide-8.html',  title: 'Market' },
    { file: 'slide-9.html',  title: 'Traction' },
    { file: 'slide-10.html', title: 'Team' },
    { file: 'slide-11.html', title: 'Round' },
    { file: 'slide-12.html', title: 'Opportunity' }
  ];
  window.PITCH_SLIDES = SLIDES;

  // Populates .slide-label and .slide-number from the body's data-slide.
  // scope defaults to the live document; pass a parsed DOMParser doc for
  // fetched-slide flows (copy-deck.js, download-pdf.js).
  window.PITCH_FILL_SLIDE = function (scope) {
    const root = scope || document;
    const body = root.body || (root.querySelector && root.querySelector('body'));
    const ds = body && body.dataset && body.dataset.slide;
    if (!ds) return;
    const file = ds + '.html';
    const idx = SLIDES.findIndex(function (s) { return s.file === file; });
    if (idx <= 0) return;
    const total = SLIDES.length - 1;
    const num = String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    const labelEl = root.querySelector('.slide-label');
    const numberEl = root.querySelector('.slide-number');
    if (labelEl) labelEl.textContent = SLIDES[idx].title;
    if (numberEl) numberEl.textContent = num;
  };

  window.PITCH_FILL_SLIDE(document);
})();

// Auto-load analytics so every slide is covered without touching individual HTML files
(function () { var s = document.createElement('script'); s.src = 'analytics.js'; document.head.appendChild(s); })();

// Scale slides to fit short viewports (e.g. 1366x768 laptops). Design height = 738px.
// .slide and .slide-hero are visibility:hidden until we add .scaled, so we
// never flash an unscaled frame.
// applyScale is NOT called here — it is called at the end of init() so the slide
// only becomes visible after nav-indicators are already in the DOM, preventing
// the layout-shift that would otherwise occur when indicators are inserted post-render.
(function () {
  function applyScale() {
    const slide = document.querySelector('.slide, .slide-hero');
    if (!slide) return;
    // Very short viewports (e.g. iPhone landscape ~390px tall) would scale to
    // ~0.4 — too aggressive. CSS drops the fixed slide height in that regime;
    // skip the transform here and let the page scroll naturally.
    const tooShort = window.innerHeight < 500;
    const scale = tooShort ? 1 : Math.min(1, (window.innerHeight - 90) / 738);
    slide.style.setProperty('--slide-scale', scale);
    // Force a reflow so the transform is fully computed before we flip
    // visibility from hidden to visible — prevents a one-frame size flash.
    void slide.offsetHeight;
    slide.classList.add('scaled');
  }
  window.PITCH_APPLY_SCALE = applyScale;
  window.addEventListener('resize', applyScale);
})();

(function () {
  const slides = window.PITCH_SLIDES;
  const slideFiles = slides.map((s) => s.file);

  function detectCurrent() {
    const ds = document.body && document.body.dataset && document.body.dataset.slide;
    if (ds) {
      const byData = ds + '.html';
      if (slideFiles.indexOf(byData) !== -1) return byData;
      // Out-of-deck page (e.g. backup slide). Returning null leaves idx = -1
      // so prev/next/click-to-advance handlers no-op; tab strip still renders.
      return null;
    }
    const path = location.pathname.toLowerCase();
    for (let i = 0; i < slideFiles.length; i++) {
      if (path.endsWith('/' + slideFiles[i]) || path.endsWith(slideFiles[i])) return slideFiles[i];
    }
    if (path === '' || path === '/' || path.endsWith('/')) return 'index.html';
    return 'index.html';
  }
  const current = detectCurrent();
  const idx = slideFiles.indexOf(current);
  const isBackup = !!(document.body && document.body.dataset && document.body.dataset.slide === 'slide-backup');

  function renderTabs() {
    document.querySelectorAll('.deck-tabs, .deck-tabs-trigger').forEach((n) => n.remove());

    const trigger = document.createElement('div');
    trigger.className = 'deck-tabs-trigger';
    trigger.setAttribute('aria-hidden', 'true');

    const nav = document.createElement('nav');
    nav.className = 'deck-tabs';
    slides.forEach((s) => {
      const a = document.createElement('a');
      a.href = s.file;
      a.className = 'deck-tab' + (s.file === current ? ' active' : '');
      a.textContent = s.title;
      nav.appendChild(a);
    });

    const first = document.body.firstChild;
    document.body.insertBefore(trigger, first);
    document.body.insertBefore(nav, first);

    // Touch devices: tap the top edge to open/close the tab strip
    // (hover is unreliable on iPad/iOS).
    const isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (isTouch) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('is-open');
      });
      // Tapping outside the strip closes it
      document.addEventListener('click', (e) => {
        if (!nav.classList.contains('is-open')) return;
        if (nav.contains(e.target) || trigger.contains(e.target)) return;
        nav.classList.remove('is-open');
      });
      // Closing after navigation happens automatically on page change
    }
  }
  renderTabs();

  function go(delta) {
    if (isBackup) {
      location.href = delta < 0 ? 'slide-8.html' : 'slide-9.html';
      return;
    }
    if (idx < 0) return;
    const next = idx + delta;
    if (next < 0 || next >= slideFiles.length) return;
    location.href = slideFiles[next];
  }
  const forward = () => go(1);
  const back = () => go(-1);

  function isInteractive(el) {
    return !!(el && el.closest && el.closest('a, button, input, textarea, select, label, [data-nav-ignore]'));
  }
  function hasSelection() {
    const sel = window.getSelection && window.getSelection();
    return !!(sel && sel.toString && sel.toString().length > 0);
  }

  // Keyboard: right/space → forward; left/backspace/delete → back
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.code === 'Space' || e.key === 'PageDown') {
      e.preventDefault();
      forward();
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'PageUp') {
      e.preventDefault();
      back();
    }
  });

  // Left click on the slide pulses the next-indicator and the right edge
  // arrow so viewers notice the affordances — click no longer advances.
  // Skip when the user is interacting with a real control or selecting text.
  document.addEventListener('click', (e) => {
    if (e.button !== 0) return;
    if (isInteractive(e.target)) return;
    if (hasSelection()) return;
    const targets = document.querySelectorAll(
      '.nav-indicator-next:not(.nav-indicator-disabled), .nav-arrow-right:not(.nav-arrow-disabled)'
    );
    targets.forEach((el) => {
      el.classList.remove('is-pulsing');
      // Force reflow so the animation restarts on rapid clicks.
      void el.offsetWidth;
      el.classList.add('is-pulsing');
    });
  });

  // Touch: swipe left → forward, swipe right → back
  let tsX = null, tsY = null, tsT = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { tsX = null; return; }
    tsX = e.touches[0].clientX;
    tsY = e.touches[0].clientY;
    tsT = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (tsX === null) return;
    const dx = e.changedTouches[0].clientX - tsX;
    const dy = e.changedTouches[0].clientY - tsY;
    const dt = Date.now() - tsT;
    tsX = null;
    if (dt > 800) return;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) forward();
    else back();
  }, { passive: true });

  // Scroll wheel at edges: down → forward, up → back
  let wheelLock = false;
  document.addEventListener('wheel', (e) => {
    if (wheelLock) return;
    const doc = document.documentElement;
    const atTop = window.scrollY <= 2;
    const atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
    const threshold = 24;
    if (e.deltaY > threshold && atBottom) {
      wheelLock = true;
      setTimeout(() => { wheelLock = false; }, 900);
      forward();
    } else if (e.deltaY < -threshold && atTop) {
      wheelLock = true;
      setTimeout(() => { wheelLock = false; }, 900);
      back();
    }
  }, { passive: true });

  // Edge hover arrows
  function makeArrow(side, handler, canGo) {
    const btn = document.createElement('button');
    btn.className = 'nav-arrow nav-arrow-' + side + (canGo ? '' : ' nav-arrow-disabled');
    btn.setAttribute('aria-label', side === 'left' ? 'Previous slide' : 'Next slide');
    btn.setAttribute('data-nav-ignore', '');
    btn.innerHTML = side === 'left'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (canGo) handler();
    });
    document.body.appendChild(btn);
  }

  // Bottom prev/next chips, sitting just under the slide frame.
  function makeIndicators(canBack, canForward) {
    const slide = document.querySelector('.slide, .slide-hero');
    if (!slide || !slide.parentNode) return;
    const wrap = document.createElement('div');
    wrap.className = 'nav-indicators';
    wrap.setAttribute('data-nav-ignore', '');

    function chip(side, label, canGo, handler) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-indicator nav-indicator-' + side + (canGo ? '' : ' nav-indicator-disabled');
      btn.setAttribute('aria-label', side === 'prev' ? 'Previous slide' : 'Next slide');
      btn.setAttribute('data-nav-ignore', '');
      const arrow = side === 'prev'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      btn.innerHTML = side === 'prev'
        ? arrow + '<span>' + label + '</span>'
        : '<span>' + label + '</span>' + arrow;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (canGo) handler();
      });
      return btn;
    }

    wrap.appendChild(chip('prev', 'Prev', canBack, back));
    wrap.appendChild(chip('next', 'Next', canForward, forward));
    slide.parentNode.insertBefore(wrap, slide.nextSibling);
  }

  function init() {
    if (isBackup) {
      makeArrow('left', back, true);
      makeArrow('right', forward, true);
      makeIndicators(true, true);
      revealSlide();
      return;
    }
    if (idx < 0) { revealSlide(); return; }
    makeArrow('left', back, idx > 0);
    makeArrow('right', forward, idx < slideFiles.length - 1);
    makeIndicators(idx > 0, idx < slideFiles.length - 1);
    revealSlide();
  }

  // Defer the scale+reveal until fonts are ready so there's no FOUT-caused
  // layout shift. A 100ms timeout fires first if fonts take longer than that.
  function revealSlide() {
    var done = false;
    function go() {
      if (done) return;
      done = true;
      window.PITCH_APPLY_SCALE && window.PITCH_APPLY_SCALE();
    }
    setTimeout(go, 100);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
