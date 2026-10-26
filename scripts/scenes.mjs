#!/usr/bin/env node
/** Per-scene checkpoints and browser screencast replay; never a creativity/performance score. */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { launchChrome, CDP, openPage, goto, evaluate, setViewport, setReducedMotion, screenshot, scrollTo, sleep, toFileUrl } from './lib/cdp.mjs';
import { filmstrip } from './lib/png.mjs';
import { VIEWPORTS, scrollPositions } from './lib/scene-plan.mjs';
import { hash, validateManifest, sourceSnapshot } from './lib/evidence.mjs';

export function parseArgs(argv) {
  const args = { url: null, out: '.impresario/scenes', manifest: '.impresario/scenes.json', scenes: Object.keys(VIEWPORTS), frames: 32, height: 240, record: false, help: false };
  const values = { '--out': 'out', '-o': 'out', '--manifest': 'manifest', '--scenes': 'scenes', '-s': 'scenes', '--frames': 'frames', '-f': 'frames', '--strip-height': 'height' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--record') args.record = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (values[a]) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${a}`);
      args[values[a]] = value;
    } else if (a.startsWith('-')) throw new Error(`Unknown option: ${a}`);
    else if (args.url) throw new Error('Only one target URL is supported');
    else args.url = a;
  }
  if (typeof args.scenes === 'string') args.scenes = args.scenes.split(',').map((s) => s.trim());
  if (!args.scenes.length || args.scenes.some((s) => !VIEWPORTS[s]) || new Set(args.scenes).size !== args.scenes.length) throw new Error('Unknown or duplicate viewport in --scenes');
  args.frames = Number(args.frames);
  args.height = Number(args.height);
  if (!Number.isInteger(args.frames) || args.frames < 3 || args.frames > 600) throw new Error('--frames must be an integer from 3 to 600 (recording sweep samples, not acceptance count)');
  if (!Number.isInteger(args.height) || args.height < 32 || args.height > 2000) throw new Error('Invalid --strip-height');
  return args;
}

async function pointFor(cdp, sessionId, selector, x = 0.5, y = 0.5) {
  return evaluate(cdp, sessionId, `(() => {
    const nodes = document.querySelectorAll(${JSON.stringify(selector)});
    if (nodes.length !== 1) throw new Error('Action selector must identify exactly one element');
    const el = nodes[0], r = el.getBoundingClientRect();
    if (!r.width || !r.height) throw new Error('Action target is hidden');
    for(let n=el;n;n=n.parentElement){const s=getComputedStyle(n);if(s.visibility==='hidden'||s.display==='none'||Number(s.opacity)===0)throw new Error('Action target is hidden');}
    const x = r.left + r.width * ${x}, y = r.top + r.height * ${y};
    if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight || !el.contains(document.elementFromPoint(x,y))) throw new Error('Action target is offscreen or obscured');
    return {x, y};
  })()`);
}

async function action(cdp, sessionId, step, mobile) {
  if (step.click) {
    const { x, y } = await pointFor(cdp, sessionId, step.click);
    if (mobile) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }, sessionId);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, sessionId);
    } else {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, sessionId);
    }
  } else if (step.pointer) {
    const { x, y } = await pointFor(cdp, sessionId, step.pointer.selector, step.pointer.x, step.pointer.y);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }, sessionId);
  } else if (step.key) {
    const codes = { Enter: 13, Tab: 9, Escape: 27, ' ': 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 };
    const params = { key: step.key, code: step.key === ' ' ? 'Space' : step.key, windowsVirtualKeyCode: codes[step.key], nativeVirtualKeyCode: codes[step.key] };
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...params, ...(step.key === ' ' ? { text: ' ', unmodifiedText: ' ' } : {}) }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...params }, sessionId);
  }
}

