import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { project, write, run, evidence, hash } from './helpers.mjs';

test('nonexistent project is not a passing creative check', (t) => {
  const root = project(t);
  const result = run('creative-check.mjs', [path.join(root, 'absent')], root);
  assert.notEqual(result.status, 0, result.stdout);
});
test('empty project fails closed', (t) => {
  const root = project(t);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('global vocabulary and duplicated numbered motions cannot replace evidence', (t) => {
  const root = project(t);
  write(root, 'index.html', '<!-- hero ScrollTrigger transform animation requestAnimationFrame pin:true -->');
  write(root, '.impresario/report.md', 'Hero motion. Authored showpiece proof. Subject itself. Entry approach transform reveal release.\n**Changed properties:** scale rotate\nMotion 1 Motion 2 Motion 3 Motion 4 Motion 5');
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('complete evidence passes consistency but explicitly cannot certify creativity', (t) => {
  const root = project(t);
  evidence(root);
  const result = run('creative-check.mjs', [root], root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /creative acceptance: NOT EVALUATED/i);
  assert.doesNotMatch(result.stdout, /creative-check — 0 FAIL/);
});
test('source changes invalidate captured evidence even with unchanged timestamps', (t) => {
  const root = project(t);
  evidence(root);
  const file = path.join(root, 'index.html');
  const time = fs.statSync(file).mtime;
  fs.appendFileSync(file, '<p>changed</p>');
  fs.utimesSync(file, time, time);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('missing mobile capture fails', (t) => {
  const root = project(t);
  const { index } = evidence(root);
  index.captures = index.captures.filter((c) => c.viewport !== 'phone');
  write(root, '.impresario/scenes/index.json', index);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('missing recording fails expressive evidence', (t) => {
  const root = project(t);
  const { index } = evidence(root);
  delete index.captures[0].recording;
  write(root, '.impresario/scenes/index.json', index);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('artifact tampering invalidates capture', (t) => {
  const root = project(t);
  evidence(root);
  write(root, '.impresario/scenes/desktop-0.png', 'changed');
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('stale manifest invalidates capture', (t) => {
  const root = project(t);
  const { plan } = evidence(root);
  plan.scenes[0].purpose = 'Different purpose';
  write(root, '.impresario/scenes.json', plan);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('missing source anchor is not satisfied by words in unrelated files', (t) => {
  const root = project(t);
  const { plan } = evidence(root);
  plan.scenes[0].source[0].anchor = 'nonexistentTimeline';
  write(root, '.impresario/scenes.json', plan);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('unbound self-review cannot certify acceptance', (t) => {
  const root = project(t);
  evidence(root);
  write(root, '.impresario/creative-review.json', { verdict: 'accepted', reviewer: { kind: 'builder', name: 'me' }, captureHash: 'wrong' });
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('duplicate phase IDs fail rather than inflate the evidence inventory', (t) => {
  const root = project(t);
  const { plan } = evidence(root);
  plan.scenes.push(plan.scenes[0]);
  write(root, '.impresario/scenes.json', plan);
  const result = run('creative-check.mjs', [root], root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unique/i);
});
test('serious app mode does not require a cinematic flagship or five motions', (t) => {
  const root = project(t);
  write(root, 'index.html', '<h1>Operations</h1>');
  write(root, '.impresario/report.md', 'Keyboard-first app feedback, no spectacle requested.');
  write(root, '.impresario/scenes.json', { version: 1, mode: 'app', scenes: [] });
  const result = run('creative-check.mjs', [root], root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /NOT EVALUATED/);
});
test('malformed evidence cannot silently become an empty passing report', (t) => {
  const root = project(t);
  evidence(root);
  write(root, '.impresario/scenes.json', '{broken');
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('declared assets must actually exist and disclose fidelity/provenance', (t) => {
  const root = project(t);
  const { plan } = evidence(root);
  plan.scenes[0].assets = [{ file: 'missing.glb', kind: '3D', fidelity: 'photo', provenance: 'supplied' }];
  write(root, '.impresario/scenes.json', plan);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
  write(root, 'missing.glb', 'test model bytes');
  delete plan.scenes[0].assets[0].fidelity;
  write(root, '.impresario/scenes.json', plan);
  assert.match(run('creative-check.mjs', [root], root).stderr, /fidelity/i);
});
test('source references cannot escape the project root', (t) => {
  const root = project(t);
  const { plan } = evidence(root);
  plan.scenes[0].source[0].file = '../outside.html';
  write(root, '.impresario/scenes.json', plan);
  assert.notEqual(run('creative-check.mjs', [root], root).status, 0);
});
test('missing intermediate transformation frame invalidates an otherwise current index', (t) => {
  const root = project(t);
  const { index } = evidence(root);
  index.captures[0].frames.splice(1, 1);
  write(root, '.impresario/scenes/index.json', index);
  assert.match(run('creative-check.mjs', [root], root).stderr, /checkpoint/i);
});
test('a recorded rejection remains visible even when consistency passes', (t) => {
  const root = project(t);
  evidence(root);
  const indexBytes = fs.readFileSync(path.join(root, '.impresario/scenes/index.json'));
  write(root, '.impresario/creative-review.json', {
    verdict: 'rejected', reviewer: { kind: 'human', name: 'test reviewer' }, captureHash: hash(indexBytes),
    evidence: 'Fixture frames show mechanics, not cinematic assets.', limitations: 'Test data; no real creative judgment.'
  });
  const result = run('creative-check.mjs', [root], root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Recorded visual review: rejected/);
  assert.match(result.stdout, /Creative acceptance: NOT EVALUATED/);
});
test('a failed latest capture cannot reuse an old successful index', (t) => {
  const root = project(t);
  evidence(root);
  write(root, '.impresario/scenes/run.json', { status: 'failed', runId: 'latest-failed-attempt' });
  const result = run('creative-check.mjs', [root], root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /capture|attempt/i);
});
test('expressive normal phone evidence must cover all three compositions', (t) => {
  const root = project(t);
  const { plan } = evidence(root);
  plan.scenes[0].viewports.phone.steps = [{ label: 'closed', state: 'entry' }];
  write(root, '.impresario/scenes.json', plan);
  const result = run('creative-check.mjs', [root], root);
  assert.match(result.stderr, /composition coverage/i);
});
test('empty scroll checkpoints cannot turn an interactive sequence into zero-frame proof', (t) => {
  const root = project(t);
  const { plan, index } = evidence(root);
  plan.scenes[0].viewports.phone.checkpoints = [];
  index.captures.find((c) => c.viewport === 'phone').frames = [];
  write(root, '.impresario/scenes.json', plan);
  index.manifestHash = hash(fs.readFileSync(path.join(root, '.impresario/scenes.json')));
  write(root, '.impresario/scenes/index.json', index);
  const result = run('creative-check.mjs', [root], root);
  assert.notEqual(result.status, 0, result.stdout);
});
