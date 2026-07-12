// Single source of truth for the slide list. Tab strip, slide-label,
// slide-number, and nav derive from PITCH_SLIDES — never hardcode
// titles or numbers elsewhere.
(function () {
  const SLIDES = [
    { file: 'index.html',   title: 'Cover' },
    { file: 'slide-1.html', title: 'Our Values' },
    { file: 'slide-2.html', title: "Today's Agenda" },
    { file: 'slide-3.html', title: 'Customer Proof' },
    { file: 'slide-4.html', title: 'Introductions' },
    { file: 'slide-5.html', title: 'Perfecting Your Pitch' },
    { file: 'slide-6.html', title: 'Book Your 1:1' }
  ];
  window.PITCH_SLIDES = SLIDES;

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

// Scale slides to fit short viewports (e.g. 1366x768 laptops). Design height = 738px.
(function () {
  function applyScale() {
    const slide = document.querySelector('.slide, .slide-hero');
    if (!slide) return;
    const tooShort = window.innerHeight < 500;
    const scale = tooShort ? 1 : Math.min(1, (window.innerHeight - 90) / 738);
    slide.style.setProperty('--slide-scale', scale);
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

    const isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (isTouch) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('is-open');
      });
      document.addEventListener('click', (e) => {
        if (!nav.classList.contains('is-open')) return;
        if (nav.contains(e.target) || trigger.contains(e.target)) return;
        nav.classList.remove('is-open');
      });
    }
  }
  renderTabs();

  function go(delta) {
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

  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.code === 'Space' || e.key === 'PageDown') {
      e.preventDefault();
      forward();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'PageUp') {
      e.preventDefault();
      back();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.button !== 0) return;
    if (isInteractive(e.target)) return;
    if (hasSelection()) return;
    const targets = document.querySelectorAll(
      '.nav-indicator-next:not(.nav-indicator-disabled), .nav-arrow-right:not(.nav-arrow-disabled)'
    );
    targets.forEach((el) => {
      el.classList.remove('is-pulsing');
      void el.offsetWidth;
      el.classList.add('is-pulsing');
    });
  });

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
    if (idx < 0) { revealSlide(); return; }
    makeArrow('left', back, idx > 0);
    makeArrow('right', forward, idx < slideFiles.length - 1);
    makeIndicators(idx > 0, idx < slideFiles.length - 1);
    revealSlide();
  }

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
