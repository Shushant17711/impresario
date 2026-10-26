/** Structural evidence only. No static scan can measure creativity or verify a rendering claim. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { VIEWPORTS, validateCapture } from './scene-plan.mjs';

const SKIP = new Set(['node_modules', '.git', '.impresario', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit', 'coverage', '.cache', '.turbo', 'vendor']);
const INPUT = /\.(html?|css|s[ac]ss|less|[mc]?js|jsx|tsx?|vue|svelte|astro|mdx|json|ya?ml|csv|tsv|txt|glsl|wgsl|vert|frag|svg|png|jpe?g|webp|avif|gif|mp4|webm|glb|gltf|bin|ktx2|hdr|exr|woff2?)$/i;
const CODE = /\.(html?|css|s[ac]ss|less|[mc]?js|jsx|tsx?|vue|svelte|astro|mdx|glsl|wgsl|vert|frag)$/i;
export const hash = (data) => createHash('sha256').update(data).digest('hex');
export const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function inside(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) throw new Error('Evidence path must be project-relative');
  const base = fs.realpathSync(root);
  const target = fs.realpathSync(path.resolve(root, relative));
  if (!target.startsWith(`${base}${path.sep}`)) throw new Error(`Evidence path escapes its root: ${relative}`);
  if (!fs.statSync(target).isFile()) throw new Error(`Evidence is not a file: ${relative}`);
  return target;
}

export function collectInputs(root) {
  if (!fs.statSync(root).isDirectory()) throw new Error('Project root must be a directory');
  const result = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || SKIP.has(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (INPUT.test(entry.name)) result.push(path.relative(root, file).split(path.sep).join('/'));
    }
  }
  walk(root);
  if (!result.some((f) => CODE.test(f))) throw new Error('Project contains no source files');
  return result.sort();
}

export function sourceSnapshot(root, plan) {
  const files = new Set(collectInputs(root));
  for (const scene of plan.scenes) {
    for (const ref of scene.source) files.add(ref.file);
    for (const asset of scene.assets) files.add(asset.file);
  }
  return Object.fromEntries([...files].sort().map((file) => [file, hash(fs.readFileSync(inside(root, file)))]));
}

const text = (value) => typeof value === 'string' && value.trim().length > 0;
export function validateManifest(plan, root) {
  if (!plan || plan.version !== 1 || !['expressive', 'composed', 'app'].includes(plan.mode) || !Array.isArray(plan.scenes)) {
    throw new Error('scenes.json requires version 1, mode expressive/composed/app and a scenes array');
  }
  if (plan.mode === 'expressive' && !plan.scenes.some((s) => s.role === 'flagship')) throw new Error('Expressive manifest needs a flagship scene');
  const ids = new Set();
  for (const scene of plan.scenes) {
    if (!scene || !/^[a-z0-9][a-z0-9-]*$/.test(scene.id) || ids.has(scene.id)) throw new Error('Scene IDs must be unique safe names');
    ids.add(scene.id);
    if (!['flagship', 'support'].includes(scene.role) || !text(scene.action) || !text(scene.purpose) || !text(scene.selector)) throw new Error(`${scene.id}: missing role, action, purpose or stage selector`);
    for (const state of ['entry', 'transformation', 'resolution']) {
      if (!text(scene.compositions?.[state])) throw new Error(`${scene.id}: missing ${state} composition`);
    }
    if (!Array.isArray(scene.source) || !scene.source.length) throw new Error(`${scene.id}: missing source references`);
    for (const ref of scene.source) {
      if (!text(ref.anchor) || !fs.readFileSync(inside(root, ref.file), 'utf8').includes(ref.anchor)) throw new Error(`${scene.id}: missing source anchor in ${ref.file}`);
    }
    if (!Array.isArray(scene.assets)) throw new Error(`${scene.id}: assets array required (empty for procedural/data scenes)`);
    for (const asset of scene.assets) {
      inside(root, asset.file);
      if (!text(asset.kind) || !text(asset.fidelity) || !text(asset.provenance)) throw new Error(`${scene.id}: asset needs kind, fidelity and provenance`);
    }
    if (!scene.viewports || !Object.keys(scene.viewports).length) throw new Error(`${scene.id}: missing viewports`);
    for (const [viewport, config] of Object.entries(scene.viewports)) {
      if (!VIEWPORTS[viewport]) throw new Error(`${scene.id}: unknown viewport ${viewport}`);
      validateCapture(config, `${scene.id}/${viewport}`, plan.mode === 'expressive' && !VIEWPORTS[viewport].reduced);
    }
    if (plan.mode === 'expressive') {
      for (const viewport of Object.keys(VIEWPORTS)) if (!scene.viewports[viewport]) throw new Error(`${scene.id}: missing ${viewport} composition`);
    }
  }
  return plan;
}

export function validateIndex(index, root, plan, manifestBytes) {
  if (index?.version !== 1 || !Array.isArray(index.captures)) throw new Error('Missing or invalid scene capture index');
  if (index.manifestHash !== hash(manifestBytes)) throw new Error('Stale capture: manifest changed');
  if (JSON.stringify(index.sources) !== JSON.stringify(sourceSnapshot(root, plan))) throw new Error('Stale capture: source or assets changed');
  const output = path.join(root, '.impresario/scenes');
  const attempt = readJSON(path.join(output, 'run.json'));
  if (attempt.status !== 'complete' || !text(attempt.runId) || attempt.runId !== index.runId) throw new Error('Latest capture attempt is incomplete, failed or does not match this index');
  const artifact = (ref) => {
    if (!ref || !text(ref.file) || !text(ref.sha256)) throw new Error('Missing capture artifact');
    const bytes = fs.readFileSync(inside(output, ref.file));
    if (!bytes.length || hash(bytes) !== ref.sha256) throw new Error(`Stale or modified capture artifact: ${ref.file}`);
    return bytes;
  };
  const expected = plan.scenes.flatMap((scene) => Object.keys(scene.viewports).map((viewport) => `${scene.id}/${viewport}`));
  const found = new Set();
  for (const capture of index.captures) {
    const id = `${capture.scene}/${capture.viewport}`;
    if (!expected.includes(id) || found.has(id)) throw new Error(`Unknown or duplicate capture: ${id}`);
    found.add(id);
    const scene = plan.scenes.find((s) => s.id === capture.scene);
    const config = scene.viewports[capture.viewport];
    const checkpoints = config.range ? config.checkpoints : config.steps.map((s) => s.label);
    if (!Array.isArray(capture.frames) || capture.frames.length !== checkpoints.length) throw new Error(`${id}: missing checkpoint frames`);
    capture.frames.forEach((frame, i) => {
      if ((config.range ? frame.progress : frame.label) !== checkpoints[i]) throw new Error(`${id}: incorrect checkpoint ${i}`);
      artifact(frame);
    });
    artifact(capture.filmstrip);
    const needsRecording = plan.mode === 'expressive' && !VIEWPORTS[capture.viewport].reduced;
    if (Object.hasOwn(capture, 'replay') || needsRecording) artifact(capture.replay);
    if (Object.hasOwn(capture, 'recording') || needsRecording) {
      const recording = JSON.parse(artifact(capture.recording).toString('utf8'));
      if (recording.version !== 1 || !Array.isArray(recording.frames) || recording.frames.length < 2) throw new Error(`${id}: incomplete browser recording`);
      recording.frames.forEach((frame, i) => {
        if (!Number.isFinite(frame.timestamp) || (i > 0 && frame.timestamp < recording.frames[i - 1].timestamp)) throw new Error(`${id}: invalid recording timestamp`);
        artifact(frame);
      });
    }
  }
  for (const id of expected) if (!found.has(id)) throw new Error(`Missing scene capture: ${id}`);
}

export function validateReview(review, indexBytes) {
  if (!['accepted', 'rejected', 'pending'].includes(review.verdict)) throw new Error('Invalid creative review verdict');
  if (review.captureHash !== hash(indexBytes)) throw new Error('Creative review is not bound to current capture index');
  if (!['human', 'independent-agent'].includes(review.reviewer?.kind) || !text(review.reviewer?.name)) throw new Error('Creative review must identify a human or independent visual reviewer, not the builder');
  if (!text(review.evidence) || !text(review.limitations)) throw new Error('Creative review needs artifact-specific evidence and limitations');
  return review.verdict;
}
