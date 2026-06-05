(function () {
  const btn = document.querySelector('.pdf-download-btn');
  if (!btn) return;
  const tooltip = btn.querySelector('.pdf-download-tooltip');
  const defaultTooltip = tooltip ? tooltip.textContent : '';

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

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    trackDownloadClick();
    const a = document.createElement('a');
    a.href = 'referna-pitch.pdf';
    a.download = 'referna-pitch.pdf';
    a.click();
    setTooltip('Downloading!', 'ok');
    setTimeout(resetTooltip, 1800);
  });

  btn.addEventListener('contextmenu', (e) => { e.stopPropagation(); });
})();