function replayHTML(recording, title) {
  const data = JSON.stringify(recording).replaceAll('<', '\\u003c');
  const safeTitle = title.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${safeTitle}</title>
<style>body{margin:24px;background:#151515;color:white;font:16px system-ui}img{display:block;max-width:100%;max-height:85vh}button{padding:12px}p{max-width:70ch}</style>
<h1>${safeTitle}</h1><p>Actual browser screencast frames. Sampled replay, not a smooth-video or GPU/performance certification.</p>
<button id="play">Replay</button><img id="frame" alt="Recorded scene"><script>
const r=${data},img=document.getElementById('frame'),button=document.getElementById('play');let timer;
img.src=r.frames[0].file;button.onclick=()=>{clearTimeout(timer);let i=0;const next=()=>{img.src=r.frames[i].file;if(++i<r.frames.length)timer=setTimeout(next,Math.max(16,(r.frames[i].timestamp-r.frames[i-1].timestamp)*1000));};next();};
</script></html>`;
}

async function capture(cdp, sessionId, url, scene, viewport, args, outDir) {
  const base = VIEWPORTS[viewport], config = scene.viewports[viewport];
  await setViewport(cdp, sessionId, base.width, base.height, base.mobile, 1);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: base.mobile, maxTouchPoints: 1 }, sessionId);
  await setReducedMotion(cdp, sessionId, base.reduced);
  const runtimeErrors = [];
  const onException = (params, sid) => { if (sid === sessionId) runtimeErrors.push(params.exceptionDetails?.text || 'Runtime exception'); };
  cdp.on('Runtime.exceptionThrown', onException);
  let recordingActive = false;
  const prefix = `${scene.id}/${viewport}`;
  const save = (file, data) => {
    fs.mkdirSync(path.dirname(path.join(outDir, file)), { recursive: true });
    fs.writeFileSync(path.join(outDir, file), data);
    return { file, sha256: hash(data) };
  };
  const recordFrames = [];
  const onFrame = (params, sid) => {
    if (sid !== sessionId || !recordingActive) return;
    const bytes = Buffer.from(params.data, 'base64');
    const artifact = save(`${prefix}-record-${String(recordFrames.length).padStart(5, '0')}.png`, bytes);
    recordFrames.push({ ...artifact, timestamp: params.metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }, sessionId).catch((err) => runtimeErrors.push(err.message));
  };
  cdp.on('Page.screencastFrame', onFrame);
  const frames = [], bytes = [];
  const checkpoint = async (state, wait = {}) => {
    const settings = { settleMs: 400, timeoutMs: 8000, ...config, ...wait };
    await sleep(settings.settleMs);
    if (settings.ready) {
      const deadline = Date.now() + settings.timeoutMs;
      const { selector, attribute, equals } = settings.ready;
      while (true) {
        const ready = await evaluate(cdp, sessionId, `(() => {const n=document.querySelectorAll(${JSON.stringify(selector)});return n.length===1&&n[0].getAttribute(${JSON.stringify(attribute)})===${JSON.stringify(equals)};})()`);
        if (ready) break;
        if (Date.now() >= deadline) throw new Error(`${prefix}: readiness timed out for ${selector}[${attribute}]`);
        await sleep(100);
      }
    }
    const visible = await evaluate(cdp, sessionId, `(() => {
      const e=document.querySelector(${JSON.stringify(scene.selector)}),r=e.getBoundingClientRect();
      for(let n=e;n;n=n.parentElement){const s=getComputedStyle(n);if(s.visibility==='hidden'||s.display==='none'||Number(s.opacity)===0)return false;}
      return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
    })()`);
    if (!visible) throw new Error(`${prefix}: stage is hidden or outside the viewport at a declared checkpoint`);
    const shot = await screenshot(cdp, sessionId);
    bytes.push(shot);
    frames.push({ ...save(`${prefix}-${String(frames.length).padStart(3, '0')}.png`, shot), ...state });
  };
  try {
    if (args.record && !base.reduced) {
      recordingActive = true;
      await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: base.width, maxHeight: base.height }, sessionId);
    }
    await goto(cdp, sessionId, url, { settle: 900 });
    const ready = await evaluate(cdp, sessionId, `(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)));
      if(document.querySelectorAll(${JSON.stringify(scene.selector)}).length!==1)throw new Error('Scene selector must identify exactly one stage');
      document.documentElement.style.scrollBehavior='auto';document.body.style.scrollBehavior='auto';
      return {maxScroll:Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)-innerHeight,missingImages:[...document.images].filter(i=>!i.naturalWidth).length};
    })()`);
    if (ready.missingImages) throw new Error(`${prefix}: ${ready.missingImages} image asset(s) failed to load`);
    if (config.range) {
      if (config.range.end > ready.maxScroll) throw new Error(`${prefix}: range exceeds actual scroll height; measure runtime bounds for this viewport`);
      await scrollTo(cdp, sessionId, config.range.start);
    } else {
      const top = await evaluate(cdp, sessionId, `document.querySelector(${JSON.stringify(scene.selector)}).getBoundingClientRect().top+window.scrollY`);
      await scrollTo(cdp, sessionId, top);
      await sleep(300);
    }
    if (config.range) {
      const checkpoints = scrollPositions(config.range, config.checkpoints);
      const sweep = args.record && !base.reduced ? Array.from({ length: args.frames }, (_, i) => Math.round(config.range.start + (config.range.end - config.range.start) * i / (args.frames - 1))) : [];
      for (const y of [...new Set([...checkpoints, ...sweep])].sort((a, b) => a - b)) {
        await scrollTo(cdp, sessionId, y);
        const actual = await evaluate(cdp, sessionId, 'window.scrollY');
        if (Math.abs(actual - y) > 2) throw new Error(`${prefix}: scroll did not reach requested position ${y}`);
        const i = checkpoints.indexOf(y);
        if (i !== -1) await checkpoint({ progress: config.checkpoints[i], scrollY: actual }, config.waits?.[i] || {});
      }
    } else {
      for (const step of config.steps) {
        await action(cdp, sessionId, step, base.mobile);
        await checkpoint({ label: step.label, ...(step.state ? { state: step.state } : {}) }, step);
      }
    }
    if (runtimeErrors.length) throw new Error(`${prefix}: browser errors: ${runtimeErrors.join('; ')}`);
    const result = { scene: scene.id, viewport, frames, filmstrip: save(`${prefix}-filmstrip.png`, filmstrip(bytes, { height: args.height })) };
    if (recordingActive) {
      await cdp.send('Page.stopScreencast', {}, sessionId);
      await sleep(200);
      recordingActive = false;
      if (recordFrames.length < 2) throw new Error(`${prefix}: browser produced fewer than two recording frames`);
      const recording = { version: 1, frames: recordFrames, limitations: 'Browser screencast sampling; not smooth video or GPU/performance proof.' };
      result.recording = save(`${prefix}-recording.json`, JSON.stringify(recording, null, 2));
      const localRecording = { ...recording, frames: recordFrames.map((frame) => ({ ...frame, file: path.basename(frame.file) })) };
      result.replay = save(`${prefix}-replay.html`, replayHTML(localRecording, prefix));
    }
    return result;
  } finally {
    if (recordingActive) await cdp.send('Page.stopScreencast', {}, sessionId).catch(() => {});
    cdp.handlers.set('Page.screencastFrame', (cdp.handlers.get('Page.screencastFrame') || []).filter((h) => h !== onFrame));
    cdp.handlers.set('Runtime.exceptionThrown', (cdp.handlers.get('Runtime.exceptionThrown') || []).filter((h) => h !== onException));
  }
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    console.log(`impresario scenes — per-scene evidence, NOT a creative score
node scenes.mjs <url or index.html> [--manifest FILE] [--record]
--scenes desktop,phone,reduced,reduced-phone  viewport subset (default all)
--frames 32   recording sweep samples (3–600); checkpoints come from manifest
--out DIR     default .impresario/scenes; acceptance checker reads this default
--strip-height 240
Missing manifest, unknown viewports, unreachable ranges and missing stages fail.`);
    return 0;
  }
  if (!args.url) throw new Error('A URL or index.html is required');
  const root = process.cwd(), manifestBytes = fs.readFileSync(path.resolve(args.manifest));
  const plan = validateManifest(JSON.parse(manifestBytes), root);
  const jobs = plan.scenes.flatMap((scene) => args.scenes.filter((v) => scene.viewports[v]).map((viewport) => ({ scene, viewport })));
  if (!jobs.length) throw new Error('No declared scenes match the requested viewports');
  const sources = sourceSnapshot(root, plan), outDir = path.resolve(args.out);
  fs.mkdirSync(outDir, { recursive: true });
  const runId = randomUUID(), startedAt = new Date().toISOString();
  const markRun = (status, error) => fs.writeFileSync(path.join(outDir, 'run.json'), JSON.stringify({ runId, status, startedAt, error }, null, 2));
  markRun('in-progress');
  const url = toFileUrl(args.url);
  let browser, cdp;
  try {
    browser = await launchChrome({ headless: true });
    cdp = await CDP.connect(browser.webSocketDebuggerUrl);
    const { sessionId } = await openPage(cdp);
    const captures = [];
    for (const { scene, viewport } of jobs) {
      captures.push(await capture(cdp, sessionId, url, scene, viewport, args, outDir));
      console.log(`Captured ${scene.id}/${viewport}: ${captures.at(-1).frames.length} checkpoints${captures.at(-1).recording ? ' + browser recording' : ''}`);
    }
    if (JSON.stringify(sourceSnapshot(root, plan)) !== JSON.stringify(sources) || hash(fs.readFileSync(path.resolve(args.manifest))) !== hash(manifestBytes)) throw new Error('Source/assets/manifest changed during capture; rerun');
    const index = { version: 1, runId, url, createdAt: new Date().toISOString(), manifestHash: hash(manifestBytes), sources, captures };
    fs.writeFileSync(path.join(outDir, 'index.json.pending'), JSON.stringify(index, null, 2));
    fs.renameSync(path.join(outDir, 'index.json.pending'), path.join(outDir, 'index.json'));
    markRun('complete');
    console.log(`Scene evidence saved to ${outDir}. Creative acceptance: NOT EVALUATED.`);
    return 0;
  } catch (err) {
    markRun('failed', err.message);
    throw err;
  } finally {
    if (cdp) cdp.close();
    if (browser) await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().then((code) => { process.exitCode = code; }).catch((err) => {
    console.error(`scenes: ${err.message}`);
    process.exitCode = 2;
  });
}
