import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { project, write, run, evidence, hash } from './helpers.mjs';
import { sourceSnapshot } from '../scripts/lib/evidence.mjs';

const indexFile = '.impresario/scenes/index.json';
const check = (root) => run('creative-check.mjs', [root], root);
const persistIndex = (root, index) => write(root, indexFile, index);
const replayArtifact = (root, capture) => {
  // Fixture bytes only: these tests assert integrity, not replay quality or creativity.
  const file = `${capture.viewport}-review-replay.html`;
  const bytes = `<!doctype html><title>Fixture replay ${capture.viewport}</title>`;
  write(root, `.impresario/scenes/${file}`, bytes);
  capture.replay = { file, sha256: hash(bytes) };
};
function currentEvidence(root) {
  const fixture = evidence(root);
  for (const capture of fixture.index.captures) {
    if (capture.recording) replayArtifact(root, capture);
  }
  persistIndex(root, fixture.index);
  return fixture;
}
function assertConsistent(root) {
  const result = check(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Evidence consistency: PASS/);
  assert.match(result.stdout, /Creative acceptance: NOT EVALUATED/);
  assert.doesNotMatch(result.stdout, /Creative acceptance: PASS/i);
  return result;
}

for (const [extension, initial, changed] of [
  ['json', '{"label":"before"}', '{"label":"after"}'],
  ['yaml', 'label: before\n', 'label: after\n'],
  ['yml', 'label: before\n', 'label: after\n'],
  ['csv', 'label\nbefore\n', 'label\nafter\n'],
  ['tsv', 'label\tvalue\nbefore\t1\n', 'label\tvalue\nafter\t2\n'],
  ['txt', 'before\n', 'after\n'],
]) {
  test(`editing rendering .${extension} data invalidates a current snapshot without changing its importer`, (t) => {
    const root = project(t);
    const { plan, index } = currentEvidence(root);
    const dataFile = `data.${extension}`;
    const importer = `<main id="machine" data-scene="machine"></main><script>fetch('${dataFile}').then(r => r.text()).then(data => document.querySelector('main').textContent = data);</script>`;
    write(root, 'index.html', importer);
    write(root, dataFile, initial);
    index.sources = sourceSnapshot(root, plan);
    persistIndex(root, index);
    assertConsistent(root);

    const time = fs.statSync(path.join(root, dataFile)).mtime;
    write(root, dataFile, changed);
    fs.utimesSync(path.join(root, dataFile), time, time);
    assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), importer);
    const result = check(root);
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /Stale capture: source or assets changed/);
  });
}

test('current declared replay artifacts pass evidence consistency without creative certification', (t) => {
  const root = project(t);
  const { index } = currentEvidence(root);
  assert.equal(index.captures.filter((capture) => capture.replay).length, 2);
  assertConsistent(root);
});

for (const viewport of ['desktop', 'phone', 'reduced', 'reduced-phone']) {
  for (const mutation of ['corruption', 'deletion']) {
    test(`${mutation} of a declared ${viewport} replay invalidates otherwise current evidence`, (t) => {
      const root = project(t);
      const { index } = currentEvidence(root);
      const capture = index.captures.find((entry) => entry.viewport === viewport);
      replayArtifact(root, capture);
      persistIndex(root, index);
      assertConsistent(root);

      const file = path.join(root, '.impresario/scenes', capture.replay.file);
      if (mutation === 'corruption') fs.appendFileSync(file, '<!-- changed -->');
      else fs.unlinkSync(file);
      const result = check(root);
      assert.notEqual(result.status, 0, result.stdout);
      assert.match(result.stderr, /replay\.html/);
    });
  }
}

for (const viewport of ['desktop', 'phone']) {
  test(`expressive ${viewport} recording requires a replay reference`, (t) => {
    const root = project(t);
    const { index } = currentEvidence(root);
    assertConsistent(root);
    delete index.captures.find((capture) => capture.viewport === viewport).replay;
    persistIndex(root, index);
    const result = check(root);
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /artifact|replay/i);
  });
}

for (const mode of ['composed', 'app']) {
  test(`${mode} mode validates every declared replay even when a recording is not required`, (t) => {
    const root = project(t);
    const { plan, index } = currentEvidence(root);
    plan.mode = mode;
    write(root, '.impresario/scenes.json', plan);
    index.manifestHash = hash(fs.readFileSync(path.join(root, '.impresario/scenes.json')));
    const capture = index.captures.find((entry) => entry.viewport === 'reduced-phone');
    replayArtifact(root, capture);
    persistIndex(root, index);
    assertConsistent(root);
    write(root, `.impresario/scenes/${capture.replay.file}`, 'modified replay');
    const result = check(root);
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /replay\.html/);
  });
}

for (const [description, ref] of [
  ['null', null],
  ['missing file', { sha256: hash('fixture') }],
  ['missing hash', { file: 'reduced-review-replay.html' }],
]) {
  test(`a declared replay with ${description} fails closed even for reduced motion`, (t) => {
    const root = project(t);
    const { index } = currentEvidence(root);
    assertConsistent(root);
    index.captures.find((capture) => capture.viewport === 'reduced').replay = ref;
    persistIndex(root, index);
    const result = check(root);
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /artifact|replay/i);
  });
}

for (const attempt of [
  { status: 'failed', runId: 'test-capture' },
  { status: 'running', runId: 'test-capture' },
  { status: 'complete', runId: 'another-capture' },
]) {
  test(`valid replay evidence cannot bypass run completion binding (${attempt.status}/${attempt.runId})`, (t) => {
    const root = project(t);
    currentEvidence(root);
    assertConsistent(root);
    write(root, '.impresario/scenes/run.json', attempt);
    const result = check(root);
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /capture attempt|match this index/i);
  });
}

test('a structurally valid reviewer rejection remains NOT EVALUATED, not creative PASS', (t) => {
  const root = project(t);
  currentEvidence(root);
  const indexBytes = fs.readFileSync(path.join(root, indexFile));
  write(root, '.impresario/creative-review.json', {
    verdict: 'rejected', reviewer: { kind: 'independent-agent', name: 'fixture reviewer' },
    captureHash: hash(indexBytes),
    evidence: 'Fixture replay and checkpoint artifacts do not establish creative quality.',
    limitations: 'Integrity regression fixture only; no actual visual review was performed.',
  });
  const result = assertConsistent(root);
  assert.match(result.stdout, /Recorded visual review: rejected/);
  assert.match(result.stdout, /reviewer assertions are not verified by this tool/);
});
