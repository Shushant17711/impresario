import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse, groundChanges, oklch } from '../scripts/palette-check.mjs';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const pal = (pairs) => pairs.map(([h, n]) => ({ hex: h, rgb: hex(h), count: n }));

test('paper + ink + ember is flagged', () => {
  const r = analyse(pal([['#ECEAE3', 80], ['#121212', 15], ['#FF4D1F', 5]]));
  assert.ok(r.flags.some((f) => f.startsWith('paper+ink+ember')));
  assert.ok(r.flags.some((f) => f.startsWith('neutral-led')));
});
test('graphite + neon is flagged', () => {
  const r = analyse(pal([['#0E0E10', 85], ['#C6FF3D', 10], ['#E8E8E8', 5]]));
  assert.ok(r.flags.some((f) => f.startsWith('graphite')));
});
test('a committed subject colour world passes', () => {
  const r = analyse(pal([['#E3A63A', 45], ['#9A4F14', 25], ['#F4DF9E', 20], ['#2A1608', 10]]));
  assert.deepEqual(r.flags, []);
});
test('tab10 rainbow is flagged', () => {
  const r = analyse(pal([['#1f77b4', 12], ['#ff7f0e', 12], ['#2ca02c', 12], ['#d62728', 12], ['#9467bd', 12], ['#8c564b', 12], ['#e377c2', 12], ['#bcbd22', 8], ['#17becf', 8]]));
  assert.ok(r.flags.some((f) => f.startsWith('rainbow')));
});
test('navy + neon cyan sci-fi is flagged', () => {
  const r = analyse(pal([['#060d1c', 70], ['#0b1626', 10], ['#63cff0', 10], ['#f2607a', 5], ['#e8f0ff', 5]]));
  assert.ok(r.flags.some((f) => f.startsWith('sci-fi-navy')));
});
test('tonal blue world passes', () => {
  const r = analyse(pal([['#0B2A4A', 50], ['#1F5F8B', 25], ['#9FD3E6', 20], ['#E6F4F8', 5]]));
  assert.deepEqual(r.flags, []);
});

test('per-section repaint is counted as churn; one stable ground is not', () => {
  const g = (h) => ({ o: oklch(hex(h)) });
  const slideshow = ['#1d6ea7', '#ff7f0e', '#2da42d', '#c92526', '#824eb2'].map(g);
  assert.ok(groundChanges(slideshow).changes.length >= 4);
  const world = ['#2a1f10', '#2a1f10', '#2c2112', '#2a1f10', '#dcb35a', '#dcb35a'].map(g);
  const r = groundChanges(world);
  assert.equal(r.changes.length, 1);
  assert.equal(r.distinct.length, 2);
});
