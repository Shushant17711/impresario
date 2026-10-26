import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { findChrome } from '../scripts/lib/cdp.mjs';
import { decodePNG } from '../scripts/lib/png.mjs';
import { project, write, run, manifest, skill } from './helpers.mjs';

test('real browser captures scene-local progress, native phone choices and both reduced modes', { skip: !findChrome(), timeout: 90000 }, (t) => {
  const root = project(t);
  write(root, 'index.html', fs.readFileSync(path.join(skill, 'tests/fixtures/scene.html')));
  write(root, '.impresario/report.md', '# Mechanics-only fixture report\nCreative acceptance pending.');
  const plan = manifest();
  plan.scenes[0].viewports.desktop.range = { start: 500, end: 1400 };
  write(root, '.impresario/scenes.json', plan);
  const capture = run('scenes.mjs', ['index.html', '--record', '--frames', '5'], root);
  assert.equal(capture.status, 0, `${capture.stdout}\n${capture.stderr}`);
  const index = JSON.parse(fs.readFileSync(path.join(root, '.impresario/scenes/index.json')));
  assert.equal(index.captures.length, 4);
  const desktop = index.captures.find((c) => c.viewport === 'desktop');
  assert.deepEqual(desktop.frames.map((f) => f.scrollY), [500, 950, 1400]);
  assert.equal(new Set(desktop.frames.map((f) => f.sha256)).size, 3);
  const phone = index.captures.find((c) => c.viewport === 'phone');
  assert.equal(new Set(phone.frames.map((f) => f.sha256)).size, 3, 'Native touch actions should visibly change the fixture');
  assert.ok(desktop.recording && phone.recording);
  assert.equal(index.captures.filter((c) => c.viewport.startsWith('reduced')).length, 2);
  const checked = run('creative-check.mjs', [root], root);
  assert.equal(checked.status, 0, checked.stderr);
  assert.match(checked.stdout, /NOT EVALUATED/);
});
test('browser recording includes first-load motion rather than only the settled page', { skip: !findChrome(), timeout: 90000 }, (t) => {
  const root = project(t);
  write(root, 'index.html', '<!doctype html><html><meta name="viewport" content="width=device-width"><title>Load fixture</title><style>body{margin:0;background:rgb(255,0,0)}#machine{height:100vh}</style><main id="machine" data-scene="machine"><h1>Load mechanics fixture</h1></main><script>setTimeout(()=>document.body.style.background="rgb(0,0,255)",650)</script></html>');
  const plan = manifest();
  plan.scenes[0].viewports.desktop = { steps: [{ label: 'settled entry', state: 'entry' }, { label: 'settled middle', state: 'transformation' }, { label: 'settled resolution', state: 'resolution' }] };
  write(root, '.impresario/scenes.json', plan);
  const capture = run('scenes.mjs', ['index.html', '--record', '--scenes', 'desktop'], root);
  assert.equal(capture.status, 0, `${capture.stdout}\n${capture.stderr}`);
  const out = path.join(root, '.impresario/scenes');
  const index = JSON.parse(fs.readFileSync(path.join(out, 'index.json')));
  const recording = JSON.parse(fs.readFileSync(path.join(out, index.captures[0].recording.file)));
  const colors = recording.frames.map((f) => Array.from(decodePNG(fs.readFileSync(path.join(out, f.file))).data.subarray(0, 3)).join(','));
  assert.ok(colors.includes('255,0,0'), 'The actual initial red frame must be recorded before the load animation settles');
  assert.ok(colors.includes('0,0,255'), 'The actual final blue frame must also be recorded');
});
test('hidden, transparent and horizontally offscreen stages fail capture', { skip: !findChrome(), timeout: 120000 }, (t) => {
  const root = project(t);
  const plan = manifest();
  plan.scenes[0].viewports.desktop = { steps: [
    { label: 'entry', state: 'entry' }, { label: 'middle', state: 'transformation' }, { label: 'final', state: 'resolution' }
  ] };
  write(root, '.impresario/scenes.json', plan);
  for (const style of ['opacity:0', 'visibility:hidden', 'transform:translateX(200vw)']) {
    write(root, 'index.html', `<!doctype html><html><title>Visibility fixture</title><style>body{margin:0}#machine{height:900px;${style}}</style><main id="machine" data-scene="machine"><h1>Not visible</h1></main></html>`);
    const capture = run('scenes.mjs', ['index.html', '--scenes', 'desktop'], root);
    assert.notEqual(capture.status, 0, `${style}\n${capture.stdout}`);
    assert.match(capture.stderr, /visible|viewport|hidden/i);
  }
});
test('delayed phone resolution is captured using bounded declarative readiness', { skip: !findChrome(), timeout: 90000 }, (t) => {
  const root = project(t);
  write(root, 'index.html', '<!doctype html><html><meta name="viewport" content="width=device-width"><title>Readiness fixture</title><style>body{margin:0}#machine{height:844px}button{padding:20px}</style><main id="machine" data-scene="machine"><h1>Choose</h1><button id="inspect">Inspect</button><button id="choose">Choose</button><div id="subject" data-state="closed">Closed</div></main><script>inspect.onclick=()=>{subject.dataset.state="inspect";subject.textContent="Inspected"};choose.onclick=()=>setTimeout(()=>{subject.dataset.state="choose";subject.textContent="Configuration chosen";document.body.style.background="rgb(0,0,255)"},2000)</script></html>');
  const plan = manifest();
  const step = plan.scenes[0].viewports.phone.steps.at(-1);
  step.ready = { selector: '#subject', attribute: 'data-state', equals: 'choose' };
  step.timeoutMs = 5000;
  write(root, '.impresario/scenes.json', plan);
  const capture = run('scenes.mjs', ['index.html', '--record', '--scenes', 'phone'], root);
  assert.equal(capture.status, 0, capture.stderr);
  const out = path.join(root, '.impresario/scenes');
  const index = JSON.parse(fs.readFileSync(path.join(out, 'index.json')));
  const final = decodePNG(fs.readFileSync(path.join(out, index.captures[0].frames.at(-1).file)));
  assert.deepEqual(Array.from(final.data.subarray(0, 3)), [0, 0, 255], 'Final resolution must actually appear');
  const recording = JSON.parse(fs.readFileSync(path.join(out, index.captures[0].recording.file)));
  assert.ok(recording.frames.some((f) => Array.from(decodePNG(fs.readFileSync(path.join(out, f.file))).data.subarray(0, 3)).join(',') === '0,0,255'), 'The recording, not just a final screenshot, must include the delayed resolution');
});
test('native keyboard Space and event.code ArrowRight advance capture states', { skip: !findChrome(), timeout: 90000 }, (t) => {
  const root = project(t);
  write(root, 'index.html', '<!doctype html><html><meta name="viewport" content="width=device-width"><title>Keyboard fixture</title><style>body{margin:0}#machine{height:900px}button{padding:20px}body:has([data-state="inspect"]){background:rgb(0,255,0)}body:has([data-state="choose"]){background:rgb(0,0,255)}</style><main id="machine" data-scene="machine"><h1>Keyboard</h1><button id="inspect">Inspect</button><div id="subject" data-state="closed">Closed</div></main><script>inspect.onclick=()=>{subject.dataset.state="inspect"};document.addEventListener("keydown",e=>{if(e.code==="ArrowRight")subject.dataset.state="choose"});</script></html>');
  const plan = manifest();
  plan.scenes[0].viewports.desktop = { steps: [
    { label: 'entry', state: 'entry', key: 'Tab' },
    { label: 'inspect', state: 'transformation', key: ' ', ready: { selector: '#subject', attribute: 'data-state', equals: 'inspect' }, timeoutMs: 1000 },
    { label: 'choose', state: 'resolution', key: 'ArrowRight', ready: { selector: '#subject', attribute: 'data-state', equals: 'choose' }, timeoutMs: 1000 }
  ] };
  write(root, '.impresario/scenes.json', plan);
  const capture = run('scenes.mjs', ['index.html', '--scenes', 'desktop'], root);
  assert.equal(capture.status, 0, `${capture.stdout}\n${capture.stderr}`);
  const out = path.join(root, '.impresario/scenes');
  const index = JSON.parse(fs.readFileSync(path.join(out, 'index.json')));
  const colors = index.captures[0].frames.map((f) => Array.from(decodePNG(fs.readFileSync(path.join(out, f.file))).data.subarray(0, 3)));
  assert.deepEqual(colors.slice(1), [[0, 255, 0], [0, 0, 255]], 'Space must activate the native button; ArrowRight must send a real code');
});
test('scene and viewport names cannot collide in capture artifact paths', { skip: !findChrome(), timeout: 90000 }, (t) => {
  const root = project(t);
  write(root, 'index.html', '<!doctype html><html><title>Path fixture</title><style>body{margin:0}#machine{height:900px}</style><main id="machine" data-scene="machine"><h1>Paths</h1></main></html>');
  const plan = manifest();
  plan.scenes[0].viewports.phone = { steps: [{ label: 'entry', state: 'entry' }, { label: 'mid', state: 'transformation' }, { label: 'end', state: 'resolution' }] };
  plan.scenes.push({ ...plan.scenes[0], id: 'machine-reduced', role: 'support' });
  write(root, '.impresario/scenes.json', plan);
  const capture = run('scenes.mjs', ['index.html', '--scenes', 'phone,reduced-phone'], root);
  assert.equal(capture.status, 0, capture.stderr);
  const index = JSON.parse(fs.readFileSync(path.join(root, '.impresario/scenes/index.json')));
  const a = index.captures.find((c) => c.scene === 'machine' && c.viewport === 'reduced-phone');
  const b = index.captures.find((c) => c.scene === 'machine-reduced' && c.viewport === 'phone');
  assert.notEqual(a.frames[0].file, b.frames[0].file, 'Distinct scene/viewport tuples must not overwrite each other');
});
