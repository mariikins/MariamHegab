// "Explore my work" button: hover and the button dissolves into black pixels
(() => {
  const a = document.querySelector('.explore');
  if (!a) return;
  const cv = a.querySelector('canvas'), ctx = cv.getContext('2d'), CELL = 8;
  let cols = 1, rows = 1, th = [], p = 0, target = 0, raf = 0, dpr = 1;

  function draw(anim) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#000';
    for (let i = 0; i < th.length; i++) {
      const d = p - th[i];
      let on = d > 0;
      if (anim) on = d > .09 ? true : d > -.09 ? Math.random() < .5 : false;   // cells near the front flicker
      if (on) ctx.fillRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL);
    }
  }
  function size() {
    const r = a.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    cols = Math.ceil(r.width / CELL); rows = Math.ceil(r.height / CELL);
    th = Array.from({ length: cols * rows }, () => Math.random());
    draw(false);
  }
  function step() {
    p += (target - p) * .13;
    const done = Math.abs(target - p) < .004;
    if (done) p = target;
    draw(!done);
    raf = done ? 0 : requestAnimationFrame(step);
  }
  const go = t => { target = t; if (!raf) raf = requestAnimationFrame(step); };

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ['pointerenter', 'focus', 'touchstart'].forEach(e => a.addEventListener(e, () => go(1), { passive: true }));
    ['pointerleave', 'blur'].forEach(e => a.addEventListener(e, () => go(0)));
    new ResizeObserver(size).observe(a);
  } else {
    a.addEventListener('pointerenter', () => { p = target = 1; draw(false); });
    a.addEventListener('pointerleave', () => { p = target = 0; draw(false); });
    size();
  }
})();
