import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { project, write, run, evidence, hash } from './helpers.mjs';

for (const mode of ['composed', 'app']) {
  for (const mutation of ['delete JSON', 'corrupt JSON', 'delete frame', 'corrupt frame']) {
    test(`${mode} validates declared recording artifacts (${mutation})`, (t) => {
      const root = project(t);
      const { plan, index } = evidence(root);
      plan.mode = mode;
      write(root, '.impresario/scenes.json', plan);
      index.manifestHash = hash(fs.readFileSync(path.join(root, '.impresario/scenes.json')));
      const capture = index.captures[0];
      const bytes = fs.readFileSync(path.join(root, '.impresario/scenes', capture.frames[0].file));
      const frameFile = 'unique-recording-frame.png';
      write(root, `.impresario/scenes/${frameFile}`, bytes);
      const recordingBytes = JSON.stringify({ version: 1, frames: [{ file: frameFile, sha256: hash(bytes), timestamp: 0 }, { file: frameFile, sha256: hash(bytes), timestamp: 1 }] });
      write(root, `.impresario/scenes/${capture.recording.file}`, recordingBytes);
      capture.recording.sha256 = hash(recordingBytes);
      write(root, '.impresario/scenes/index.json', index);
      assert.equal(run('creative-check.mjs', [root], root).status, 0, 'Valid optional recording control should pass');
      const target = path.join(root, '.impresario/scenes', mutation.includes('JSON') ? capture.recording.file : frameFile);
      if (mutation.startsWith('delete')) fs.unlinkSync(target);
      else fs.writeFileSync(target, 'modified');
      const result = run('creative-check.mjs', [root], root);
      assert.notEqual(result.status, 0, result.stdout);
    });
  }
}
