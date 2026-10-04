(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app'), screen = $('.screen'), phone = $('#phone');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scale the 390 x 845 app to whatever size the phone screen is
  const fit = () => (app.style.transform = `scale(${screen.clientWidth / 390})`);
  new ResizeObserver(fit).observe(screen); fit();

  // ---------- data ----------
  const DAYS = [18, 19, 20, 21, 22, 23, 24];
  const tasks = {
    18: [['Study chap 3', 1], ['UX discussion board', 1], ['Meet with advisor', 0], ['Begin outline', 0]],
    19: [['Read article', 0], ['Lab prep', 0], ['Gym', 0]],
    20: [['Submit draft', 0], ['Call mom', 0]],
    21: [['Group meeting', 0], ['Laundry', 0]]
  };
  const rem = {
    18: ['Therapy at 3pm', '742 Evergreen Terrace', 'Springfield'],
    19: ['Office hours at 11am', 'Room 204', ''],
    20: ['Draft due at 5pm', 'Submit online', '']
  };
  const notes = [
    { d: 18, t: 'UX/UI PROJECT', h: 'Social networking site:', b: 'Design a social networking site that focuses on connecting people with similar interests or hobbies. The site could allow users to create profiles, post content, and join groups. You could also consider incorporating features like a newsfeed, chat, and recommendations for users to connect with others.' },
    { d: 15, t: 'MEAL PLANNING', h: 'This week:', b: 'Batch cook rice and chickpeas on Sunday. Smoothie packs for mornings. Groceries before Thursday.' },
    { d: 10, t: 'RESEARCH PAPER', h: 'Outline:', b: 'Intro, three sections, conclusion. Find two more sources. Draft by Friday.' }
  ];
  const S = { view: 'lock', running: false, elapsed: 0, last: 0, sel: 18, focus: null, note: null, today: 0 };
  const tl = d => tasks[d] || (tasks[d] = []);
  const pad2 = n => String(n).padStart(2, '0');

  // ---------- navigation ----------
  const views = $$('.v'), tabs = $$('#tabs button');
  const toast = $('#toast');
  let tt;
  const say = m => { toast.textContent = m; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 1700); };
  function go(v, o = {}) {
    if (S.running && v !== 'timer' && v !== 'lock' && !o.force) {
      say('LOCKED IN. PAUSE TO LEAVE.');
      const b = $(`#tabs [data-t="${v}"]`); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      return;
    }
    S.view = v; app.dataset.v = v;
    views.forEach(x => x.classList.toggle('on', x.dataset.v === v));
    tabs.forEach(b => b.classList.toggle('on', b.dataset.t === v));
    if (v !== 'notes') closeNote();
    if (v === 'lock') { $('#pad').classList.remove('closed'); setHold(0); }
    if (v === 'cal') paintCal();
    if (v === 'timer') paintChip();
  }
  tabs.forEach(b => b.addEventListener('click', () => go(b.dataset.t)));
  $('#totasks').onclick = () => go('tasks');

  // ---------- lock screen: press and hold ----------
  const hold = $('#hold'), hring = $('#hring'), C = 465;
  let hs = 0, hraf = 0, locking = false;
  const setHold = p => (hring.style.strokeDashoffset = C * (1 - p));
  function holdStep(now) {
    const p = Math.min(1, (now - hs) / 900);
    setHold(p);
    if (p >= 1) return lockIn();
    hraf = requestAnimationFrame(holdStep);
  }
  function holdStart(e) {
    if (locking) return;
    hold.classList.add('down'); $('#holdtxt').textContent = 'LOCKING';
    hs = performance.now(); hring.style.transition = 'none'; hraf = requestAnimationFrame(holdStep);
  }
  function holdEnd() {
    if (locking) return;
    cancelAnimationFrame(hraf); hold.classList.remove('down'); $('#holdtxt').textContent = 'HOLD';
    hring.style.transition = 'stroke-dashoffset .4s'; setHold(0);
  }
  function lockIn() {
    locking = true; cancelAnimationFrame(hraf); $('#pad').classList.add('closed');
    navigator.vibrate && navigator.vibrate(25); $('#holdtxt').textContent = 'LOCKED';
    setTimeout(() => {
      go('timer', { force: true }); start(); locking = false; hold.classList.remove('down'); $('#holdtxt').textContent = 'HOLD';
    }, 650);
  }
  hold.addEventListener('pointerdown', e => { hold.setPointerCapture(e.pointerId); holdStart(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => hold.addEventListener(ev, holdEnd));
  hold.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!locking) lockIn(); } });

  // ---------- timer ----------
  const pr = $('#pr'), dg = $('#dg'), dgs = $('#dgs'), mainBtn = $('#main'), CR = 817;
  let raf = 0;
  function paintTime() {
    const ms = S.elapsed, s = Math.floor(ms / 1000);
    dg.textContent = `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}.${Math.floor(ms / 100) % 10}`;
    dgs.textContent = pad2(Math.floor(ms % 100));
    pr.style.strokeDashoffset = CR * (1 - (ms % 60000) / 60000);
    const t = S.today + ms, ts = Math.floor(t / 1000);
    $('#today').textContent = `${pad2(Math.floor(ts / 3600))}:${pad2(Math.floor(ts / 60) % 60)}:${pad2(ts % 60)}`;
  }
  function paintBtn() { mainBtn.textContent = S.running ? 'PAUSE' : S.elapsed > 0 ? 'RESUME' : 'START'; $('#reset').style.visibility = !S.running && S.elapsed > 0 ? 'visible' : 'hidden'; }
  function tick(now) { if (!S.running) return; S.elapsed += now - S.last; S.last = now; paintTime(); raf = requestAnimationFrame(tick); }
  function start() { if (S.running) return; S.running = true; S.last = performance.now(); app.classList.add('focus'); raf = requestAnimationFrame(tick); paintBtn(); }
  function pause() { S.running = false; app.classList.remove('focus'); cancelAnimationFrame(raf); paintBtn(); }
  mainBtn.onclick = () => (S.running ? pause() : start());
  $('#reset').onclick = () => { pause(); S.today += S.elapsed; S.elapsed = 0; paintTime(); paintBtn(); };

  // the task you're working on
  function current() {
    if (S.focus && tl(S.focus.d)[S.focus.i] && !tl(S.focus.d)[S.focus.i][1]) return S.focus;
    const i = tl(18).findIndex(t => !t[1]); return i < 0 ? null : { d: 18, i };
  }
  function paintChip() {
    const c = current();
    $('#chiptx').textContent = c ? tl(c.d)[c.i][0] : 'All done today';
    $('#chipok').style.display = c ? '' : 'none';
  }
  $('#chipok').onclick = () => { const c = current(); if (!c) return; tl(c.d)[c.i][1] = 1; S.focus = null; refresh(); say('NICE. TASK DONE.'); };

  // ---------- tasks ----------
  const strip = $('#daystrip');
  function paintStrip() {
    strip.innerHTML = DAYS.map(d => `<button type="button" class="day${d === S.sel ? ' sel' : ''}" data-d="${d}">${d}${d === 18 ? '<em>TODAY</em>' : ''}</button>`).join('');
    $$('.day', strip).forEach(b => b.onclick = () => { S.sel = +b.dataset.d; paintTasks(); paintCal(); });
  }
  function paintTasks() {
    $$('.day', strip).forEach(b => b.classList.toggle('sel', +b.dataset.d === S.sel));
    const r = rem[S.sel], box = $('#rem');
    box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
    box.innerHTML = r ? `<p><b>REMINDER:</b></p><p class="r2">${r[0]}</p><p class="r3">${r[1]}${r[2] ? '<br>' + r[2] : ''}</p>` : `<p><b>REMINDER:</b></p><p class="r2">Nothing yet</p>`;
    const list = $('#list'); list.innerHTML = '';
    tl(S.sel).forEach(([t, d], i) => {
      const li = document.createElement('li'); if (d) li.className = 'd';
      li.innerHTML = `<button type="button" class="cb" aria-label="Toggle"><svg viewBox="0 0 16 16"><path d="m3 8.5 3.2 3L13 4.5"/></svg></button><span class="lb">${t}</span>` + (d ? '' : '<button type="button" class="go" aria-label="Focus on this">&#9654;</button>');
      $('.cb', li).onclick = () => { tl(S.sel)[i][1] = d ? 0 : 1; refresh(); };
      const g = $('.go', li); if (g) g.onclick = () => { S.focus = { d: S.sel, i }; paintChip(); go('timer', { force: true }); say('FOCUSING ON: ' + t.toUpperCase()); };
      list.appendChild(li);
    });
    const add = document.createElement('li'); add.className = 'add'; add.innerHTML = '<button type="button" aria-label="Add task">+</button>';
    $('button', add).onclick = () => {
      add.innerHTML = '<input maxlength="28" placeholder="New task" aria-label="New task">';
      const inp = $('input', add); inp.focus();
      inp.onkeydown = e => { if (e.key === 'Enter' && inp.value.trim()) { tl(S.sel).push([inp.value.trim(), 0]); refresh(); } if (e.key === 'Escape') paintTasks(); };
      inp.onblur = () => setTimeout(paintTasks, 120);
    };
    list.appendChild(add);
  }

  // ---------- calendar ----------
  function paintCal() {
    const g = $('#cgrid');
    g.innerHTML = Array.from({ length: 30 }, (_, i) => i + 1).map(d => `<button type="button" class="dd${d === S.sel ? ' sel' : ''}${tl(d).length ? ' has' : ''}" data-d="${d}">${d}</button>`).join('');
    $$('.dd', g).forEach(b => b.onclick = () => { S.sel = +b.dataset.d; paintCal(); paintTasks(); paintStrip(); });
    const L = tl(S.sel), done = L.filter(t => t[1]).length, pct = L.length ? Math.round(done / L.length * 100) : 0;
    requestAnimationFrame(() => ($('#pfill').style.width = pct + '%'));
    $('#ptx').textContent = `PROGRESS ${pct}%`;
    $('#dn').textContent = L.length ? `${done}/${L.length} TASKS COMPLETED !` : 'NOTHING PLANNED YET';
    const yet = L.filter(t => !t[1]);
    $('#yet').innerHTML = L.length ? (yet.length ? yet.slice(0, 4).map(t => `<li>${t[0].toUpperCase()}</li>`).join('') : '<li>ALL CLEAR. NICE WORK.</li>') : '<li>ADD TASKS FROM THE TASKS TAB</li>';
  }
  function refresh() { paintStrip(); paintTasks(); paintCal(); paintChip(); }

  // ---------- notes ----------
  const nl = $('#nl'), nd = $('#nd');
  function paintNotes() {
    nl.innerHTML = '';
    const mk = (cls, html, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'nr ' + cls; b.innerHTML = html; b.onclick = fn; nl.appendChild(b); };
    notes.forEach((n, i) => mk('', `<span class="tile">${n.d}</span><span class="tx">JANUARY ${n.d}<br>${n.t}</span><span class="pl">+</span>`, () => openNote(i)));
    for (let k = 0; k < Math.max(1, 5 - notes.length); k++)
      mk('empty', '<span class="pl">+</span>', () => { notes.push({ d: 19 + notes.length - 3, t: 'UNTITLED', h: 'New note:', b: '' }); paintNotes(); openNote(notes.length - 1); });
  }
  function openNote(i) {
    S.note = i; const n = notes[i];
    $('#ntile').textContent = n.d; $('#ndate').textContent = 'JANUARY ' + n.d; $('#ntitle').textContent = n.t;
    $('#nhead').textContent = n.h; $('#nbody').textContent = n.b; $('#kb').classList.remove('hide');
    nd.classList.add('open');
  }
  function closeNote() { S.note = null; nd.classList.remove('open'); }
  $('#nback').onclick = closeNote;
  function type(ch) {
    if (S.note == null) return; const n = notes[S.note];
    if (ch === 'BACK') n.b = n.b.slice(0, -1); else if (ch === 'GO') { $('#kb').classList.add('hide'); return; } else n.b += ch;
    $('#nbody').textContent = n.b;
  }
  let shift = true;
  const kb = $('#kb');
  [['Q','W','E','R','T','Y','U','I','O','P'], ['A','S','D','F','G','H','J','K','L'], ['⇧','Z','X','C','V','B','N','M','⌫'], ['123',' ','Go']].forEach(row => {
    const r = document.createElement('div'); r.className = 'kr';
    row.forEach(k => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'k' + (k.length > 1 && k !== 'Go' ? ' kw' : '') + (k === ' ' ? ' sp' : '') + (k === 'Go' ? ' go2' : '');
      b.textContent = k === ' ' ? '' : k; b.setAttribute('aria-label', k === ' ' ? 'space' : k);
      b.onclick = () => { if (k === '⌫') type('BACK'); else if (k === 'Go') type('GO'); else if (k === '⇧' || k === '123') return; else type(k); };
      r.appendChild(b);
    }); kb.appendChild(r);
  });
  document.addEventListener('keydown', e => {
    if (S.note == null || e.metaKey || e.ctrlKey || e.altKey || !phone.matches(':hover')) return;
    if (e.key === 'Backspace') { e.preventDefault(); type('BACK'); }
    else if (e.key === 'Enter') { e.preventDefault(); type('GO'); }
    else if (e.key.length === 1) { e.preventDefault(); type(e.key.toUpperCase()); }
  });

  // ---------- splash ----------
  const splash = $('#splash'); let st;
  function play() {
    clearTimeout(st); go('lock', { force: true });
    splash.classList.remove('done', 'play'); void splash.offsetWidth; splash.classList.add('play');
    st = setTimeout(() => splash.classList.add('done'), reduce ? 0 : 3000);
  }
  splash.onclick = () => { clearTimeout(st); splash.classList.add('done'); };
  $('#replay').onclick = () => { if (S.running) pause(); S.elapsed = 0; paintTime(); paintBtn(); play(); };

  // ---------- scrollytelling: the phone follows the chapters ----------
  const chaps = $$('.chap');
  function story(name) {
    if (S.running && name !== 'timer') pause();
    if (name === 'timer') { if (!S.running && S.elapsed < 1000) { S.elapsed = 29600; paintTime(); } go('timer', { force: true }); start(); }
    else if (name === 'note') { go('notes', { force: true }); openNote(0); }
    else go(name, { force: true });
  }
  if ('IntersectionObserver' in window && matchMedia('(min-width:901px)').matches) {
    let cur = null;
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting || en.target === cur) return;
      cur = en.target; chaps.forEach(c => c.classList.toggle('on', c === cur));
      if (!splash.classList.contains('done') && cur.dataset.go !== 'lock') { clearTimeout(st); splash.classList.add('done'); }
      story(cur.dataset.go);
    }), { rootMargin: '-45% 0px -45% 0px' });
    chaps.forEach(c => io.observe(c));
  }
  chaps[0].classList.add('on');

  // play the intro the first time the phone is on screen
  if ('IntersectionObserver' in window) {
    const once = new IntersectionObserver(es => { if (es[0].isIntersecting) { once.disconnect(); play(); } }, { threshold: .6 });
    once.observe(phone);
  } else play();

  // palette swatches copy their hex
  $$('.sw2 button').forEach(b => b.addEventListener('click', () => {
    navigator.clipboard && navigator.clipboard.writeText(b.dataset.hex);
    const s = $('span', b), t = b.dataset.hex; s.textContent = 'Copied'; setTimeout(() => (s.textContent = t), 1200);
  }));

  // init
  paintStrip(); paintTasks(); paintCal(); paintChip(); paintNotes(); paintTime(); paintBtn();
  go('lock', { force: true });
})();
