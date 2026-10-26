/* Veda Computers: the broken screen that scrolls back to life. */
(function () {
  const kit = window.motionKit.init();
  const { gsap, reduced } = kit;
  const G = window.glass;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isPhone = () => innerWidth < 900;

  /* ---------- 1. Build the broken screen ---------- */
  const stage = $('.stage');
  const svg = $('.glass');
  const W = stage.clientWidth, H = stage.clientHeight;
  const IX = W * (isPhone() ? 0.56 : 0.6), IY = H * (isPhone() ? 0.34 : 0.4);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const net = G.cracks(W, H, IX, IY, { n: isPhone() ? 9 : 12, seed: 14, scale: isPhone() ? 0.7 : 1 });
  const traces = G.drawTraces($('.glass__traces', svg), net, { scale: isPhone() ? 0.7 : 1 });
  const crackEls = G.drawCracks($('.glass__cracks', svg), net);
  const maxStart = Math.max(1, ...crackEls.map((c) => c._start));

  // shards: each wedge between two radial cracks carries its own copy of the wordmark
  const shardsWrap = $('.shards');
  const polys = G.shardPolys(net);
  const shards = polys.map((p, i) => {
    const s = document.createElement('div');
    s.className = 'shard';
    s.style.clipPath = p.poly;
    s.innerHTML = '<p class="mark" aria-hidden="true"><span class="mark__word">VEDA</span></p>';
    shardsWrap.appendChild(s);
    const amt = (isPhone() ? 10 : 22) + (i % 3) * 7;
    s._off = { x: p.dir[0] * amt, y: p.dir[1] * amt, r: ((i * 37) % 7 - 3) * 0.55 };
    return s;
  });

  // fault tags pinned to points on the cracks, with dashed leader lines
  const tags = $$('.tag');
  const leaders = $('.glass__leaders', svg);
  const tagPos = tags.map((t, i) => {
    const rad = net.radials[(i * 2 + 1) % net.radials.length];
    const pt = rad.pts[Math.min(rad.pts.length - 1, isPhone() ? 2 : 3)];
    return { x: pt[0], y: pt[1] };
  });
  function placeTags() {
    if (reduced) return;
    leaders.innerHTML = '';
    const phone = isPhone();
    const padX = phone ? 14 : Math.max(18, W * 0.032);
    const top = phone ? 70 : 96, gap = phone ? 8 : 14;
    const col = [top, top];
    // left column gets faults whose crack points sit left of the impact, right column the rest
    const order = tags.map((t, i) => i).sort((a, b) => tagPos[a].y - tagPos[b].y);
    const side = {}; let nl = 0, nr = 0;
    order.forEach((i) => {
      let right = tagPos[i].x > IX;
      if (right && nr >= 3) right = false; else if (!right && nl >= 3) right = true;
      side[i] = right; right ? nr++ : nl++;
    });
    order.forEach((i) => {
      const t = tags[i], p = tagPos[i], right = side[i];
      const tw = t.offsetWidth, th = t.offsetHeight;
      const x = right ? W - tw - padX : padX;
      const y = col[+right]; col[+right] += th + gap;
      t.style.left = x + 'px'; t.style.top = y + 'px';
      const ax = right ? x : x + tw, ay = y + th / 2;
      const mx = right ? ax - 24 : ax + 24;
      const l = G.el('path', { d: `M${p.x} ${p.y} L${mx} ${ay} L${ax} ${ay}`, fill: 'none', stroke: '#d97a34', 'stroke-width': 1, class: 'leader' });
      const dot = G.el('circle', { cx: p.x, cy: p.y, r: 4, fill: '#d97a34', class: 'leader' });
      const ring = G.el('circle', { cx: p.x, cy: p.y, r: 10, fill: 'none', stroke: '#d97a34', 'stroke-width': 1, class: 'leader' });
      leaders.append(l, ring, dot);
    });
  }

  /* ---------- 2. LCD shader: broken panel bleed → clean dark screen ---------- */
  const FRAG = `precision highp float;
  uniform float uTime,uScroll,uVel,uHeal; uniform vec2 uRes,uMouse,uImpact; uniform vec3 uA,uB,uC;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){
    vec2 uv=gl_FragCoord.xy/uRes; vec2 ip=vec2(uImpact.x,1.-uImpact.y);
    float br=1.-uHeal;
    // vertical dead columns and bleeding colour bars from the impact
    float col=floor(uv.x*uRes.x/3.);
    float bar=step(.82,h(vec2(col,floor(uTime*.6))))*smoothstep(.0,.5,1.-abs(uv.x-ip.x)*1.6);
    float d=distance(uv*vec2(uRes.x/uRes.y,1.),ip*vec2(uRes.x/uRes.y,1.));
    float ink=smoothstep(.55,0.,d)*(.6+.4*sin(d*40.-uTime*1.5+h(vec2(col,1.))*6.));
    vec3 c=vec3(.03);
    c=mix(c,uA,clamp(ink*.55,0.,1.)*br);
    c=mix(c,uB,bar*.45*br*step(uv.y,ip.y+.25*h(vec2(col,3.))));
    c+=uC*smoothstep(.12,0.,d)*.35*br;
    // healed: deep screen glow
    c+=vec3(.07,.05,.035)*smoothstep(1.1,0.,distance(uv,vec2(.5,.55)))*uHeal;
    c+=(h(uv*uRes+uTime)-.5)*.05;
    gl_FragColor=vec4(clamp(c,0.,.92),1.);
  }`;
  const fx = kit.reduced ? null : window.motionKit.shader($('.lcd'), FRAG, {
    uA: [0.85, 0.25, 0.55], uB: [0.2, 0.75, 0.9], uC: [0.95, 0.92, 0.85],
    uHeal: 0, uImpact: [IX / W, IY / H],
  });
  const heal = { v: 0 };
  const setHeal = () => { if (fx) { fx.uniforms.uHeal.value = heal.v; } };

  /* ---------- 3. Meter ---------- */
  const meter = $('.meter'), meterBar = $('.meter__bar i'), meterNum = $('.meter__num');
  function setMeter(p) {
    const n = Math.round(p * 100);
    meterNum.textContent = String(n).padStart(3, '0') + '%';
    meterBar.style.transform = `scaleX(${p})`;
    meter.classList.toggle('is-ok', n >= 100);
    $('.meter__label').textContent = n >= 100 ? 'READY' : 'REPAIR';
  }

  /* ---------- 4. CCTV wall feeds ---------- */
  const FEEDS = [
    ['01', 'SHOP FRONT', 'shutter'], ['02', 'COUNTER', 'counter'], ['03', 'PARKING', 'parking'],
    ['04', 'AISLE B', 'aisle'], null, ['06', 'RECEPTION', 'desk'],
    ['07', 'MAIN GATE', 'gate'], ['08', 'STAIRWELL', 'stairs'], ['09', 'BILLING', 'cash'],
  ];
  const wall = $('.wall');
  FEEDS.forEach((f, i) => {
    const d = document.createElement('div');
    if (!f) {
      d.className = 'feed feed--veda';
      d.innerHTML = '<div class="feed__mark">VEDA</div><div class="feed__ui"><span>CAM 05 · YOUR SCREEN</span><span class="feed__rec">REC</span><span class="feed__time"></span></div>';
    } else {
      d.className = 'feed';
      d.innerHTML = G.scene(f[2], i + 3) + (i % 2 ? '<i class="feed__who" style="animation-delay:-' + (i * 3.1) + 's"></i>' : '') +
        `<div class="feed__ui"><span>CAM ${f[0]} · ${f[1]}</span><span class="feed__rec">REC</span><span class="feed__time"></span></div>`;
    }
    wall.appendChild(d);
  });
  const times = $$('.feed__time');
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const d = new Date();
    const s = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    times.forEach((t) => (t.textContent = s));
  }
  tick(); setInterval(tick, 1000);

  /* ---------- 5. Row dividers are hairline cracks ---------- */
  $$('.row__crack').forEach((s, i) => {
    const r = G.rng(40 + i);
    s.setAttribute('viewBox', '0 0 1000 14'); s.setAttribute('preserveAspectRatio', 'none');
    let x = 0, y = 7; const pts = [[0, 7]];
    while (x < 1000) { x += 30 + r() * 90; y = 7 + (r() - 0.5) * 9; pts.push([Math.min(1000, x), y]); }
    const p = G.el('path', { d: 'M' + pts.map((q) => q.join(' ')).join(' L'), fill: 'none', stroke: '#ece5d8', 'stroke-opacity': 0.35, 'stroke-width': 1, pathLength: 1, 'vector-effect': 'non-scaling-stroke' });
    s.appendChild(p); s._p = p;
  });

  /* ---------- 6. Footer: click the wordmark to crack it, it heals ---------- */
  const fm = $('.foot__mark'), fg = $('.foot__glass');
  let healing = null;
  function crackFooter(px, py) {
    const w = fm.clientWidth, h = fm.clientHeight;
    fg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    fg.innerHTML = '';
    const g = G.el('g'); fg.appendChild(g);
    const n = G.cracks(w, h, px, py, { n: 9, seed: (Math.random() * 1e6) | 0, scale: 0.6 });
    const els = G.drawCracks(g, n);
    if (healing) healing.kill();
    if (reduced) { healing = gsap.delayedCall(1.6, () => (fg.innerHTML = '')); return; }
    const m = Math.max(1, ...els.map((c) => c._start));
    gsap.fromTo(fm, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' });
    healing = gsap.timeline()
      .fromTo(els, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'expo.out', stagger: (i) => (els[i]._start / m) * 0.25 }, 0)
      .to(els, { strokeDashoffset: -1, duration: 0.9, ease: 'power2.inOut' }, 1.4)
      .add(() => (fg.innerHTML = ''));
    els.forEach((e) => (e.style.strokeDasharray = '1 1'));
  }
  fm.addEventListener('click', (e) => {
    const r = fm.getBoundingClientRect();
    crackFooter(e.clientX - r.left, e.clientY - r.top);
  });
  fm.setAttribute('tabindex', '0');
  fm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); crackFooter(fm.clientWidth * 0.55, fm.clientHeight * 0.45); }
  });

  /* ---------- Reduced motion: final, readable states; stop here ---------- */
  if (reduced) {
    setMeter(1);
    $('.plate--base').style.opacity = 1;
    shardsWrap.style.display = 'none';
    return;
  }

  /* ---------- 7. Opening ritual: POST, impact, the glass goes ---------- */
  const post = $('.loader__post');
  const LINES = [
    'VEDA BIOS v4.2   (C) Veda Computers',
    'CPU ........................ OK',
    'MEMORY 16384 MB ............ OK',
    'STORAGE NVMe 512 GB ........ OK',
    'KEYBOARD ................... OK',
    'DISPLAY .................... <span class="fail">FAIL</span>',
  ];
  crackEls.forEach((c) => (c.style.strokeDasharray = '1 1'));
  gsap.set(crackEls, { strokeDashoffset: 1 });
  gsap.set(shards, { x: 0, y: 0, rotate: 0 });
  gsap.set('.hero-copy > *, .hint, .nav', { autoAlpha: 0 });

  const intro = gsap.timeline({ delay: 0.15 });
  LINES.forEach((l, i) => intro.add(() => { post.innerHTML += l + '\n'; }, i * 0.14));
  intro
    .add(() => $('.loader').classList.add('is-flash'), '+=0.35')
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'expo.inOut' }, '+=0.06')
    .addLabel('impact', '-=0.2')
    .fromTo(stage, { x: 0 }, { keyframes: { x: [-14, 11, -7, 4, 0] }, duration: 0.45, ease: 'none' }, 'impact')
    .to(crackEls, { strokeDashoffset: 0, duration: 0.7, ease: 'expo.out', stagger: (i) => (crackEls[i]._start / maxStart) * 0.5 }, 'impact')
    .to(shards, { x: (i) => shards[i]._off.x, y: (i) => shards[i]._off.y, rotate: (i) => shards[i]._off.r, duration: 0.9, ease: 'expo.out' }, 'impact')
    .from(fx ? '.lcd' : [], { autoAlpha: 0, duration: 0.25 }, 'impact')
    .to('.nav', { autoAlpha: 1, duration: 0.6 }, 'impact+=0.4')
    .fromTo('.hero-copy > *', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 'impact+=0.45')
    .to('.hint', { autoAlpha: 1, duration: 0.6 }, 'impact+=0.9')
    .set('.loader', { display: 'none' });

  /* ---------- 8. The repair journey (pinned, scrubbed) ---------- */
  placeTags();
  const leaderEls = $$('.leader', svg);
  const steps = $$('.step');
  const traceEls = traces.filter((t) => t.classList.contains('trace'));
  const vias = traces.filter((t) => t.classList.contains('via'));
  gsap.set(traceEls, { strokeDashoffset: 1 });
  gsap.set(leaderEls, { autoAlpha: 0 });

  const step = (el) => [el.children[0], el.children[1], el.children[2]];
  const repair = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: '.repair', start: 'top top', end: '+=420%', pin: '.stage', scrub: 1,
      onUpdate: (self) => setMeter(self.progress),
    },
  });
  repair
    // DIAGNOSE: the scan sweeps, faults are tagged on the cracks
    .to('.hero-copy, .hint', { autoAlpha: 0, y: -30, duration: 0.5 }, 0)
    .fromTo('.scan', { autoAlpha: 0, yPercent: -100 }, { autoAlpha: 1, yPercent: 0, duration: 0.2 }, 0.1)
    .to('.scan', { y: () => H * 0.95, duration: 1.4, ease: 'none' }, 0.3)
    .to('.scan', { autoAlpha: 0, duration: 0.2 }, 1.6)
    .to(leaderEls, { autoAlpha: 1, duration: 0.2, stagger: 0.11 }, 0.45)
    .fromTo(tags, { autoAlpha: 0, x: 18, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'expo.out', stagger: 0.22 }, 0.5)
    .set(steps[0], { autoAlpha: 1 }, 0.55)
    .from(step(steps[0]), { yPercent: 60, autoAlpha: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, 0.55)
    // hold the diagnosis, then REWIRE: cracks un-draw while copper draws in the same lines
    .addLabel('rewire', 2.6)
    .to(step(steps[0]), { yPercent: -40, autoAlpha: 0, duration: 0.35, stagger: 0.04 }, 'rewire')
    .to(tags, { autoAlpha: 0, y: -16, duration: 0.3, stagger: 0.05 }, 'rewire')
    .to(leaderEls, { autoAlpha: 0, duration: 0.3 }, 'rewire')
    .to(stage, { '--bg': '#10362a', duration: 0.8 }, 'rewire+=0.1')
    .to('.lcd', { autoAlpha: 0.25, duration: 0.8 }, 'rewire+=0.1')
    .to(crackEls, { strokeDashoffset: -1, duration: 1.1, ease: 'power1.inOut', stagger: (i) => (crackEls[i]._start / maxStart) * 0.5 }, 'rewire+=0.2')
    .to(traceEls, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut', stagger: 0.02 }, 'rewire+=0.3')
    .to(vias, { autoAlpha: 1, duration: 0.3, stagger: 0.01 }, 'rewire+=0.9')
    .set(steps[1], { autoAlpha: 1 }, 'rewire+=0.35')
    .from(step(steps[1]), { yPercent: 60, autoAlpha: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, 'rewire+=0.35')
    // BOOT: shards snap home, traces cool to bone, the screen comes back clean
    .addLabel('boot', 5)
    .to(step(steps[1]), { yPercent: -40, autoAlpha: 0, duration: 0.35, stagger: 0.04 }, 'boot')
    .to(shards, { x: 0, y: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.03 }, 'boot')
    .to(stage, { '--bg': '#0c0d0c', duration: 0.6 }, 'boot+=0.4')
    .to([...traceEls, ...vias], { autoAlpha: 0, duration: 0.6 }, 'boot+=0.5')
    .to('.lcd', { autoAlpha: 1, duration: 0.6 }, 'boot+=0.4')
    .to(heal, { v: 1, duration: 0.8, onUpdate: setHeal }, 'boot+=0.3')
    .set('.plate--base', { opacity: 1 }, 'boot+=1.05')
    .set(shardsWrap, { autoAlpha: 0 }, 'boot+=1.05')
    .fromTo('.plate--base .mark', { textShadow: '0 0 0px rgba(217,122,52,0)' }, { textShadow: '0 0 60px rgba(217,122,52,.45)', duration: 0.3 }, 'boot+=1.05')
    .set(steps[2], { autoAlpha: 1 }, 'boot+=0.6')
    .from(step(steps[2]), { yPercent: 60, autoAlpha: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, 'boot+=0.6')
    .to(step(steps[2]), { autoAlpha: 0, duration: 0.4 }, 'boot+=1.9')
    .to('.plate--base .mark', { textShadow: '0 0 0px rgba(217,122,52,0)', duration: 0.4 }, 'boot+=1.9')
    .to({}, { duration: 0.3 });

  /* ---------- 9. Hand-off: the fixed screen is CAM 05 on a CCTV wall ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.cctv', start: 'top top', end: '+=260%', pin: '.cctv__pin', scrub: 1 },
    });
    tl.fromTo(wall, { scale: 3.04 }, { scale: 1, duration: 1.2, ease: 'power2.inOut' })
      .fromTo('.feed:not(.feed--veda)', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: { each: 0.05, from: 'center' } }, 0.15)
      .to({}, { duration: 0.35 })
      .to(wall, { scale: 0.52, xPercent: -22, duration: 1, ease: 'power2.inOut' })
      .fromTo('.pkg', { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'expo.out' }, '-=0.6')
      .from('.pkg__list li', { autoAlpha: 0, y: 24, stagger: 0.1, duration: 0.5 }, '-=0.5')
      .to({}, { duration: 0.6 });
  });
  mm.add('(max-width: 899px)', () => {
    gsap.fromTo(wall, { scale: 2.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: wall, start: 'top 80%', end: 'center 50%', scrub: 1 } });
  });

  /* ---------- 10. IT services: rows split along hairline cracks ---------- */
  function lineReveal(sel) {
    $$(sel).forEach((el) => {
      if (!window.SplitText) return;
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 82%' } }) });
      return split;
    });
  }
  lineReveal('.it__h');
  lineReveal('.contact__h');
  $$('.row').forEach((row) => {
    const p = $('.row__crack', row)._p;
    p.style.strokeDasharray = '1 1';
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
    tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'expo.out' })
      .from(row.querySelector('h3'), { y: 26, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.1)
      .from(row.querySelector('p'), { y: 20, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.2);
  });

  // velocity-reactive brand marquee
  const mt = $('.marquee__track');
  const mq = gsap.to(mt, { xPercent: -50, repeat: -1, duration: 26, ease: 'none' });
  const skew = gsap.quickTo(mt, 'skewX', { duration: 0.4 });
  if (window.__lenis) window.__lenis.on('scroll', ({ velocity }) => {
    gsap.to(mq, { timeScale: (1 + Math.min(Math.abs(velocity) / 4, 6)) * Math.sign(velocity || 1), duration: 0.3 });
    skew(gsap.utils.clamp(-12, 12, velocity * -0.4));
  });

  // counters
  $$('[data-count]').forEach((b) => {
    const end = +b.dataset.count, o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 90%' },
      onUpdate: () => (b.textContent = Math.round(o.v).toLocaleString('en-IN') + (b.textContent.includes('*') ? '*' : '')) });
    b.textContent = '0' + (b.textContent.includes('*') ? '*' : '');
  });

  /* ---------- 11. Job card: steps tick, stamp slams ---------- */
  const card = gsap.timeline({ scrollTrigger: { trigger: '.card', start: 'top 72%' } });
  card.from('.card', { y: 80, rotate: 4, autoAlpha: 0, duration: 1, ease: 'expo.out' })
    .from('.card__steps li', { autoAlpha: 0, x: -16, duration: 0.5, stagger: 0.12, ease: 'expo.out' }, 0.3)
    .fromTo('.card__steps i', { '--tick': 0 }, { '--tick': 1, duration: 0.3, stagger: 0.22, ease: 'back.out(3)' }, 0.6)
    .fromTo('.stamp', { scale: 2.6, autoAlpha: 0, rotate: -30 }, { scale: 1, autoAlpha: 0.85, rotate: -12, duration: 0.35, ease: 'power4.in' }, '+=0.1')
    .fromTo('.card', { x: 0 }, { keyframes: { x: [-4, 3, 0] }, duration: 0.2 }, '>');

  /* nav switches to ink-on-bone over the job card */
  ScrollTrigger.create({ trigger: '.visit', start: 'top 60px', end: 'bottom 60px',
    toggleClass: { targets: '.nav', className: 'is-light' } });

  /* ---------- 12. Personality ---------- */
  window.motionKit.cursor();
  window.motionKit.magnetic('.btn', 0.3);
  addEventListener('load', () => window.ScrollTrigger && ScrollTrigger.refresh());
})();
