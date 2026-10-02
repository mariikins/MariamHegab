(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wipe = document.querySelector('.wipe');

  // pink wipe between pages
  addEventListener('pageshow', () => wipe && wipe.classList.remove('in'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !wipe || reduce || a.target || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    wipe.classList.add('in');
    setTimeout(() => (location.href = a.href), 550);
  });
})();
