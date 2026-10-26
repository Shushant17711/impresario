/** Pure scene-local capture planning. Bounds come from the actual runtime, not page height. */
export const VIEWPORTS = {
  desktop: { width: 1440, height: 900, mobile: false, reduced: false },
  phone: { width: 390, height: 844, mobile: true, reduced: false },
  reduced: { width: 1440, height: 900, mobile: false, reduced: true },
  'reduced-phone': { width: 390, height: 844, mobile: true, reduced: true },
};

export function scrollPositions(range, checkpoints) {
  if (!range || !Number.isFinite(range.start) || !Number.isFinite(range.end) || range.start < 0 || range.end <= range.start) {
    throw new Error('Scene range requires finite start >= 0 and end > start');
  }
  if (!Array.isArray(checkpoints) || checkpoints.length < 3 || checkpoints[0] !== 0 || checkpoints.at(-1) !== 1 ||
      checkpoints.some((p, i) => !Number.isFinite(p) || p < 0 || p > 1 || (i > 0 && p <= checkpoints[i - 1]))) {
    throw new Error('Scene checkpoints must increase from 0 to 1 with a transformation checkpoint');
  }
  const positions = checkpoints.map((p) => Math.round(range.start + (range.end - range.start) * p));
  if (new Set(positions).size !== positions.length) throw new Error('Scene range is too short for distinct checkpoints');
  return positions;
}

export function validateWait(wait, label) {
  if (wait.settleMs !== undefined && (!Number.isInteger(wait.settleMs) || wait.settleMs < 0 || wait.settleMs > 15000)) throw new Error(`${label}: settleMs must be 0–15000 milliseconds`);
  if (wait.timeoutMs !== undefined && (!Number.isInteger(wait.timeoutMs) || wait.timeoutMs < 100 || wait.timeoutMs > 20000)) throw new Error(`${label}: timeoutMs must be 100–20000 milliseconds`);
  if (wait.ready !== undefined) {
    const ready = wait.ready;
    if (!ready || typeof ready.selector !== 'string' || !ready.selector.trim() || typeof ready.attribute !== 'string' || !ready.attribute.trim() || typeof ready.equals !== 'string' ||
        Object.keys(ready).some((k) => !['selector', 'attribute', 'equals'].includes(k))) throw new Error(`${label}: readiness requires only selector, attribute and equals`);
  }
}

export function validateCapture(config, label, requireCoverage = false) {
  if (!config || typeof config !== 'object') throw new Error(`${label}: missing capture configuration`);
  validateWait(config, label);
  if (config.range && config.steps) throw new Error(`${label}: choose a range or interactive steps, not both`);
  if (config.range) {
    const positions = scrollPositions(config.range, config.checkpoints);
    if (config.waits !== undefined) {
      if (!Array.isArray(config.waits) || config.waits.length !== positions.length) throw new Error(`${label}: waits must match checkpoint positions`);
      config.waits.forEach((wait) => validateWait(wait || {}, label));
    }
    return positions;
  }
  if (config.checkpoints !== undefined || config.waits !== undefined) throw new Error(`${label}: checkpoints/waits are scroll-only fields and require a range`);
  if (!Array.isArray(config.steps) || config.steps.length === 0) throw new Error(`${label}: missing range or steps`);
  for (const step of config.steps) {
    if (!step || typeof step.label !== 'string' || !step.label.trim()) throw new Error(`${label}: step needs a label`);
    validateWait(step, label);
    if (step.state !== undefined && !['entry', 'transformation', 'resolution'].includes(step.state)) throw new Error(`${label}: invalid composition state`);
    const actions = ['click', 'pointer', 'key'].filter((k) => step[k] !== undefined);
    if (actions.length > 1) throw new Error(`${label}: only one native action per step`);
    if (step.click !== undefined && (typeof step.click !== 'string' || !step.click.trim())) throw new Error(`${label}: click needs a selector`);
    if (step.key !== undefined && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape', ' '].includes(step.key)) throw new Error(`${label}: unsupported key`);
    if (step.pointer && (typeof step.pointer.selector !== 'string' || !Number.isFinite(step.pointer.x) || !Number.isFinite(step.pointer.y) ||
        step.pointer.x < 0 || step.pointer.x > 1 || step.pointer.y < 0 || step.pointer.y > 1)) throw new Error(`${label}: pointer requires selector and normalized x/y`);
  }
  if (requireCoverage) {
    const states = ['entry', 'transformation', 'resolution'].map((state) => config.steps.findIndex((step) => step.state === state));
    if (states.some((i) => i < 0) || states[0] >= states[1] || states[1] >= states[2]) throw new Error(`${label}: composition coverage requires entry, transformation and resolution steps in order`);
  }
  return config.steps;
}
