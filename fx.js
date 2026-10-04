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

  // images unmask as they scroll into view
  const rv = [...document.querySelectorAll('.rv')];
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .12 });
    rv.forEach(el => io.observe(el));
  }
  if (reduce) return;

  // split big type into letters
  document.querySelectorAll('[data-split]').forEach(el => {
    const words = el.textContent.split(' ');
    el.textContent = '';
    words.forEach((w, i) => {
      const ws = document.createElement('span');
      ws.className = 'w';
      [...w].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = c; ws.appendChild(s);
      });
      el.appendChild(ws);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  // letters scatter away from the cursor
  if (matchMedia('(hover: hover)').matches) {
    const chars = [...document.querySelectorAll('.ch')];
    let mx = -999, my = -999, queued = false;
    const run = () => {
      queued = false;
      chars.forEach(c => {
        const r = c.getBoundingClientRect();
        const dx = r.left + r.width / 2 - mx, dy = r.top + r.height / 2 - my;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 150) {
          const f = 1 - d / 150;
          c.style.transform = `translate(${dx / d * f * 46}px,${dy / d * f * 46}px) rotate(${dx / d * f * 14}deg)`;
        } else if (c.style.transform) c.style.transform = '';
      });
    };
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(run); }
    });
  }

  // paragraph lights up word by word as you scroll
  const blocks = [...document.querySelectorAll('[data-words]')];
  blocks.forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(w => {
      const s = document.createElement('span');
      s.className = 'wd'; s.textContent = w;
      el.appendChild(s); el.appendChild(document.createTextNode(' '));
    });
  });
  const light = () => blocks.forEach(el => {
    const p = Math.min(1, Math.max(0, (innerHeight * .75 - el.getBoundingClientRect().top) / (innerHeight * .5)));
    const ws = [...el.children], k = p * ws.length * 1.1;
    ws.forEach((w, i) => w.classList.toggle('on', i < k));
  });
  addEventListener('scroll', light, { passive: true });
  addEventListener('resize', light);
  light();
})();
