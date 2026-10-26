import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const skill = fileURLToPath(new URL('../', import.meta.url));
export const hash = (data) => createHash('sha256').update(data).digest('hex');
export function project(t) {
  const base = fs.existsSync('/tmp/opencode') ? '/tmp/opencode' : os.tmpdir();
  const root = fs.mkdtempSync(path.join(base, 'impresario-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
export function write(root, file, data) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof data === 'object' && !Buffer.isBuffer(data) ? JSON.stringify(data, null, 2) : data);
}
export function run(script, args, root) {
  return spawnSync(process.execPath, [path.join(skill, 'scripts', script), ...args], { cwd: root, encoding: 'utf8', timeout: 90000 });
}
export function manifest() {
  return { version: 1, mode: 'expressive', scenes: [{
    id: 'machine', role: 'flagship', selector: '#machine',
    action: 'Open the machine to inspect its components', purpose: 'Choose a compatible configuration',
    source: [{ file: 'index.html', anchor: 'data-scene' }], assets: [],
    compositions: { entry: 'Closed machine on workbench', transformation: 'Exploded components around chassis', resolution: 'Chosen configuration beside labelled specifications' },
    viewports: {
      desktop: { range: { start: 100, end: 400 }, checkpoints: [0, 0.5, 1] },
      phone: { steps: [{ label: 'closed', state: 'entry' }, { label: 'inspect', state: 'transformation', click: '#inspect' }, { label: 'choose', state: 'resolution', click: '#choose' }] },
      reduced: { steps: [{ label: 'all components and specifications' }] },
      'reduced-phone': { steps: [{ label: 'all components and specifications' }] },
    },
  }] };
}
export function evidence(root) {
  const source = '<main id="machine" data-scene="machine"><h1>Machine</h1></main>';
  write(root, 'index.html', source);
  write(root, '.impresario/report.md', '# Report\nEvidence only, independent creative acceptance pending.');
  const plan = manifest();
  write(root, '.impresario/scenes.json', plan);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1cAAAAASUVORK5CYII=', 'base64');
  const artifact = (file, data = png) => {
    write(root, `.impresario/scenes/${file}`, data);
    return { file, sha256: hash(data) };
  };
  const captures = Object.entries(plan.scenes[0].viewports).map(([viewport, config]) => {
    const frames = config.checkpoints ? config.checkpoints.map((progress, i) => ({ ...artifact(`${viewport}-${i}.png`), progress }))
      : config.steps.map((step, i) => ({ ...artifact(`${viewport}-${i}.png`), label: step.label }));
    const recording = ['desktop', 'phone'].includes(viewport) ? artifact(`${viewport}-recording.json`, JSON.stringify({ version: 1, frames: frames.map((f, i) => ({ ...f, timestamp: i * 0.1 })) })) : undefined;
    const replay = recording ? artifact(`${viewport}-replay.html`, '<!doctype html><title>Test replay artifact</title>') : undefined;
    return { scene: 'machine', viewport, frames, filmstrip: artifact(`${viewport}-filmstrip.png`), recording, replay };
  });
  const index = { version: 1, runId: 'test-capture', manifestHash: hash(fs.readFileSync(path.join(root, '.impresario/scenes.json'))), sources: { 'index.html': hash(source) }, captures };
  write(root, '.impresario/scenes/run.json', { status: 'complete', runId: index.runId });
  write(root, '.impresario/scenes/index.json', index);
  return { plan, index };
}
