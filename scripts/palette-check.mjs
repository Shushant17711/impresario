#!/usr/bin/env node
// Palette check on what the visitor actually sees, measured from shoot.mjs frames.
//   node <skill>/scripts/palette-check.mjs [shotsDir=.impresario/shots] [tag]
// Reports the rendered palette by share (OKLCH) and fails on generated-default families:
// paper+ink+ember, graphite+ember/neon, violet/indigo wash, and neutral-led pages where
// the subject's colour never shows up. Exit 1 = default family found and no exception
// written in .impresario/direction.md ("PALETTE EXCEPTION: <subject reason>").
import fs from 'node:fs';
import path from 'node:path';
import { colourHistogram } from './lib/png.mjs';

const [dir = '.impresario/shots', tag = ''] = process.argv.slice(2);
if (dir === '--help') { console.log('usage: node palette-check.mjs [shotsDir] [tag]'); process.exit(0); }

// ---- colour maths (sRGB -> OKLab -> OKLCH)
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export function oklch([r8, g8, b8]) {
  const r = lin(r8), g = lin(g8), b = lin(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI; if (H < 0) H += 360;
  return { L, C, H };
}

// ---- classification
const NEUTRAL_C = 0.04;
export const isWarmPaper = (c) => c.L > 0.86 && c.C < 0.06 && c.H > 50 && c.H < 115;
export const isPaleNeutral = (c) => c.L > 0.86 && c.C < NEUTRAL_C;
export const isNearBlack = (c) => c.L < 0.27 && c.C < 0.035;
export const isEmber = (c) => c.C > 0.11 && c.H >= 18 && c.H <= 75 && c.L > 0.5;   // red-orange-amber
export const isNeon = (c) => c.C > 0.17 && c.H > 110 && c.H < 200 && c.L > 0.7;    // acid lime/mint
export const isViolet = (c) => c.C > 0.08 && c.H >= 265 && c.H <= 315;

export function analyse(colours) {
  const tot = colours.reduce((s, c) => s + c.count, 0) || 1;
  const px = colours.map((c) => ({ ...c, share: c.count / tot, o: oklch(c.rgb) }));
  const sum = (f) => px.filter((p) => f(p.o)).reduce((s, p) => s + p.share, 0);
  const neutral = sum((o) => o.C < NEUTRAL_C);
  const chroma = px.filter((p) => p.o.C >= NEUTRAL_C);
  const chromaTot = chroma.reduce((s, p) => s + p.share, 0) || 1e-9;
  // hue families of the chromatic pixels (30° bins)
  const hues = new Map();
  for (const p of chroma) { const k = Math.floor(p.o.H / 30) * 30; hues.set(k, (hues.get(k) || 0) + p.share); }
  const hueList = [...hues].sort((a, b) => b[1] - a[1]).map(([h, s]) => ({ h, share: s / chromaTot }));
  const ground = px[0];
  const s = {
    neutral, chromatic: 1 - neutral,
    warmPaper: sum(isWarmPaper), paleNeutral: sum(isPaleNeutral), nearBlack: sum(isNearBlack),
    ember: sum(isEmber), neon: sum(isNeon), violet: sum(isViolet),
  };
  const emberOfChroma = s.ember / chromaTot, neonOfChroma = s.neon / chromaTot;
  const flags = [];
  const lightBase = s.paleNeutral + s.warmPaper * 0.5;
  if (lightBase > 0.3 && s.nearBlack > 0.04 && emberOfChroma > 0.35)
    flags.push('paper+ink+ember: pale/cream ground, near-black ink, red-orange-amber accent. This is the default "tasteful editorial" palette every model reaches for.');
  if (s.nearBlack > 0.4 && (emberOfChroma > 0.4 || neonOfChroma > 0.4))
    flags.push('graphite+ember/neon: near-black ground with one hot orange or acid accent. Default "dark tech" palette.');
  if (s.violet / chromaTot > 0.45 && s.chromatic > 0.1)
    flags.push('violet/indigo-led: purple-blue dominates the colour. Default AI-startup palette.');
  if (neutral > 0.86)
    flags.push(`neutral-led: ${(neutral * 100).toFixed(0)}% of rendered pixels are grey/cream/black. The subject's colour is a garnish, not the world.`);
  if (hueList.length && hueList[0].share > 0.9 && s.chromatic < 0.2)
    flags.push('one-accent-only: a single hue carries all colour on a neutral page (neutral + "one accent" recipe).');
  // rainbow: many strong hue families each holding real area, none governing
  const strong = hueList.filter((h) => h.share > 0.06);
  if (s.chromatic > 0.3 && strong.length >= 5 && hueList[0].share < 0.45)
    flags.push(`rainbow: ${strong.length} hue families each >6% of colour and none governs (top ${(hueList[0].share * 100).toFixed(0)}%). A list of colours, not a palette — see colour.md §3b.`);
  return { s, hueList, ground, top: px.slice(0, 12), flags };
}

// ---- ground churn: how often the page's dominant background changes frame to frame
export function oklabDist(a, b) {
  const ab = (o) => [o.L, o.C * Math.cos((o.H * Math.PI) / 180), o.C * Math.sin((o.H * Math.PI) / 180)];
  const [x, y] = [ab(a), ab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}
export function groundChanges(grounds, threshold = 0.12) {
  const changes = [];
  for (let i = 1; i < grounds.length; i++)
    if (oklabDist(grounds[i - 1].o, grounds[i].o) > threshold) changes.push(i);
  const distinct = [];
  for (const g of grounds) if (!distinct.some((d) => oklabDist(d.o, g.o) <= threshold)) distinct.push(g);
  return { changes, distinct };
}

// ---- main
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  if (!fs.existsSync(dir)) { console.error(`no shots at ${dir} - run shoot.mjs first`); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png') && !f.includes('-sheet') && f.startsWith(tag) && !f.includes('-reduced-'));
  if (!files.length) { console.error('no frames matched'); process.exit(2); }
  const merged = new Map();
  for (const f of files) {
    const { colours } = colourHistogram(fs.readFileSync(path.join(dir, f)), { quantize: 16, step: 4 });
    for (const c of colours) {
      const m = merged.get(c.hex) || { hex: c.hex, rgb: c.rgb, count: 0 };
      m.count += c.count; merged.set(c.hex, m);
    }
  }
  const colours = [...merged.values()].sort((a, b) => b.count - a.count);
  const r = analyse(colours);
  // dominant ground per desktop frame, in scroll order
  const desk = files.filter((f) => f.includes('-desktop-')).sort();
  const grounds = desk.map((f) => {
    const { colours: c } = colourHistogram(fs.readFileSync(path.join(dir, f)), { quantize: 16, step: 6 });
    return { f, hex: c[0].hex, o: oklch(c[0].rgb), share: c[0].share };
  });
  const gc = groundChanges(grounds);
  console.log(`ground sequence (desktop): ${grounds.map((g) => g.hex).join(' → ')}`);
  console.log(`ground changes: ${gc.changes.length} · distinct grounds: ${gc.distinct.length}`);
  if (gc.changes.length >= 3 && gc.changes.length <= 4 && gc.distinct.length <= 3)
    console.log('WARN ground changes 3–4: fine only if they are ≤2 named, scrubbed events (e.g. a flood that drains back). Reviewer must confirm.');
  if (gc.changes.length > 4 || gc.distinct.length > 3)
    r.flags.push(`ground-churn: the page background changes ${gc.changes.length}× across ${gc.distinct.length} grounds. That's a slideshow, not a world. Keep one home ground for ≥70% of the scroll, with ≤2 named, scrubbed ground events (colour.md §3c).`);
  const pct = (x) => (x * 100).toFixed(1) + '%';
  console.log(`palette-check: ${files.length} frames from ${dir}`);
  console.log('rendered colours by share (hex  share  L C H):');
  for (const p of r.top) console.log(`  ${p.hex}  ${pct(p.share).padStart(6)}  ${p.o.L.toFixed(2)} ${p.o.C.toFixed(3)} ${p.o.H.toFixed(0)}`);
  console.log(`neutral ${pct(r.s.neutral)} · chromatic ${pct(r.s.chromatic)} · hue families: ` +
    r.hueList.slice(0, 4).map((h) => `${h.h}-${h.h + 30}°=${pct(h.share)}`).join(', '));
  const directionFile = path.join(path.dirname(path.resolve(dir)), 'direction.md');
  const exception = fs.existsSync(directionFile) && /PALETTE EXCEPTION:\s*\S.{20,}/i.test(fs.readFileSync(directionFile, 'utf8'));
  if (!r.flags.length) { console.log('PASS: no default palette family, rainbow or ground churn detected (this is not a taste verdict).'); process.exit(0); }
  for (const f of r.flags) console.log('FLAG ' + f);
  if (exception) {
    console.log('direction.md has a PALETTE EXCEPTION. The reviewer must judge whether that reason is truly subject-specific.');
    process.exit(0);
  }
  console.log('Fix: rebuild the palette with references/colour.md (structure + subject sampling), re-shoot, re-check.');
  process.exit(1);
}
