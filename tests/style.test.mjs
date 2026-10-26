import test from 'node:test';
import assert from 'node:assert/strict';
import { project, write, run } from './helpers.mjs';

test('physical lighting, optical surfaces and gradients are not universal failures', (t) => {
  const root = project(t);
  write(root, 'index.html', '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><title>Optics</title><style>.lens{background:radial-gradient(red,black);backdrop-filter:blur(2px);box-shadow:0 20px 40px #000;transition:width .3s}:focus-visible{outline:2px solid red}</style></head><body><h1>Optics</h1></body></html>');
  const result = run('lint.mjs', ['index.html'], root);
  assert.equal(result.status, 0, result.stdout);
  assert.match(result.stdout, /warn/i);
});
test('zoom blocking remains a hard usability failure', (t) => {
  const root = project(t);
  write(root, 'index.html', '<html><head><title>X</title><meta name="viewport" content="width=device-width,user-scalable=no"></head><body><h1>X</h1></body></html>');
  assert.equal(run('lint.mjs', ['index.html'], root).status, 1);
});
