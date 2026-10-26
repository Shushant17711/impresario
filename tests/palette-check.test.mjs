import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse } from '../scripts/palette-check.mjs';
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
test('tonal blue world passes', () => {
  const r = analyse(pal([['#0B2A4A', 50], ['#1F5F8B', 25], ['#9FD3E6', 20], ['#E6F4F8', 5]]));
  assert.deepEqual(r.flags, []);
});
