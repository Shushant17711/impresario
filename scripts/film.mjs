#!/usr/bin/env node
// Film the scroll so a reviewer can judge MOTION, not just still frames.
//   node <skill>/scripts/film.mjs <url> [outDir=.impresario/film] [tag=f1] [--step 0.25] [--phone]
// Scrolls the page in steps of <step> viewport heights (default 0.25 = 4 frames per screen),
// waiting real time at each step, after running window.__impresarioDemo if defined.
// Writes numbered frames, a dense contact sheet (<tag>-film.png, read it in scroll order)
// and, when ffmpeg is on PATH, <tag>-film.mp4 at 8 fps.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { CDP, launchChrome, openPage, goto, evaluate, setViewport, sleep, toFileUrl } from './lib/cdp.mjs';
import { decodePNG, encodePNG } from './lib/png.mjs';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(n); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const phone = argv.includes('--phone'); if (phone) argv.splice(argv.indexOf('--phone'), 1);
const step = parseFloat(flag('--step', '0.25'));
const [target, out = '.impresario/film', tag = 'f1'] = argv;
if (!target) { console.log('usage: node film.mjs <url|index.html> [outDir] [tag] [--step 0.25] [--phone]'); process.exit(1); }
const url = /^[a-z]+:\/\//i.test(target) ? target : toFileUrl(path.resolve(target));
const W = phone ? 390 : 1440, H = phone ? 844 : 900, scale = phone ? 0.5 : 0.3;
const dir = path.join(out, `${tag}-${phone ? 'phone' : 'desktop'}`);
fs.mkdirSync(dir, { recursive: true });

const chrome = await launchChrome({ extraArgs: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const cdp = await CDP.connect(chrome.webSocketDebuggerUrl);
const { sessionId } = await openPage(cdp);
await setViewport(cdp, sessionId, W, H, phone, 1);
await goto(cdp, sessionId, url, { settle: 600 });
const frames = [];
const snap = async () => {
  // clip is in document coordinates: follow the current scroll position, or frames go blank
  const sy = await evaluate(cdp, sessionId, 'scrollY');
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: sy, width: W, height: H, scale } }, sessionId);
  const buf = Buffer.from(data, 'base64');
  fs.writeFileSync(path.join(dir, `${String(frames.length).padStart(4, '0')}.png`), buf);
  frames.push(buf);
};
for (let i = 0; i < 6; i++) { await snap(); await sleep(500); }          // opening ritual
await evaluate(cdp, sessionId, `(async () => { if (typeof window.__impresarioDemo === 'function') await window.__impresarioDemo(); return 1; })()`).catch(() => 0);
const max = await evaluate(cdp, sessionId, 'document.documentElement.scrollHeight - innerHeight');
for (let y = 0; y <= max + 1; y += H * step) {
  await evaluate(cdp, sessionId, `(() => { const l = window.__lenis; const y = ${Math.min(y, max)};
    if (l && l.scrollTo) l.scrollTo(y, { immediate: true }); else scrollTo(0, y); return 1; })()`);
  await sleep(700); // scrubbed timelines with lag (scrub:1) need time to settle
  await snap();
}
await chrome.close();

// dense contact sheet in scroll order
const d = frames.map((f) => decodePNG(f));
const cols = phone ? 10 : 6, tw = d[0].width, th = d[0].height, gap = 6;
const rows = Math.ceil(d.length / cols);
const SW = cols * tw + (cols + 1) * gap, SH = rows * th + (rows + 1) * gap;
const sheet = Buffer.alloc(SW * SH * 4, 0);
for (let i = 3; i < sheet.length; i += 4) { sheet[i - 3] = 30; sheet[i - 2] = 30; sheet[i - 1] = 30; sheet[i] = 255; }
d.forEach((img, n) => {
  const ox = gap + (n % cols) * (tw + gap), oy = gap + Math.floor(n / cols) * (th + gap);
  for (let y = 0; y < th; y++) img.data.copy(sheet, ((oy + y) * SW + ox) * 4, y * tw * 4, (y + 1) * tw * 4);
});
const sheetPath = path.join(out, `${tag}-${phone ? 'phone' : 'desktop'}-film.png`);
fs.writeFileSync(sheetPath, encodePNG(SW, SH, sheet));
console.log(`${frames.length} frames (step ${step}vh) → ${sheetPath}`);
try {
  const mp4 = path.join(out, `${tag}-${phone ? 'phone' : 'desktop'}-film.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '8', '-i', path.join(dir, '%04d.png'),
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', mp4]);
  console.log(`video → ${mp4}`);
} catch { /* ffmpeg optional */ }
process.exit(0);
