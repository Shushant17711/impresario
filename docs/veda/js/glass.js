/* glass.js — procedural broken glass, copper traces and CCTV scenes for Veda. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';

  function rng(seed) { // mulberry32
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const el = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const d = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');

  /* Crack network from impact (px,py) in a w×h box. */
  function cracks(w, h, px, py, { n = 11, seed = 7, scale = 1 } = {}) {
    const r = rng(seed);
    const R = (a, b) => a + r() * (b - a);
    const m = Math.min(w, h);
    const inside = (x, y, pad = 60) => x > -pad && x < w + pad && y > -pad && y < h + pad;
    const radials = [], branches = [], rings = [], crush = [];
    const step0 = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      let a = i * step0 + R(-0.28, 0.28) * step0 - 0.4;
      const pts = [[px, py]];
      let x = px, y = py, k = 0;
      while (inside(x, y) && k < 200) {
        const s = R(16, 52) * scale * (k < 3 ? 0.6 : 1);
        a += R(-0.22, 0.22);
        x += Math.cos(a) * s; y += Math.sin(a) * s;
        pts.push([x, y]); k++;
        if (k > 2 && r() < 0.16) { // branch
          let ba = a + (r() < 0.5 ? -1 : 1) * R(0.35, 0.9), bx = x, by = y;
          const bp = [[x, y]]; const bl = Math.floor(R(3, 9));
          for (let j = 0; j < bl; j++) { ba += R(-0.25, 0.25); const bs = R(12, 38) * scale; bx += Math.cos(ba) * bs; by += Math.sin(ba) * bs; bp.push([bx, by]); }
          branches.push({ pts: bp, start: Math.hypot(x - px, y - py) });
        }
      }
      // extend to far outside so shard polygons cover the corners
      const far = Math.max(w, h) * 3;
      radials.push({ pts, a, farPt: [x + Math.cos(a) * far, y + Math.sin(a) * far] });
    }
    // spider-web rings
    const nearest = (pts, rad) => { let best = pts[1], bd = 1e9; for (const p of pts) { const dd = Math.abs(Math.hypot(p[0] - px, p[1] - py) - rad); if (dd < bd) { bd = dd; best = p; } } return best; };
    [[0.05, 0.95], [0.12, 0.75], [0.22, 0.5], [0.36, 0.25]].forEach(([f, prob]) => {
      const rad = m * f;
      for (let i = 0; i < n; i++) {
        if (r() > prob) continue;
        const A = nearest(radials[i].pts, rad * R(0.85, 1.15)), B = nearest(radials[(i + 1) % n].pts, rad * R(0.85, 1.15));
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        const bow = R(-0.12, 0.08);
        rings.push({ pts: [A, [mx + (mx - px) * bow, my + (my - py) * bow], B], start: rad });
      }
    });
    for (let i = 0; i < 26; i++) { // crushed centre
      const a = R(0, 6.283), l = R(4, m * 0.035), o = R(0, m * 0.012);
      const x = px + Math.cos(a + 1) * o, y = py + Math.sin(a + 1) * o;
      crush.push({ pts: [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], start: 0 });
    }
    return { radials, branches, rings, crush, px, py, w, h };
  }

  /* Render a crack net into an <svg> group; returns the path list (with .start distance). */
  function drawCracks(g, net, { color = '#ece5d8' } = {}) {
    const out = [];
    const add = (pts, sw, op, start) => {
      const halo = el('path', { d: d(pts), fill: 'none', stroke: color, 'stroke-width': sw * 3.2, 'stroke-opacity': op * 0.08, 'stroke-linecap': 'round', pathLength: 1, class: 'crack crack--halo' });
      const p = el('path', { d: d(pts), fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-opacity': op, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, class: 'crack' });
      g.append(halo, p); halo._start = p._start = start; out.push(halo, p);
    };
    net.crush.forEach((c) => add(c.pts, 0.9, 0.9, 0));
    net.radials.forEach((c) => add(c.pts, 1.5, 0.92, 0));
    net.rings.forEach((c) => add(c.pts, 1, 0.7, c.start));
    net.branches.forEach((c) => add(c.pts, 0.9, 0.6, c.start));
    return out;
  }

  /* Copper PCB traces that follow each radial crack, routed straight + 45°. */
  function drawTraces(g, net, { color = '#d97a34', scale = 1 } = {}) {
    const out = [];
    const route = (a, b) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], mm = Math.min(Math.abs(dx), Math.abs(dy));
      const sx = Math.sign(dx), sy = Math.sign(dy);
      const mid = Math.abs(dx) > Math.abs(dy) ? [a[0] + sx * (Math.abs(dx) - mm), a[1]] : [a[0], a[1] + sy * (Math.abs(dy) - mm)];
      return [mid, b];
    };
    net.radials.forEach((rad, i) => {
      const src = rad.pts.filter((_, k) => k % 3 === 0);
      [0, 1].forEach((lane) => {
        if (lane && i % 2) return;
        const off = lane * 7 * scale;
        const nx = -Math.sin(rad.a) * off, ny = Math.cos(rad.a) * off;
        const pts = [[src[0][0] + nx, src[0][1] + ny]];
        for (let k = 1; k < src.length; k++) pts.push(...route(pts[pts.length - 1], [src[k][0] + nx, src[k][1] + ny]));
        const p = el('path', { d: d(pts), fill: 'none', stroke: color, 'stroke-width': lane ? 1.2 : 2.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1, class: 'trace' });
        g.append(p); out.push(p);
        if (!lane) src.slice(1, -1).forEach((v, k) => { if (k % 2) return;
          const via = el('circle', { cx: v[0] + nx, cy: v[1] + ny, r: 3.2 * scale, fill: 'none', stroke: color, 'stroke-width': 1.4, class: 'via' });
          g.append(via); out.push(via); });
      });
    });
    const pad = el('rect', { x: net.px - 22 * scale, y: net.py - 22 * scale, width: 44 * scale, height: 44 * scale, rx: 4, fill: 'none', stroke: color, 'stroke-width': 2, class: 'via' });
    g.append(pad); out.push(pad);
    return out;
  }

  /* Clip-path polygons (in %) for each wedge between radial cracks. */
  function shardPolys(net) {
    const { radials, px, py, w, h } = net;
    const pc = (p) => (p[0] / w * 100).toFixed(2) + '% ' + (p[1] / h * 100).toFixed(2) + '%';
    return radials.map((A, i) => {
      const B = radials[(i + 1) % radials.length];
      const pts = [[px, py], ...A.pts.slice(1), A.farPt, B.farPt, ...B.pts.slice(1).reverse()];
      const mid = (A.a + B.a) / 2 + (B.a < A.a ? Math.PI : 0);
      return { poly: 'polygon(' + pts.map(pc).join(',') + ')', dir: [Math.cos(mid), Math.sin(mid)] };
    });
  }

  /* CCTV wireframe scenes, 160×90. */
  function scene(kind, seed) {
    const r = rng(seed); const L = [];
    const line = (x1, y1, x2, y2, o = 0.7) => L.push(`<path d="M${x1} ${y1}L${x2} ${y2}" stroke-opacity="${o}"/>`);
    const rect = (x, y, w, h, o = 0.7) => L.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" stroke-opacity="${o}"/>`);
    const vx = 70 + r() * 30, vy = 34 + r() * 10;
    const room = (bw, bh) => { const x = vx - bw / 2, y = vy - bh / 2; rect(x, y, bw, bh, 0.5);
      line(0, 0, x, y, 0.45); line(160, 0, x + bw, y, 0.45); line(0, 90, x, y + bh, 0.45); line(160, 90, x + bw, y + bh, 0.45);
      for (let i = 1; i < 5; i++) { const t = Math.pow(i / 5, 1.6); const yy = y + bh + (90 - y - bh) * t; const xl = x + (0 - x) * t, xr = x + bw + (160 - x - bw) * t; line(xl, yy, xr, yy, 0.25); }
      for (let i = 1; i < 6; i++) { const fx = x + bw * i / 6; line(fx, y + bh, fx + (fx - vx) * 2.4, 90, 0.2); }
      return { x, y, bw, bh }; };
    L.length = 0;
    if (kind === 'counter') { const b = room(56, 30); rect(20, 52, 70, 14); line(20, 52, 34, 46); line(90, 52, 98, 46); line(34, 46, 98, 46); rect(40, 38, 14, 9); rect(110, 20, 30, 40, 0.4); for (let i = 0; i < 4; i++) line(110, 28 + i * 9, 140, 28 + i * 9, 0.35); }
    if (kind === 'shutter') { for (let i = 0; i < 16; i++) line(14, 10 + i * 4.2, 146, 10 + i * 4.2, 0.35 + (i % 2) * 0.2); rect(14, 8, 132, 70, 0.6); line(0, 80, 160, 80, 0.5); rect(70, 70, 20, 4, 0.8); }
    if (kind === 'parking') { line(0, 40, 160, 34, 0.4); for (let i = 0; i < 6; i++) line(10 + i * 30, 90, 30 + i * 22, 40, 0.35); [[22, 52], [92, 48]].forEach(([x, y]) => { rect(x, y, 40, 16); line(x + 8, y, x + 12, y - 8); line(x + 12, y - 8, x + 30, y - 8); line(x + 30, y - 8, x + 34, y); L.push(`<circle cx="${x + 9}" cy="${y + 17}" r="4"/><circle cx="${x + 31}" cy="${y + 17}" r="4"/>`); }); }
    if (kind === 'aisle') { const b = room(30, 40); for (let s = 0; s < 4; s++) { const t = s / 4; line(10 + t * 40, 10 + t * 18, 10 + t * 40, 84 - t * 20, 0.4); line(150 - t * 40, 10 + t * 18, 150 - t * 40, 84 - t * 20, 0.4); } for (let i = 0; i < 5; i++) { line(10, 20 + i * 14, b.x, b.y + i * 9, 0.3); line(150, 20 + i * 14, b.x + b.bw, b.y + i * 9, 0.3); } }
    if (kind === 'desk') { room(70, 34); rect(40, 50, 80, 6); line(46, 56, 46, 76); line(114, 56, 114, 76); rect(64, 32, 32, 18); line(80, 50, 80, 46); rect(18, 18, 22, 24, 0.4); }
    if (kind === 'gate') { line(0, 70, 160, 64, 0.5); for (let i = 0; i < 14; i++) line(20 + i * 9, 18, 20 + i * 9, 68, 0.55); line(18, 18, 146, 18); line(18, 40, 146, 40, 0.4); rect(140, 10, 10, 60, 0.6); }
    if (kind === 'stairs') { let x = 20, y = 84; for (let i = 0; i < 9; i++) { line(x, y, x, y - 8); line(x, y - 8, x + 14, y - 8); x += 14; y -= 8; } line(20, 84, 146, 12, 0.3); line(30, 60, 150, -4, 0.4); }
    if (kind === 'cash') { room(60, 28); rect(26, 46, 108, 18); rect(46, 36, 16, 10); rect(98, 34, 22, 12); line(26, 64, 18, 82); line(134, 64, 142, 82); }
    return `<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" stroke-width=".6">${L.join('')}</svg>`;
  }

  window.glass = { rng, el, cracks, drawCracks, drawTraces, shardPolys, scene };
})();
