#!/usr/bin/env node
// Zero-config review capture for the self-review loop. No manifest needed.
//   node <skill>/scripts/shoot.mjs <url> [outDir=.impresario/shots] [tag=r1]
// Captures desktop 1440x900, phone 390x844 and reduced-motion. Positions are derived
// automatically: every pinned ScrollTrigger at 10/35/65/90 % progress, plus the top of
// every <section>/<footer>, plus the page end. Writes PNGs, one contact sheet per
// viewport (<tag>-<viewport>-sheet.png) and prints console errors. WebGL runs on
// SwiftShader so shaders render headless.
import fs from 'node:fs';
import path from 'node:path';
import { CDP, launchChrome, openPage, goto, evaluate, setViewport, setReducedMotion, screenshot, sleep, toFileUrl } from './lib/cdp.mjs';
import { filmstrip } from './lib/png.mjs';

const [target, out = '.impresario/shots', tag = 'r1'] = process.argv.slice(2);
if (!target || target === '--help') {
  console.log('usage: node shoot.mjs <url|index.html> [outDir] [tag]');
  process.exit(target ? 0 : 1);
}
const url = /^[a-z]+:\/\//i.test(target) ? target : toFileUrl(path.resolve(target));
fs.mkdirSync(out, { recursive: true });

const chrome = await launchChrome({ extraArgs: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const cdp = await CDP.connect(chrome.webSocketDebuggerUrl);

const PLAN = `(() => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pts = [['top', 0]];
  const ST = window.ScrollTrigger;
  const pins = ST ? ST.getAll().filter((t) => t.pin && t.end > t.start) : [];
  pins.forEach((t, i) => [0.1, 0.35, 0.65, 0.9].forEach((p) =>
    pts.push(['pin' + (i + 1) + '-' + Math.round(p * 100), t.start + (t.end - t.start) * p])));
  const inPin = (y) => pins.some((t) => y >= t.start - 2 && y <= t.end + 2);
  document.querySelectorAll('body section, body footer').forEach((el, i) => {
    const y = el.getBoundingClientRect().top + scrollY;
    if (!inPin(y)) pts.push([(el.id || el.className.toString().split(' ')[0] || 'sec' + i).slice(0, 24), y]);
  });
  pts.push(['end', max]);
  const seen = [];
  return pts.map(([n, y]) => [n.replace(/[^a-z0-9-]/gi, ''), Math.max(0, Math.min(max, Math.round(y)))])
    .sort((a, b) => a[1] - b[1])
    .filter(([, y]) => (seen.some((s) => Math.abs(s - y) < innerHeight * 0.25) ? false : seen.push(y)));
})()`;

const viewports = [
  { name: 'desktop', w: 1440, h: 900, m: false },
  { name: 'phone', w: 390, h: 844, m: true },
  { name: 'reduced', w: 1440, h: 900, m: false, r: true },
];
let problems = 0;
for (const vp of viewports) {
  const { sessionId } = await openPage(cdp);
  const logs = [];
  cdp.on('Runtime.consoleAPICalled', (p, sid) => { if (sid === sessionId && p.type === 'error') logs.push('console.error: ' + p.args.map((a) => a.value ?? a.description).join(' ')); });
  cdp.on('Runtime.exceptionThrown', (p, sid) => { if (sid === sessionId) logs.push('EXCEPTION: ' + (p.exceptionDetails.exception?.description || p.exceptionDetails.text)); });
  await cdp.send('Log.enable', {}, sessionId);
  cdp.on('Log.entryAdded', (p, sid) => { if (sid === sessionId && p.entry.level === 'error') logs.push(`${p.entry.source}: ${p.entry.text} ${p.entry.url || ''}`); });
  await setViewport(cdp, sessionId, vp.w, vp.h, vp.m, 1);
  await setReducedMotion(cdp, sessionId, !!vp.r);
  await goto(cdp, sessionId, url, { settle: 600 });
  await sleep(vp.r ? 800 : 3000); // real-time wait: let the opening ritual play
  const plan = await evaluate(cdp, sessionId, PLAN);
  const frames = [];
  let i = 0;
  for (const [name, y] of plan) {
    // jump smooth-scroll libraries too, then wait real time for scrubs to settle
    await evaluate(cdp, sessionId, `(() => { const l = window.__lenis || window.lenis; if (l && l.scrollTo) l.scrollTo(${y}, { immediate: true }); window.scrollTo(0, ${y}); return true; })()`);
    await sleep(vp.r ? 400 : 1800);
    const png = await screenshot(cdp, sessionId);
    const f = path.join(out, `${tag}-${vp.name}-${String(i++).padStart(2, '0')}-${name}.png`);
    fs.writeFileSync(f, png);
    frames.push(png);
  }
  const sheet = path.join(out, `${tag}-${vp.name}-sheet.png`);
  fs.writeFileSync(sheet, filmstrip(frames, { height: vp.m ? 420 : 260, background: [40, 40, 40] }));
  problems += logs.length;
  console.log(`[${vp.name}] ${frames.length} frames → ${sheet}`);
  console.log(`[${vp.name}] console errors: ${logs.length ? '\n  ' + logs.join('\n  ') : 'none'}`);
}
await chrome.close();
process.exit(problems ? 2 : 0);
