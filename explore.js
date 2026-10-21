// "Explore my work": bold type that turns to pixels and disperses while you hover, before you click
(() => {
  const a = document.querySelector('.explore');
  if (!a || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = a.querySelector('canvas'), ctx = cv.getContext('2d'), span = a.querySelector('span');
  const PAD = 80;
  let dpr = 1, W = 0, H = 0, CELL = 4, fontPx = 40, P = [], I = 0, T = 0, raf = 0;
  let mx = -999, my = -999, smx = -999, smy = -999;

  function build() {
    const ar = a.getBoundingClientRect(), sr = span.getBoundingClientRect(), cs = getComputedStyle(span);
    fontPx = parseFloat(cs.fontSize); CELL = Math.max(3, Math.round(fontPx / 11));
    dpr = Math.min(2, devicePixelRatio || 1);
    W = ar.width + PAD * 2; H = ar.height + PAD * 2;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const m = document.createElement('canvas'); m.width = Math.ceil(W); m.height = Math.ceil(H);
    const c = m.getContext('2d', { willReadFrequently: true });
    c.font = `${cs.fontWeight} ${fontPx}px ${cs.fontFamily}`; c.fillStyle = '#000'; c.textBaseline = 'alphabetic';
    const txt = span.textContent, mt = c.measureText(txt);
    const asc = mt.fontBoundingBoxAscent ?? fontPx * .8, desc = mt.fontBoundingBoxDescent ?? fontPx * .2;
    c.fillText(txt, sr.left - ar.left + PAD, sr.top - ar.top + PAD + (sr.height - (asc + desc)) / 2 + asc);
    const data = c.getImageData(0, 0, m.width, m.height).data;
    P = [];
    for (let gy = 0; gy < m.height; gy += CELL) for (let gx = 0; gx < m.width; gx += CELL) {
      const px = Math.min(m.width - 1, gx + (CELL >> 1)), py = Math.min(m.height - 1, gy + (CELL >> 1));
      if (data[(py * m.width + px) * 4 + 3] > 70) {
        const ang = Math.random() * 6.283;
        P.push({ x: gx, y: gy, vx: Math.cos(ang), vy: Math.sin(ang) - .15, d: Math.random() < .82 ? 0 : .35 + Math.random() * .65, ph: Math.random() * 6.283 });
      }
    }
    draw();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#000';
    const e = I * I * (3 - 2 * I), t = performance.now() / 1000;
    for (const p of P) {
      let x = p.x + p.vx * p.d * fontPx * 1.1 * e + Math.sin(t * 2 + p.ph) * 2 * e * (p.d ? 1 : 0);
      let y = p.y + p.vy * p.d * fontPx * 1.1 * e + Math.cos(t * 2.3 + p.ph) * 2 * e * (p.d ? 1 : 0);
      const dx = x - smx, dy = y - smy, dist = Math.hypot(dx, dy);
      if (e > 0 && dist < 120) { const k = 1 - dist / 120, f = k * k * 70 * e / (dist || 1); x += dx * f; y += dy * f; }
      x = Math.round(x / CELL) * CELL; y = Math.round(y / CELL) * CELL;      // everything stays on the pixel grid
      ctx.globalAlpha = 1 - .35 * e * p.d;
      ctx.fillRect(x, y, CELL, CELL);
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    I += (T - I) * .12;
    if (Math.abs(T - I) < .003) I = T;
    smx += (mx - smx) * .2; smy += (my - smy) * .2;
    draw();
    if (I === 0 && T === 0) { a.classList.remove('on'); raf = 0; return; }
    raf = requestAnimationFrame(step);
  }
  const on = () => { T = 1; a.classList.add('on'); if (!raf) raf = requestAnimationFrame(step); };
  const off = () => { T = 0; mx = my = -999; if (!raf) raf = requestAnimationFrame(step); };

  a.addEventListener('pointerenter', on); a.addEventListener('focus', on);
  a.addEventListener('touchstart', on, { passive: true });
  a.addEventListener('pointerleave', off); a.addEventListener('blur', off);
  a.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (smx < -900) { smx = mx; smy = my; } }, { passive: true });

  let rt; const rebuild = () => { clearTimeout(rt); rt = setTimeout(build, 120); };
  new ResizeObserver(rebuild).observe(a);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(build);
})();
