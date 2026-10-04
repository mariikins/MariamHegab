// Pixel lens: hover any photo and an irregular cluster of pixel blocks follows your cursor.
// Click for a burst. Skips logos, phone frames and decorative cut-outs.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SKIP = '.home img, .nav img, .frame, .sticker, .cone, .cherry, .wm, .tilt, .game img';
  const ok = el => el && el.tagName === 'IMG' && !el.matches(SKIP) && el.naturalWidth > 0 && el.clientWidth > 80;

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:5';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d'), small = document.createElement('canvas'), sctx = small.getContext('2d');
  let dpr = 1;
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  };
  size(); addEventListener('resize', size);

  let mx = -999, my = -999, lx = 0, ly = 0, r = 0, pulse = 0, active = null, raf = 0, down = false;
  const LAYERS = [[1, 18], [.7, 10], [.42, 5]];   // [radius factor, block size]

  // an irregular cluster of rectangles (units of the lens radius), centered on the cursor
  const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
  const piece = () => ({ x: rnd(-1.1, .8), y: rnd(-.85, .6), w: rnd(.45, 1.2), h: rnd(.22, .75) });
  let shape = [], lastGlitch = 0;
  const roll = () => { shape = [{ x: -.65, y: -.45, w: 1.3, h: .9 }]; for (let i = 0; i < 5; i++) shape.push(piece()); };
  roll();

  function lens(img, rect, clip, R, k) {
    const cs = getComputedStyle(img), nw = img.naturalWidth, nh = img.naturalHeight, rw = rect.width, rh = rect.height;
    let sx = 0, sy = 0, sw = nw, sh = nh;
    if (cs.objectFit === 'cover') {
      const sc = Math.max(rw / nw, rh / nh); sw = rw / sc; sh = rh / sc;
      const pos = cs.objectPosition.split(' ').map(p => p.endsWith('%') ? parseFloat(p) / 100 : (p === 'left' || p === 'top') ? 0 : (p === 'right' || p === 'bottom') ? 1 : .5);
      sx = (nw - sw) * pos[0]; sy = (nh - sh) * (pos[1] ?? .5);
    }
    const kx = sw / rw, ky = sh / rh;
    ctx.save();
    ctx.beginPath(); ctx.rect(clip.left, clip.top, clip.width, clip.height); ctx.clip();
    LAYERS.forEach(([f, b0]) => {
      const rad = R * f, b = Math.round(b0 * k);
      if (rad < 3) return;
      const snap = (v, o) => o + Math.round((v - o) / b) * b;   // keep every edge on the pixel grid
      const rs = shape.map(p => {
        const x0 = snap(lx + p.x * rad, rect.left), y0 = snap(ly + p.y * rad, rect.top);
        const x1 = snap(lx + (p.x + p.w) * rad, rect.left), y1 = snap(ly + (p.y + p.h) * rad, rect.top);
        return [x0, y0, x1 - x0, y1 - y0];
      }).filter(q => q[2] > 0 && q[3] > 0);
      if (!rs.length) return;
      const minx = Math.min(...rs.map(q => q[0])), miny = Math.min(...rs.map(q => q[1]));
      const maxx = Math.max(...rs.map(q => q[0] + q[2])), maxy = Math.max(...rs.map(q => q[1] + q[3]));
      const w = maxx - minx, h = maxy - miny;
      small.width = Math.max(1, Math.round(w / b)); small.height = Math.max(1, Math.round(h / b));
      sctx.drawImage(img, sx + (minx - rect.left) * kx, sy + (miny - rect.top) * ky, w * kx, h * ky, 0, 0, small.width, small.height);
      ctx.save();
      ctx.beginPath(); rs.forEach(q => ctx.rect(q[0], q[1], q[2], q[3])); ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, minx, miny, w, h);
      ctx.restore();
    });
    ctx.restore();
  }

  function tick() {
    const el = document.elementFromPoint(mx, my), hit = ok(el) ? el : null;
    if (hit && hit !== active) { active = hit; lx = mx; ly = my; r = 0; roll(); }
    const now = performance.now();
    if (hit && now - lastGlitch > 220) { lastGlitch = now; shape[1 + (Math.random() * 5 | 0)] = piece(); }   // one block shifts every beat
    if (pulse > .95) roll();
    const want = hit ? 120 + Math.min(Math.hypot(mx - lx, my - ly) * .5, 45) + pulse * 110 : 0;
    r += (want - r) * (hit ? .22 : .3);
    lx += (mx - lx) * .26; ly += (my - ly) * .26;
    pulse *= .88;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (active && r > 2) {
      const rect = active.getBoundingClientRect(), box = active.closest('.im, .strip');
      let clip = rect;
      if (box) {
        const c = box.getBoundingClientRect();
        const L = Math.max(rect.left, c.left), T = Math.max(rect.top, c.top);
        clip = { left: L, top: T, width: Math.max(0, Math.min(rect.right, c.right) - L), height: Math.max(0, Math.min(rect.bottom, c.bottom) - T) };
      }
      lens(active, rect, clip, r, 1 + pulse * 1.4);
    } else if (!hit) active = null;

    raf = (hit || r > 2 || pulse > .02) ? requestAnimationFrame(tick) : 0;
  }
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };

  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; wake(); }, { passive: true });
  addEventListener('pointerdown', e => { mx = e.clientX; my = e.clientY; pulse = 1; down = true; wake(); }, { passive: true });
  addEventListener('scroll', wake, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -999; wake(); });
})();
