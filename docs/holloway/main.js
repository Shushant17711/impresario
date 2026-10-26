/* Holloway Honey Farm — one live pool of honey that rises and darkens through the year. */
(() => {
  const kit = motionKit.init({ lerp: 0.09 });
  const { gsap, lenis, reduced } = kit;
  const html = document.documentElement;
  const motion = !reduced && !!window.ScrollTrigger;
  if (motion) html.classList.add('js-motion');
  const isPhone = matchMedia('(max-width: 760px)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- palette: the honey itself is the accent ---------------- */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const C = {
    cream: hex('#F3EAD3'), ink: hex('#1F130A'), pale: hex('#F4DF9E'),
    blossom: hex('#F1D88C'), bramble: hex('#E3A63A'), heather: hex('#B4661C'),
    ivy: hex('#5A2A0D'), harvest: hex('#D8912C'), bright: hex('#E8A02C'),
  };

  /* ---------------- the honey shader ---------------- */
  const FRAG = `
precision highp float;
uniform float uTime,uScroll,uVel,uLevel,uComb,uDropX,uDropT;
uniform vec2 uRes,uMouse; uniform vec3 uHoney;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y; vec2 p=vec2(uv.x*asp,uv.y); float t=uTime;
  float amp=.006+min(abs(uVel),60.)*.0007;
  float surf=uLevel+amp*sin(p.x*4.+t*.6)+amp*.6*sin(p.x*9.3-t*.9)+amp*.3*sin(p.x*17.+t*1.3);
  float md=p.x-uMouse.x*asp;
  surf+=.03*exp(-md*md*30.)*smoothstep(.3,0.,abs(uMouse.y-uLevel));        // honey leans to the cursor
  float dt=t-uDropT;
  if(dt>0.&&dt<5.){float d=abs(p.x-uDropX*asp);
    surf+=.035*exp(-dt*1.1)*exp(-d*2.5)*sin(d*26.-dt*5.);}                 // slow viscous ripple
  float px=1.5/uRes.y;
  float inside=smoothstep(-px,px,surf-uv.y);
  if(inside<=0.){gl_FragColor=vec4(0.);return;}
  float depth=max(surf-uv.y,0.);
  vec3 top=min(uHoney*1.04+.025,vec3(1.)); vec3 deep=uHoney*.5;
  vec3 col=mix(top,deep,smoothstep(0.,.95,depth));
  float n=noise(vec2(p.x*2.5,depth*3.-t*.04)+noise(p*1.7+t*.02)*1.6);
  col*=.9+.2*n;                                                            // slow internal swirl
  float shaft=pow(.5+.5*sin(p.x*6.+depth*2.5+sin(t*.15)*1.5),10.)*exp(-depth*2.2);
  col+=shaft*.18*top;                                                      // light through honey
  vec2 bp=vec2(p.x*13.,(uv.y-t*.01)*13.); vec2 bi=floor(bp); vec2 bf=fract(bp)-.5;
  if(h21(bi)>.83){vec2 o=(vec2(h21(bi+3.),h21(bi+7.))-.5)*.5; float b=length(bf-o); float r=.05+.06*h21(bi+11.);
    col+=(smoothstep(r,r-.02,b)-smoothstep(r-.025,r-.05,b))*.3*top*smoothstep(0.,.05,depth);}
  if(uComb>0.){vec2 s=vec2(1.,1.732); vec2 q=p*9.; vec2 a=mod(q,s)-s*.5; vec2 b2=mod(q-s*.5,s)-s*.5;
    vec2 g=dot(a,a)<dot(b2,b2)?a:b2; vec2 ag=abs(g); float hx=max(dot(ag,normalize(vec2(1.,1.732))),ag.x);
    col=mix(col,deep*.75,smoothstep(.43,.49,hx)*uComb*.75);
    col+=top*.08*uComb*(1.-smoothstep(0.,.45,hx));}                      // the frame's comb cells
  float e=(surf-uv.y)/px;
  col+=smoothstep(5.,0.,e)*.35; col=mix(col,top,smoothstep(40.,0.,e)*.35);  // meniscus
  col+=(h21(gl_FragCoord.xy+fract(t*7.))-.5)*.045;                         // grain
  gl_FragColor=vec4(col,inside);
}`;
  let fx = null;
  try {
    fx = motionKit.shader($('#honey'), FRAG, { uLevel: 0, uHoney: C.pale.slice(), uComb: 0, uDropX: 0.5, uDropT: -10 });
  } catch (err) { $('#honey').style.display = 'none'; }
  const t0 = performance.now();
  const clock = () => (performance.now() - t0) / 1000;
  const splash = (x) => { if (fx) { fx.uniforms.uDropX.value = x; fx.uniforms.uDropT.value = clock(); } };

  /* ---------------- world state: keyframes along the scroll ---------------- */
  const world = { level: 0, honey: C.pale.slice(), bg: C.cream.slice(), comb: 0, pfund: 12 };
  const keys = [];
  let introDone = !motion;
  const LS = isPhone ? 0.62 : 1; // phone: keep honey below the copy
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  function sample(y) {
    const list = keys.map((k) => ({ ...k, y: k.at() })).sort((a, b) => a.y - b.y);
    let a = list[0], b = list[list.length - 1];
    if (y <= a.y) b = a; else if (y >= b.y) a = b;
    else for (let i = 0; i < list.length - 1; i++) if (y >= list[i].y && y < list[i + 1].y) { a = list[i]; b = list[i + 1]; break; }
    const t = a === b ? 0 : ease((y - a.y) / (b.y - a.y));
    return {
      level: lerp(a.level, b.level, t), comb: lerp(a.comb || 0, b.comb || 0, t), pfund: lerp(a.pfund, b.pfund, t),
      honey: a.honey.map((v, i) => lerp(v, b.honey[i], t)), bg: a.bg.map((v, i) => lerp(v, b.bg[i], t)),
    };
  }
  const K = (at, level, honey, bg, pfund, comb = 0) => keys.push({ at, level, honey, bg, pfund, comb });
  const scrollPos = () => (lenis ? lenis.scroll : scrollY);
  const pfundName = (mm) => mm <= 8 ? 'Water white' : mm <= 17 ? 'Extra white' : mm <= 34 ? 'White' : mm <= 50 ? 'Extra light amber' : mm <= 85 ? 'Light amber' : mm <= 114 ? 'Amber' : 'Dark amber';
  const rgb = (c) => `rgb(${c.map((v) => Math.round(v * 255)).join(',')})`;
  const needle = $('.gauge__needle'), mmEl = $('.gauge__mm'), nameEl = $('.gauge__name');
  let lastName = '';

  function render(snap) {
    const k = snap ? 1 : 0.055; // viscous lag
    const tg = sample(scrollPos());
    const lvl = introDone ? tg.level : Math.min(tg.level, world.level);
    world.level += (lvl - world.level) * k;
    world.comb += (tg.comb - world.comb) * k * 1.5;
    world.pfund += (tg.pfund - world.pfund) * k * 1.5;
    world.honey = world.honey.map((v, i) => v + (tg.honey[i] - v) * k);
    world.bg = world.bg.map((v, i) => v + (tg.bg[i] - v) * 0.12 * (snap ? 8.4 : 1));
    if (fx) {
      fx.uniforms.uLevel.value = world.level; fx.uniforms.uHoney.value = world.honey; fx.uniforms.uComb.value = world.comb;
      if (reduced) fx.redraw();
    }
    html.style.setProperty('--bg', rgb(world.bg));
    const lum = world.bg[0] * 0.3 + world.bg[1] * 0.59 + world.bg[2] * 0.11;
    html.style.setProperty('--nav-ink', lum < 0.45 && world.level < 0.9 ? '#F3EAD3' : '#1F130A');
    needle.style.left = `${Math.min(100, (world.pfund / 140) * 100)}%`;
    mmEl.textContent = Math.round(world.pfund);
    const nm = pfundName(world.pfund);
    if (nm !== lastName) { nameEl.textContent = nm; lastName = nm; }
  }

  /* ---------------- flora: four hand-built SVG states ---------------- */
  const svgNS = 'http://www.w3.org/2000/svg';
  const flora = $('.flora');
  const el = (tag, attrs, parent) => { const n = document.createElementNS(svgNS, tag); for (const a in attrs) n.setAttribute(a, attrs[a]); parent && parent.appendChild(n); return n; };
  function flower(g, cx, cy, r, { petal = '#FFF8EC', edge = '#E9BFC0', centre = '#E7B347', n = 5, rot = 0 } = {}) {
    const f = el('g', { transform: `translate(${cx} ${cy}) rotate(${rot})` }, g);
    for (let i = 0; i < n; i++) el('ellipse', { class: 'b', cx: 0, cy: -r * 0.58, rx: r * 0.48, ry: r * 0.6, fill: petal, stroke: edge, 'stroke-width': 1.6, transform: `rotate(${(360 / n) * i})` }, f);
    el('circle', { class: 'b', r: r * 0.24, fill: centre }, f);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; el('circle', { class: 'b', cx: Math.cos(a) * r * 0.32, cy: Math.sin(a) * r * 0.32, r: 2.2, fill: '#8A5A1E' }, f); }
  }
  const leaf = (g, x, y, rx, ry, rot, fill = '#7C8B3E') => el('ellipse', { class: 'b', cx: x, cy: y, rx, ry, fill, transform: `rotate(${rot} ${x} ${y})` }, g);
  const art = [0, 1, 2, 3].map((i) => el('g', { class: `art art${i}` }, flora));
  // 0 — April blossom
  (() => { const g = art[0];
    el('path', { class: 'b stem', d: 'M10 370 C120 310 160 250 250 205 S350 130 392 62', stroke: '#5B3A1E', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('path', { class: 'b stem', d: 'M205 228 C190 185 172 155 150 132', stroke: '#5B3A1E', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('path', { class: 'b stem', d: 'M300 162 C322 196 330 232 322 270', stroke: '#5B3A1E', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
    [[110, 330, 26, 12, -30], [180, 268, 24, 11, 40], [270, 212, 22, 10, -50], [355, 120, 22, 10, 30], [235, 150, 18, 9, -70]].forEach((l) => leaf(g, ...l));
    flower(g, 150, 126, 36, { rot: 10 }); flower(g, 252, 200, 44, { rot: -8 }); flower(g, 332, 98, 30, { rot: 25 }); flower(g, 322, 278, 30, { rot: 40 });
    [[95, 300], [210, 175], [370, 70], [290, 250]].forEach(([x, y]) => el('circle', { class: 'b', cx: x, cy: y, r: 8, fill: '#EFB4BB' }, g));
  })();
  // 1 — June bramble & clover
  (() => { const g = art[1];
    el('path', { class: 'b stem', d: 'M30 392 C60 220 200 130 372 178', stroke: '#6D3B2A', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, g);
    for (let i = 0; i < 9; i++) { const x = 60 + i * 34, y = 300 - Math.sin(i / 2.4) * 120; el('path', { class: 'b', d: `M${x} ${y} l7 -12 l4 13z`, fill: '#6D3B2A' }, g); }
    [[120, 240, 30, 13, -40], [250, 150, 28, 12, 20], [330, 200, 26, 12, 60]].forEach((l) => leaf(g, ...l, '#6E7F36'));
    flower(g, 175, 175, 40, { petal: '#F8E9EC', edge: '#DDB0BC', centre: '#D7C27A' }); flower(g, 290, 140, 30, { petal: '#F8E9EC', edge: '#DDB0BC', centre: '#D7C27A', rot: 30 });
    [[350, 190], [362, 206], [345, 210], [358, 222], [340, 226], [372, 220], [352, 238]].forEach(([x, y]) => el('circle', { class: 'b', cx: x, cy: y, r: 9, fill: '#3A1E2E', stroke: '#5C3448', 'stroke-width': 2 }, g));
    el('path', { class: 'b stem', d: 'M95 400 C100 360 98 330 102 300', stroke: '#6E7F36', 'stroke-width': 5, fill: 'none' }, g);
    for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 14 - ring * 4; i++) {
      const a = (i / (14 - ring * 4)) * Math.PI * 2, rr = 26 - ring * 9;
      el('ellipse', { class: 'b', cx: 102 + Math.cos(a) * rr, cy: 280 + Math.sin(a) * rr * 0.9, rx: 7, ry: 11, fill: ring % 2 ? '#E8A9B9' : '#D88DA2', transform: `rotate(${(a * 180) / Math.PI + 90} ${102 + Math.cos(a) * rr} ${280 + Math.sin(a) * rr * 0.9})` }, g);
    }
    [[150, 345], [172, 330], [170, 358]].forEach(([x, y]) => el('circle', { class: 'b', cx: x, cy: y, r: 13, fill: '#6E7F36' }, g));
  })();
  // 2 — August heather
  (() => { const g = art[2];
    [[90, 140, -20], [160, 70, -6], [235, 95, 8], [305, 150, 22]].forEach(([x, top, lean], s) => {
      const d = `M${x + 20} 400 C${x + 10} 320 ${x - lean * 0.5} 240 ${x + lean} ${top}`;
      el('path', { class: 'b stem', d, stroke: '#5E4A2C', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      for (let i = 0; i < 15; i++) {
        const tt = i / 14, y = lerp(top + 6, 330, tt), xx = lerp(x + lean, x + 10, tt) + (i % 2 ? 9 : -9);
        el('ellipse', { class: 'b', cx: xx, cy: y, rx: 7 - tt * 2, ry: 9 - tt * 2, fill: (i + s) % 3 ? '#B36A9A' : '#D093BB' }, g);
      }
    });
  })();
  // 3 — October ivy
  (() => { const g = art[3];
    el('path', { class: 'b stem', d: 'M20 380 C120 340 110 250 200 230 S330 200 370 120', stroke: '#4A3A22', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
    const ivyLeaf = (x, y, s, r, f) => { const p = el('path', { class: 'b', d: 'M0 -40 L12 -14 L36 -18 L22 4 L30 30 L0 18 L-30 30 L-22 4 L-36 -18 L-12 -14Z', fill: f, stroke: f, 'stroke-width': 8, 'stroke-linejoin': 'round', transform: `translate(${x} ${y}) rotate(${r}) scale(${s})` }, g); return p; };
    ivyLeaf(90, 330, 1.1, -20, '#3F4A24'); ivyLeaf(170, 270, 0.9, 15, '#56602F'); ivyLeaf(290, 230, 1.0, -10, '#3F4A24'); ivyLeaf(330, 330, 0.8, 30, '#56602F'); ivyLeaf(60, 230, 0.7, -40, '#56602F');
    [[200, 130], [290, 100], [250, 170]].forEach(([cx, cy]) => {
      for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i / 11 - 0.5) * 2.6, r = 34 + (i % 2) * 6;
        el('line', { class: 'b', x1: cx, y1: cy + 40, x2: cx + Math.cos(a) * r, y2: cy + 40 + Math.sin(a) * r, stroke: '#7C7A3A', 'stroke-width': 2 }, g);
        el('circle', { class: 'b', cx: cx + Math.cos(a) * r, cy: cy + 40 + Math.sin(a) * r, r: 7, fill: '#C8C26A', stroke: '#8F8B3E', 'stroke-width': 1.5 }, g); }
    });
  })();
  // the bee
  const bee = el('g', { class: 'bee' }, flora);
  const beeBody = el('g', { class: 'bee__body' }, bee);
  el('ellipse', { class: 'bee__wing', cx: -4, cy: -12, rx: 9, ry: 13, fill: 'rgba(255,255,255,.75)', stroke: '#1F130A', 'stroke-width': 1.5 }, beeBody);
  el('ellipse', { class: 'bee__wing', cx: 7, cy: -11, rx: 8, ry: 12, fill: 'rgba(255,255,255,.75)', stroke: '#1F130A', 'stroke-width': 1.5 }, beeBody);
  el('ellipse', { cx: 0, cy: 0, rx: 15, ry: 10, fill: '#E8A02C', stroke: '#1F130A', 'stroke-width': 2 }, beeBody);
  el('path', { d: 'M-4 -9.5v19M4 -9v18', stroke: '#1F130A', 'stroke-width': 4 }, beeBody);
  el('circle', { cx: 16, cy: -1, r: 6, fill: '#1F130A' }, beeBody);
  const BEE = [[252, 200], [175, 175], [235, 95], [250, 170]];
  if (!motion) { art.forEach((g, i) => i && g.setAttribute('opacity', 0)); bee.setAttribute('transform', `translate(${BEE[0]})`); }
  const wingStyle = document.createElement('style');
  wingStyle.textContent = `.bee__wing{transform-box:fill-box;transform-origin:50% 100%;animation:buzz .07s infinite alternate}@keyframes buzz{to{transform:scaleY(.45)}}.flora .b{transform-box:fill-box;transform-origin:50% 50%}@media (prefers-reduced-motion:reduce){.bee__wing{animation:none}}`;
  document.head.appendChild(wingStyle);

  /* ---------------- basket ---------------- */
  const ITEMS = { blossom: ['Spring Blossom', 8], bramble: ['Bramble & Clover', 9], heather: ['Late Heather', 13] };
  const basket = {};
  const list = $('.order__list'), countEl = $('.nav__count'), totalEl = $('.order__total b'), send = $('.order__send');
  function renderBasket() {
    const entries = Object.entries(basket).filter(([, q]) => q > 0);
    const count = entries.reduce((s, [, q]) => s + q, 0);
    const total = entries.reduce((s, [k, q]) => s + ITEMS[k][1] * q, 0);
    countEl.textContent = count; totalEl.textContent = `£${total}`;
    list.innerHTML = entries.length ? entries.map(([k, q]) => `<li><span>${ITEMS[k][0]} <small>· £${ITEMS[k][1]}</small></span><span class="qty"><button type="button" data-k="${k}" data-d="-1" aria-label="One fewer ${ITEMS[k][0]}">−</button><b>${q}</b><button type="button" data-k="${k}" data-d="1" aria-label="One more ${ITEMS[k][0]}">+</button></span></li>`).join('')
      : '<li class="order__empty">Nothing yet — the jars are <a href="#jars">up there</a>.</li>';
    const body = entries.map(([k, q]) => `${q} × ${ITEMS[k][0]} (£${ITEMS[k][1] * q})`).join('\n');
    send.href = `mailto:hello@hollowayhoney.example?subject=${encodeURIComponent('Honey order')}&body=${encodeURIComponent(`Hello Holloways,\n\nI'd like:\n${body || '(tell us what you fancy)'}\nTotal £${total}\n\nPost / collect from the stand:\nName:\nAddress:\n`)}`;
  }
  $$('.add').forEach((b) => b.addEventListener('click', () => {
    const k = b.closest('.jar').dataset.item; basket[k] = (basket[k] || 0) + 1; renderBasket();
    b.textContent = `In basket · ${basket[k]}`;
    if (!motion) return;
    const r = b.getBoundingClientRect(), to = countEl.getBoundingClientRect();
    const d = document.createElement('i'); d.className = 'fly-drop'; document.body.appendChild(d);
    gsap.set(d, { x: r.left + r.width / 2, y: r.top });
    gsap.timeline({ onComplete: () => { d.remove(); gsap.fromTo(countEl, { scale: 1.6 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1,0.4)' }); } })
      .to(d, { x: to.left + to.width / 2, duration: 0.8, ease: 'power1.inOut' })
      .to(d, { y: to.top + to.height / 2, duration: 0.8, ease: 'back.in(1.6)' }, 0);
  }));
  list.addEventListener('click', (e) => { const b = e.target.closest('button[data-k]'); if (!b) return;
    basket[b.dataset.k] = Math.max(0, (basket[b.dataset.k] || 0) + Number(b.dataset.d)); renderBasket(); });
  renderBasket();

  /* ---------------- no-motion path ---------------- */
  if (!motion) {
    K(() => 0, 0.12, C.pale, C.cream, 20);
    K(() => document.documentElement.scrollHeight - innerHeight - 1, 0.12, C.bright, C.ink, 20);
    const close = $('.close');
    K(() => close.offsetTop - innerHeight, 0.12, C.bramble, C.cream, 20);
    addEventListener('scroll', () => render(true), { passive: true });
    render(true);
    return;
  }

  /* ---------------- personality layer ---------------- */
  motionKit.cursor(); motionKit.magnetic('.btn, .hero__cue', 0.3);

  /* ---------------- THE YEAR (pinned, scrubbed) ---------------- */
  const seasons = $$('.season');
  const parts = (s) => [$('.season__name', s), $('.season__notes', s), $('.season__meta', s)];
  seasons.forEach((s, i) => { if (i) { gsap.set($('.season__month .mask > span', s), { yPercent: 140 }); gsap.set(parts(s), { autoAlpha: 0, y: 40 }); } });
  art.forEach((g, i) => { if (i) gsap.set($$('.b', g), { scale: 0, autoAlpha: 0 }); });
  gsap.set(bee, { x: BEE[0][0] - 120, y: BEE[0][1] - 140 });
  const year = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: {
    trigger: '.year', start: 'top top', end: () => `+=${innerHeight * (isPhone ? 3 : 4)}`, pin: '.year__stage', scrub: 1, anticipatePin: 1 } });
  year.fromTo('.year__progress', { scaleX: 0.19 }, { scaleX: 1, ease: 'none', duration: 10 }, 0);
  year.to(bee, { x: BEE[0][0], y: BEE[0][1], duration: 1.2 }, 0);
  [2.25, 4.75, 7.25].forEach((at, i) => {
    const from = seasons[i], to = seasons[i + 1];
    year.to($('.season__month .mask > span', from), { yPercent: -140, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, at)
      .to(parts(from), { autoAlpha: 0, y: -30, duration: 0.5, stagger: 0.06, ease: 'power2.in' }, at)
      .to($$('.b', art[i]), { scale: 0, autoAlpha: 0, duration: 0.6, stagger: { each: 0.004, from: 'random' }, ease: 'power2.in' }, at)
      .to($('.season__month .mask > span', to), { yPercent: 0, duration: 0.9, ease: 'expo.out' }, at + 0.6)
      .to(parts(to), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, at + 0.75)
      .to($$('.b', art[i + 1]), { scale: 1, autoAlpha: 1, duration: 0.9, stagger: { each: 0.006, from: 'start' }, ease: 'back.out(1.7)' }, at + 0.5)
      .to(bee, { x: BEE[i + 1][0], duration: 1.4, ease: 'power1.inOut' }, at + 0.2)
      .to(bee, { keyframes: { y: [BEE[i][1], BEE[i][1] - 90, BEE[i + 1][1]] }, duration: 1.4, ease: 'none' }, at + 0.2);
  });
  year.to({}, { duration: 0.6 });
  const yearST = year.scrollTrigger;

  /* ---------------- HARVEST → JARS (pinned, scrubbed) ---------------- */
  const fills = $$('.jar__fill');
  gsap.set(fills, { scaleY: 0 });
  gsap.set('.jar', { opacity: 0, y: 60 });
  gsap.set(['.harvest__h', '.jars__also'], { opacity: 0 });
  gsap.set($$('.jar h3, .jar p, .jar .btn'), { opacity: 0, y: 16 });
  let titleChars = $$('.harvest__title .mask > span');
  if (window.SplitText) titleChars = SplitText.create('.harvest__title .mask > span', { type: 'chars' }).chars;
  gsap.set(titleChars, { yPercent: 115 });
  gsap.set('.harvest__sub .mask > span', { yPercent: 115 });
  const harvest = gsap.timeline({ scrollTrigger: {
    trigger: '.harvest', start: 'top top', end: () => `+=${innerHeight * (isPhone ? 2.2 : 2.6)}`, pin: '.harvest__stage', scrub: 1, anticipatePin: 1 } });
  harvest.to({}, { duration: 10 }, 0)
    .to(titleChars, { yPercent: 0, duration: 1.2, stagger: 0.07, ease: 'expo.out' }, 1.2)
    .to('.harvest__sub .mask > span', { yPercent: 0, duration: 1, stagger: 0.2, ease: 'expo.out' }, 2.2)
    .to(titleChars, { yPercent: -115, duration: 0.8, stagger: 0.03, ease: 'power2.in' }, 4.3)
    .to('.harvest__sub .mask > span', { yPercent: -115, duration: 0.7, stagger: 0.1, ease: 'power2.in' }, 4.3)
    .to('.harvest__h', { opacity: 1, duration: 0.6 }, 5)
    .to('.jar', { opacity: 1, y: 0, duration: 1, stagger: 0.18, ease: 'expo.out' }, 4.8)
    .to(fills, { scaleY: 1, duration: 3.2, stagger: 0.35, ease: 'power1.inOut' }, 5.3)
    .to($$('.jar h3, .jar p, .jar .btn'), { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out' }, 8)
    .to('.jars__also', { opacity: 1, duration: 0.6 }, 9);
  const harvestST = harvest.scrollTrigger;
  // keyboard users tabbing into the shop land on the filled jars
  $('.jars').addEventListener('focusin', () => {
    if (harvest.progress() < 0.95) { const y = harvestST.end - 4; lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }
  });

  /* gauge visibility */
  ScrollTrigger.create({ trigger: '.year', start: 'top 40%', endTrigger: '.harvest', end: () => `top+=${innerHeight * 0.9} top`,
    onToggle: (self) => gsap.to('.gauge', { autoAlpha: self.isActive ? 1 : 0, y: self.isActive ? 0 : 20, duration: 0.5 }) });

  /* ---------------- world keyframes ---------------- */
  const at = (st, p) => () => st.start + (st.end - st.start) * p;
  const close = $('.close');
  const closeST = ScrollTrigger.create({ trigger: close, start: 'top bottom', end: 'top 35%' });
  const maxScroll = () => ScrollTrigger.maxScroll(window);
  K(() => 0, 0.2 * LS, C.pale, C.cream, 12);
  K(at(yearST, 0), 0.22 * LS, C.blossom, C.cream, 20);
  K(at(yearST, 0.12), 0.22 * LS, C.blossom, C.cream, 20);
  K(at(yearST, 0.37), 0.28 * LS, C.bramble, C.cream, 48);
  K(at(yearST, 0.62), 0.33 * LS, C.heather, C.cream, 95);
  K(at(yearST, 0.88), 0.38 * LS, C.ivy, C.cream, 130);
  K(at(harvestST, 0), 0.42 * LS, C.ivy, C.cream, 130);
  K(at(harvestST, 0.3), 1.15, C.harvest, C.cream, 85, 1);
  K(at(harvestST, 0.45), 1.15, C.harvest, C.cream, 85, 1);
  K(at(harvestST, 0.82), -0.02, C.harvest, C.cream, 85, 0);
  K(at(closeST, 0), -0.02, C.bright, C.cream, 85);
  K(at(closeST, 1), 0.06, C.bright, C.ink, 85);
  K(() => Math.max(closeST.end + 1, maxScroll()), 0.24, C.bright, C.ink, 85);

  /* ---------------- supporting reveals ---------------- */
  $$('.reveal').forEach((h) => {
    const tl = kit.revealLines(h, { stagger: 0.1 }); tl.pause(0);
    ScrollTrigger.create({ trigger: h, start: 'top 82%', once: true, onEnter: () => tl.play() });
  });
  $$('.people li').forEach((li) => {
    gsap.fromTo(li, { '--line': 0 }, { '--line': 1, ease: 'none', scrollTrigger: { trigger: li, start: 'top 92%', end: 'top 60%', scrub: true } });
    gsap.from($('.people__name', li), { clipPath: 'inset(0 100% 0 0)', xPercent: -6, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 80%' } });
    gsap.from($('p', li), { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 80%' } });
  });
  gsap.from('.promise__body', { y: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.promise__body', start: 'top 88%' } });
  // the lane draws itself
  $$('.lane path').forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
  const laneTl = gsap.timeline({ scrollTrigger: { trigger: '.lane', start: 'top 85%', end: 'bottom 55%', scrub: 1 } });
  laneTl.to('.lane path', { strokeDashoffset: 0, ease: 'none', duration: 4 }, 0)
    .from('.pin', { scale: 0, autoAlpha: 0, transformOrigin: '0 0', stagger: 0.9, duration: 0.5, ease: 'back.out(2)' }, 0.4);
  gsap.from('.order > *', { y: 50, autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.order', start: 'top 80%' } });
  gsap.from('.close__word span', { yPercent: 60, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.close__word', start: 'top 92%' } });

  /* velocity marquee of forage */
  const mq = gsap.to('.forage__track', { xPercent: -50, repeat: -1, duration: 28, ease: 'none' });
  if (lenis) lenis.on('scroll', ({ velocity }) => {
    gsap.to(mq, { timeScale: 1 + Math.min(Math.abs(velocity) / 3, 8) * Math.sign(velocity || 1), duration: 0.4 });
    gsap.to('.forage__track', { skewX: gsap.utils.clamp(-10, 10, velocity * -0.35), duration: 0.5 });
  });

  /* anchors: land where the story makes sense */
  const anchorTarget = { '#year': () => yearST.start, '#jars': () => harvestST.end - 2, '#top': () => 0 };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const h = a.getAttribute('href'); const tgt = anchorTarget[h] ? anchorTarget[h]() : (document.querySelector(h) && h);
    if (tgt === null || tgt === undefined || !lenis) return;
    e.preventDefault(); lenis.scrollTo(tgt, { duration: 1.6 });
    const focusEl = document.querySelector(h); if (focusEl) { focusEl.setAttribute('tabindex', '-1'); focusEl.focus({ preventScroll: true }); }
  }));

  /* closing toy: drop honey into the pool */
  close.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    const surfaceY = innerHeight * (1 - world.level);
    const d = document.createElement('i'); d.className = 'toy-drop'; document.body.appendChild(d);
    gsap.set(d, { x: e.clientX, y: e.clientY });
    gsap.to(d, { y: Math.max(surfaceY, e.clientY + 10), scaleY: 1.4, duration: Math.max(0.25, (surfaceY - e.clientY) / 1400), ease: 'power2.in',
      onComplete: () => { splash(e.clientX / innerWidth); d.remove(); } });
  });

  /* ---------------- opening ritual ---------------- */
  const drop = $('.intro__drop');
  gsap.set('.hero__line', { yPercent: 115 });
  gsap.set(['.hero__eyebrow', '.hero__foot'], { autoAlpha: 0, y: 24 });
  lenis && lenis.stop();
  gsap.timeline({ delay: 0.25 })
    .to(drop, { scaleY: 1, duration: 0.9, ease: 'power2.in' })
    .to(drop, { y: () => innerHeight * (1 - 0.2 * LS) - 110, scaleY: 0.8, duration: 0.5, ease: 'power3.in' })
    .add(() => { introDone = true; world.level = 0.04; splash(0.5); gsap.set(drop, { autoAlpha: 0 }); })
    .to('.hero__word .hero__line', { yPercent: 0, duration: 1.5, ease: 'expo.out' }, '-=0.05')
    .to('.hero__tag .hero__line', { yPercent: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out' }, '<0.3')
    .to(['.hero__eyebrow', '.hero__foot'], { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, '<0.2')
    .add(() => lenis && lenis.start(), '<');

  gsap.ticker.add(() => render(false));
  window.__holloway = { world, keys, yearST, harvestST, render }; // for screenshots / debugging
})();
