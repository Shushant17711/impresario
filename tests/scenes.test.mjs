import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { skill, project, run } from './helpers.mjs';

test('scene-local checkpoints do not sample the whole page', async () => {
  const { scrollPositions } = await import(pathToFileURL(path.join(skill, 'scripts/lib/scene-plan.mjs')));
  assert.deepEqual(scrollPositions({ start: 1400, end: 1800 }, [0, 0.25, 0.5, 0.75, 1]), [1400, 1500, 1600, 1700, 1800]);
  assert.throws(() => scrollPositions({ start: 0, end: 0 }, [0, 1]), /range/i);
  assert.throws(() => scrollPositions({ start: 0, end: 400 }, [0, NaN, 1]), /checkpoint/i);
});
test('capture options fail on unknown viewport rather than zero scenes success', (t) => {
  const root = project(t);
  const result = run('scenes.mjs', ['index.html', '--scenes', 'nonsense'], root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unknown|invalid/i);
});
test('single-frame option cannot produce NaN scroll positions', (t) => {
  const root = project(t);
  const result = run('scenes.mjs', ['index.html', '--frames', '1'], root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /frames/i);
});
test('normal expressive steps require entry, transformation and resolution coverage, not one pose', async () => {
  const { validateCapture } = await import(pathToFileURL(path.join(skill, 'scripts/lib/scene-plan.mjs')));
  assert.throws(() => validateCapture({ steps: [{ label: 'closed', state: 'entry' }] }, 'phone', true), /composition|coverage/i);
  assert.doesNotThrow(() => validateCapture({ steps: [{ label: 'complete reading state' }] }, 'reduced', false));
});
test('checkpoint settling is bounded and readiness is declarative, not arbitrary JavaScript', async () => {
  const { validateCapture } = await import(pathToFileURL(path.join(skill, 'scripts/lib/scene-plan.mjs')));
  assert.throws(() => validateCapture({ steps: [{ label: 'wait', settleMs: Infinity }] }, 'phone'), /settle/i);
  assert.throws(() => validateCapture({ steps: [{ label: 'wait', ready: { script: 'true' } }] }, 'phone'), /ready|readiness/i);
});
test('interactive captures cannot supply scroll-only fields to bypass step frames', async () => {
  const { validateCapture } = await import(pathToFileURL(path.join(skill, 'scripts/lib/scene-plan.mjs')));
  assert.throws(() => validateCapture({ steps: [{ label: 'entry' }], checkpoints: [] }, 'phone'), /scroll|range/i);
  assert.throws(() => validateCapture({ steps: [{ label: 'entry' }], waits: [] }, 'phone'), /scroll|range/i);
});
