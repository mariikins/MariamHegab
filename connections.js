(() => {
  const $ = s => document.querySelector(s);

  // ---------- game ----------
  const ART = [
    { t: 'Venus with a Mirror', a: ['holds mirror', 'cupid', 'red velvet', 'ring'] },
    { t: 'afro.died, T.', a: ['blonde hair', 'pearl necklace', 'green robe', 'koi fish pillow'] },
    { t: 'Boy in a Red Waistcoat', a: ['red vest', 'hand on hip', 'curtain', 'contrapposto'] },
    { t: 'Ranuccio Farnese', a: ['young boy', 'black cloak', 'cross', 'ruffle'] },
    { t: 'Common Themes', a: ['all portraits', 'fabrics', 'back and forth', 'shows wealth'] }
  ];
  const COLORS = ['#4C41FF', '#FF5E22', '#D600C5', '#FFB202', '#00D6A3'];
  const grid = $('#grid'), solved = $('#solved'), msg = $('#msg'), game = $('.game');
  const BASE = 'Select 4 cards that describe the same artwork and 4 cards that describe all of the artworks.';
  let score = 0, att = 0, sel = [];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const say = m => { $('#score').textContent = score; $('#att').textContent = att; msg.textContent = m; };

  function reset() {
    score = att = 0; sel = []; solved.innerHTML = ''; grid.innerHTML = '';
    shuffle(ART.flatMap(g => g.a.map(t => ({ t, g: g.t })))).forEach(({ t, g }) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'gc'; b.textContent = t; b.dataset.g = g;
      b.setAttribute('aria-pressed', 'false'); b.onclick = () => pick(b);
      grid.appendChild(b);
    });
    say(BASE);
  }
  function pick(b) {
    const on = b.classList.contains('sel');
    if (!on && sel.length >= 4) return;
    b.classList.toggle('sel'); b.setAttribute('aria-pressed', String(!on));
    sel = [...grid.querySelectorAll('.sel')];
    if (sel.length === 4) setTimeout(check, 350);
  }
  function check() {
    if (sel.length !== 4) return;
    att++;
    const g = sel[0].dataset.g;
    if (sel.every(c => c.dataset.g === g)) {
      score += 100;
      const G = ART.find(x => x.t === g), row = document.createElement('div');
      row.className = 'sv'; row.style.setProperty('--c', COLORS[solved.children.length % 5]);
      row.innerHTML = `<small>${G.t}</small><div class="cells">${G.a.map(t => `<span>${t}</span>`).join('')}</div>`;
      solved.appendChild(row);
      sel.forEach(c => c.remove()); sel = [];
      if (!grid.children.length) { say('You found all connections! Perfect score!'); confetti(); }
      else say(G.t === 'Common Themes' ? `"${G.t}": you discovered what unites the paintings! +100 pts` : `"${G.t}" +100 pts`);
    } else {
      score -= 10;
      sel.forEach(c => c.classList.add('shake'));
      say('Not a match. -10 pts');
      setTimeout(() => { grid.querySelectorAll('.gc').forEach(c => { c.classList.remove('shake', 'sel'); c.setAttribute('aria-pressed', 'false'); }); sel = []; }, 450);
    }
  }
  function confetti() {
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('span');
      s.className = 'cf'; s.textContent = '\u2665\u2726'[i % 2];
      s.style.cssText = `left:${Math.random() * 100}%;color:${COLORS[i % 5]};animation-delay:${Math.random() * .8}s`;
      game.appendChild(s); setTimeout(() => s.remove(), 3600);
    }
  }
  $('#reset').onclick = reset; reset();

  // ---------- research map ----------
  const COLS = ['Listen & observe', 'Synthesize', 'Design', 'Playtest'];
  const CC = ['#ff7eb6', '#7fd6c8', '#ffd84d', '#a99bff'];
  const R = [
    { id: 'o1', c: 0, t: 'Site visits', g: 'Ethnographic observation', x: 'Observing people and the space across the galleries.', p: ['Observation of people: how visitors pause, play and talk.', 'Observation of the space: where the layout invites or blocks play.', 'Photos and sticky notes from each visit.'] },
    { id: 'l1', c: 0, t: 'Curator interview', g: 'Stakeholder interview', x: 'On balancing a scholarly brand with an accessible, playful experience.', p: ['The reinstallation is a chance to ask what more the gallery can do and say.', 'Wants people to associate the NGA with fun, and to feel they belong.', 'Designing for children tends to make things better for adults too.'] },
    { id: 'l2', c: 0, t: 'NGA panel', g: 'Stakeholder interview', x: 'A panel conversation about opportunities and constraints.', p: ['Almost limitless. One rule: don\u2019t say no, stay open.', 'Wants to introduce different modes of interaction.', 'Only audio has been done digitally so far.', 'There\u2019s a natural tension between fun and formality: some people feel the rotunda is too formal.'] },
    { id: 'l3', c: 0, t: 'Planning & evaluation', g: 'Stakeholder interview', x: 'Notes from the museum\u2019s planning and evaluation lead.', p: ['Keep humans at the center.', 'Six areas of fun: learning, recharge, play, socialize, create, kids.'] },
    { id: 's1', c: 1, t: 'Affinity diagram', g: 'Affinity mapping', x: 'Observations and interview notes clustered into five themes.', p: ['Visitor experience goals', 'Fun and engagement', 'Future direction', 'Exhibition, interpretation and institutional identity', 'Visitor observations, physical and human'] },
    { id: 's2', c: 1, t: 'Systems map', g: 'Systems mapping', x: 'Visitor emotions and motivations sit at the center, linked to the physical environment, institutional voice and balancing seriousness with play. See the systems map below.' },
    { id: 's3', c: 1, t: 'Family journey map', g: 'Journey mapping', x: 'A family\u2019s visit across five stages, from pain points to opportunities.', p: ['Arrival: feels formal and quiet \u2192 playful welcome cues', 'Exploring: static displays, \u201cno touch\u201d \u2192 gentle interactivity for all ages', 'Break: play zones feel disconnected \u2192 link them to gallery paths', 'Engagement: digital feels boring \u2192 shared, multi-user play', 'Exit: nothing lasts beyond souvenirs \u2192 interactive takeaways'] },
    { id: 'd1', c: 2, t: 'How might we', g: 'Design question', x: 'How might we create interactivity and play at the NGA that resonates across age groups, making learning and engagement meaningful for both children and adults?' },
    { id: 'd2', c: 2, t: 'Four game concepts', g: 'Prototyping', x: 'Each concept turns looking at art into something you do together.', p: ['Paint n\u2019 Play: replicate a work in your own style', 'Mix & Masterpiece: rearrange paintings', 'Art You Dress Up?: match your outfit to a painting', 'Art Connections: a connections-style game for the gallery'] },
    { id: 'd3', c: 2, t: 'Three style variations', g: 'Visual design', x: 'Three directions tested before settling on one.', p: ['Black and white, inspired by NGA branding: bold Helvetica Neue, strong grid, no rounded edges', 'Pastel with rounded boxes and light use of color: playful but sophisticated', 'Bright, with circles and shapes: playful, with a more interesting layout', 'Feedback: it doesn\u2019t need to match what the NGA has now.'] },
    { id: 'd4', c: 2, t: 'Art Connections', g: 'My prototype', x: 'A connections-style game where visitors sort traits across four paintings. Try it above.', sw: ['#4C41FF', '#FF5E22', '#D600C5', '#FFB202', '#00D6A3'] },
    { id: 't1', c: 3, t: 'Mix & Masterpiece', g: 'Playtest', x: 'Groups rearranged a painting in the gallery.', p: ['Interacting with the pieces made it more memorable.', 'More fun in a group; quieter alone.', 'Visitors wanted to rotate pieces and see something happen when all are placed.'] },
    { id: 't2', c: 3, t: 'Art You Dress Up?', g: 'Playtest', x: 'Visitors matched their clothes to paintings.', p: ['A visitor\u2019s red cloth matched the painting and he said yes to the photo right away.', 'A couple matched the flowers on their shirts to the tree in the painting.', 'They thought kids would like it too.'] },
    { id: 't3', c: 3, t: 'Art Connections', g: 'Playtest', x: 'Visitors played rounds of the connections game.', p: ['One player was hesitant at first, then more comfortable with each round.', 'A college student and art enthusiast got hooked and wondered what each detail meant.', 'Feedback: change the color, since it can read as a hint about connections.'] },
    { id: 't4', c: 3, t: 'Paint n\u2019 Play', g: 'Playtest', x: 'Adults and a kid tried painting in the style of a work.', p: ['Adults found it a very cool concept, but the interface felt too basic.', 'Asked for a color picker wheel and more brushes.', 'An 11-year-old preferred the original and wanted more brush variety.'] }
  ];
  const L = [['o1','s1'],['o1','s3'],['l1','s1'],['l1','s3'],['l2','s1'],['l3','s1'],['s1','s2'],['s1','d1'],['s2','d1'],['s3','d1'],
    ['d1','d2'],['d2','d3'],['d2','d4'],['d3','d4'],['d2','t1'],['d2','t2'],['d2','t4'],['d4','t3']];
  const TL = [
    { d: 'Sep 17', l: 'Curator interview', n: ['l1'], x: 'An interview with an NGA curator on balancing scholarship and play.' },
    { d: 'Oct 15', l: 'Midterm presentation', n: ['s1', 's2', 's3'], x: 'Shared what we heard, what we learned and where we\u2019re going.' },
    { d: 'Oct 29', l: 'Prototype feedback', n: ['d2', 'd4'], x: 'Feedback on the first prototypes, including a note to change the color of Art Connections.' },
    { d: 'Nov 5', l: 'Style feedback', n: ['d3'], x: 'Look to the NGA\u2019s button color, use NGA blue in the gray scale, and pair a serif for heads with Helvetica Neue for content.' },
    { d: 'Nov 19', l: 'Gallery playtests', n: ['t1', 't2', 't3', 't4'], x: 'Prototypes tested with visitors on site, with a plan for what to ask each group.' }
  ];
  const rm = $('#rm'), links = $('#links'), panel = $('#panel'), tl = $('#tl');
  const byId = Object.fromEntries(R.map(n => [n.id, n]));
  rm.insertAdjacentHTML('beforeend', COLS.map((name, ci) => `<div class="col"><h3>${name}</h3>` +
    R.filter(n => n.c === ci).map(n => `<button type="button" class="nd" data-id="${n.id}" style="--c:${CC[ci]}"><i></i><b>${n.t}</b><span>${n.g}</span></button>`).join('') + '</div>').join(''));
  const nodes = [...rm.querySelectorAll('.nd')], nd = id => rm.querySelector(`.nd[data-id="${id}"]`);
  tl.innerHTML = TL.map((m, i) => `<button type="button" data-i="${i}"><b>${m.d}</b><span>${m.l}</span></button>`).join('');

  const draw = () => {
    const box = rm.getBoundingClientRect();
    links.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    links.querySelectorAll('path').forEach(p => p.remove());
    L.forEach(([a, b]) => {
      const r1 = nd(a).getBoundingClientRect(), r2 = nd(b).getBoundingClientRect();
      const x1 = r1.right - box.left, y1 = r1.top + r1.height / 2 - box.top, x2 = r2.left - box.left, y2 = r2.top + r2.height / 2 - box.top, dx = (x2 - x1) / 2;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`);
      p.dataset.a = a; p.dataset.b = b; links.appendChild(p);
    });
    mark(cur);
  };
  let cur = { nodes: new Set(), edge: () => false };
  const mark = s => {
    rm.classList.toggle('sel', s.nodes.size > 0);
    nodes.forEach(n => n.classList.toggle('on', s.nodes.has(n.dataset.id)));
    links.querySelectorAll('path').forEach(p => p.classList.toggle('on', s.edge(p.dataset.a, p.dataset.b)));
  };
  const trace = id => {   // everything upstream and downstream of a node
    const up = new Set([id]), down = new Set([id]);
    for (let k = 0; k < 6; k++) L.forEach(([a, b]) => { if (up.has(b)) up.add(a); if (down.has(a)) down.add(b); });
    return { nodes: new Set([...up, ...down]), edge: (a, b) => up.has(b) || down.has(a) };
  };
  const card = n => {
    panel.innerHTML = `<span class="tg" style="--c:${CC[n.c]}">${n.g}</span><h3>${n.t}</h3><p>${n.x}</p>` +
      (n.p ? `<ul>${n.p.map(t => `<li>${t}</li>`).join('')}</ul>` : '') +
      (n.sw ? `<div class="sws">${n.sw.map(c => `<span style="background:${c}" title="${c}"></span>`).join('')}</div>` : '');
  };
  let pinned = 'd1';
  const show = id => { cur = trace(id); mark(cur); card(byId[id]); tl.querySelectorAll('button').forEach(b => b.classList.remove('on')); };
  nodes.forEach(n => {
    n.addEventListener('mouseenter', () => show(n.dataset.id));
    n.addEventListener('focus', () => show(n.dataset.id));
    n.addEventListener('mouseleave', () => show(pinned));
    n.addEventListener('click', () => { pinned = n.dataset.id; show(pinned); });
  });
  tl.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const m = TL[b.dataset.i], set = new Set(m.n);
    cur = { nodes: set, edge: (a, c) => set.has(a) && set.has(c) }; mark(cur);
    panel.innerHTML = `<span class="tg" style="--c:#fff">${m.d}</span><h3>${m.l}</h3><p>${m.x}</p>`;
    tl.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  }));
  addEventListener('resize', draw);
  draw(); show(pinned);

  // ---------- systems map ----------
  const N = [
    ['c', 1856, 640, 50, 'Visitor|Emotions &|Motivations', '#f4c0c8', '#222'],
    ['phys', 1655, 583, 44, 'Physical|Environment|& Flow', '#cfe3fb', '#222'],
    ['inst', 2075, 583, 46, 'Institutional|Voice &|Design Choices', '#dcd0f7', '#222'],
    ['bal', 1856, 772, 46, 'Balancing|Seriousness +|Play at the|NGA', '#f4c0e0', '#222'],
    ['modes', 1669, 862, 44, 'Modes of|Engagement', '#c9f3e6', '#222'],
    ['intl', 2045, 862, 46, 'Internal|Systems &|Processes', '#d4efd0', '#222'],
    ['acc', 1547, 547, 34, 'accessibility', '#3b2f8f', '#fff'], ['com', 1543, 653, 30, 'comfort', '#4aa3e8', '#fff'],
    ['cur', 1745, 532, 30, 'curiosity', '#e7876c', '#fff'], ['awe', 1812, 503, 22, 'awe', '#fbdcc0', '#333'],
    ['bel', 1930, 503, 28, 'belonging', '#fbe7b0', '#333'], ['dis', 1988, 532, 30, 'discovery', '#e56b6b', '#fff'],
    ['sto', 2143, 473, 32, 'storytelling', '#6a3be0', '#fff'], ['int', 2135, 680, 36, 'interpretation|style', '#d7a8f0', '#333'],
    ['lea', 1625, 750, 28, 'learning', '#7fd6c8', '#222'], ['pro', 2108, 752, 28, 'prototyping', '#8fcf6a', '#222'],
    ['pla', 1668, 960, 24, 'play', '#bdf5d4', '#222'], ['soc', 1788, 932, 32, 'socializing', '#8fb5b0', '#222'],
    ['sta', 1948, 936, 28, 'staff|collab', '#7fc27a', '#222'], ['fee', 2067, 977, 36, 'feedback', '#3fae5f', '#fff']
  ];
  const E = [['c','phys'],['c','inst'],['c','bal'],['c','modes'],['c','intl'],['c','cur'],['c','awe'],['c','bel'],['c','dis'],
    ['phys','acc'],['phys','com'],['inst','sto'],['inst','int'],['bal','modes'],['bal','intl'],
    ['modes','lea'],['modes','pla'],['modes','soc'],['intl','sta'],['intl','fee'],['intl','pro']];
  const P = Object.fromEntries(N.map(n => [n[0], n]));
  const svg = $('#sysmap');
  svg.innerHTML = E.map(([a, b]) => `<line data-a="${a}" data-b="${b}" x1="${P[a][1]}" y1="${P[a][2]}" x2="${P[b][1]}" y2="${P[b][2]}"/>`).join('') +
    N.map(([id, x, y, r, l, f, tc]) => {
      const ls = l.split('|'), fs = r > 40 ? 11 : 10;
      return `<g class="n" data-id="${id}" tabindex="0"><circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>` +
        ls.map((t, i) => `<text x="${x}" y="${y + (i - (ls.length - 1) / 2) * (fs + 2) + fs / 3}" font-size="${fs}" text-anchor="middle" fill="${tc}">${t.replace('&', '&amp;')}</text>`).join('') + '</g>';
    }).join('');
  const light = id => {
    const on = new Set([id]); E.forEach(([a, b]) => { if (a === id) on.add(b); if (b === id) on.add(a); });
    svg.classList.add('hov');
    svg.querySelectorAll('.n').forEach(g => g.classList.toggle('lit', on.has(g.dataset.id)));
    svg.querySelectorAll('line').forEach(l => l.classList.toggle('lit', l.dataset.a === id || l.dataset.b === id));
  };
  const clear = () => svg.classList.remove('hov');
  svg.querySelectorAll('.n').forEach(g => {
    ['mouseenter', 'focus', 'touchstart'].forEach(ev => g.addEventListener(ev, () => light(g.dataset.id), { passive: true }));
    ['mouseleave', 'blur'].forEach(ev => g.addEventListener(ev, clear));
  });
})();