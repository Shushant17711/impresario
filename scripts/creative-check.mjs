#!/usr/bin/env node
/** Evidence consistency, NOT a creative or rendering-mechanism score. */
import fs from 'node:fs';
import path from 'node:path';
import { collectInputs, validateManifest, validateIndex, validateReview } from './lib/evidence.mjs';

const root = path.resolve(process.argv[2] || '.');
try {
  collectInputs(root);
  const notes = path.join(root, '.impresario');
  const report = fs.readFileSync(path.join(notes, 'report.md'), 'utf8');
  if (!report.trim()) throw new Error('Missing or empty report.md');
  const manifestBytes = fs.readFileSync(path.join(notes, 'scenes.json'));
  const plan = validateManifest(JSON.parse(manifestBytes), root);
  let indexBytes;
  if (plan.scenes.length) {
    indexBytes = fs.readFileSync(path.join(notes, 'scenes/index.json'));
    validateIndex(JSON.parse(indexBytes), root, plan, manifestBytes);
  }
  const reviewPath = path.join(notes, 'creative-review.json');
  if (fs.existsSync(reviewPath)) {
    if (!indexBytes) throw new Error('Creative review has no capture index');
    const verdict = validateReview(JSON.parse(fs.readFileSync(reviewPath, 'utf8')), indexBytes);
    console.log(`Recorded visual review: ${verdict} (reviewer assertions are not verified by this tool)`);
  }
  console.log('Evidence consistency: PASS');
  console.log('Creative acceptance: NOT EVALUATED — independent desktop/mobile visual review required.');
} catch (err) {
  console.error(`Evidence consistency: FAIL — ${err.message}`);
  console.error('Creative acceptance: NOT EVALUATED');
  process.exitCode = 1;
}
