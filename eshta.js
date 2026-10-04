(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // click a swatch to copy its hex
  document.querySelectorAll('.sw button').forEach(b => b.addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.hex);
    const s = b.querySelector('span'), t = b.dataset.hex;
    s.textContent = 'Copied'; setTimeout(() => (s.textContent = t), 1200);
  }));

  // cherries stuck to the screen: scattered at random, they stay put as you scroll
  const stickers = [], count = innerWidth < 700 ? 3 : 6;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('img');
    el.src = 'assets/eshta/eshta-cherry.webp'; el.alt = ''; el.className = 'sticker';
    const o = { el, r: Math.random() * 360, sp: (Math.random() - .5) * .08, spin: (Math.random() - .5) * .12 };
    el.style.cssText = `left:${4 + Math.random() * 88}vw;top:${8 + Math.random() * 80}vh;width:${3 + Math.random() * 3.5}rem;animation-delay:${1.4 + i * .15}s;transform:rotate(${o.r}deg)`;
    document.body.appendChild(el); stickers.push(o);
  }
  if (reduce) return;
  addEventListener('scroll', () => stickers.forEach(o => {
    o.el.style.transform = `translateY(${scrollY * o.sp}px) rotate(${o.r + scrollY * o.spin}deg)`;
  }), { passive: true });

  // cone drifts slower than the page
  const cone = document.querySelector('.cone');
  addEventListener('scroll', () => {
    cone.style.transform = `translateY(${Math.min(scrollY, innerHeight * 1.2) * .25}px)`;
  }, { passive: true });

  // posters tilt toward the cursor
  document.querySelectorAll('.tilt').forEach(tilt => {
    tilt.addEventListener('mousemove', e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    tilt.addEventListener('mouseleave', () => (tilt.style.transform = ''));
  });

  // the cherry drops in, bounces, and can be grabbed and thrown
  const c = document.getElementById('cherry'), hero = document.querySelector('.hero');
  let x = 0, y = 0, vx = 0, vy = 0, drag = false, sx = 0, sy = 0, raf = 0;
  const lim = () => ({ x0: -c.offsetLeft, x1: hero.clientWidth - c.offsetLeft - c.offsetWidth,
                       y0: -c.offsetTop, y1: hero.clientHeight - c.offsetTop - c.offsetHeight });
  const draw = () => (c.style.transform = `translate(${x}px,${y}px) rotate(${x * .3}deg)`);
  const step = () => {
    if (drag) return;
    const L = lim();
    vy += .7; x += vx; y += vy; vx *= .99;
    if (x < L.x0) { x = L.x0; vx *= -.6; } if (x > L.x1) { x = L.x1; vx *= -.6; }
    if (y > L.y1) { y = L.y1; vy *= -.55; if (Math.abs(vy) < 1.5) vy = 0; }
    if (y < L.y0) { y = L.y0; vy *= -.5; }
    draw();
    if (Math.abs(vx) > .05 || vy !== 0 || y < L.y1 - 1) raf = requestAnimationFrame(step);
  };
  c.addEventListener('pointerdown', e => {
    drag = true; cancelAnimationFrame(raf); c.setPointerCapture(e.pointerId);
    sx = e.clientX - x; sy = e.clientY - y; vx = vy = 0;
  });
  c.addEventListener('pointermove', e => {
    if (!drag) return;
    x = e.clientX - sx; y = e.clientY - sy; vx = e.movementX; vy = e.movementY; draw();
  });
  const drop = () => { if (drag) { drag = false; step(); } };
  c.addEventListener('pointerup', drop); c.addEventListener('pointercancel', drop);
  setTimeout(step, 1200);
})();