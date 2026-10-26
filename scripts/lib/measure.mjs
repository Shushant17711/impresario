/**
 * impresario / measure.mjs
 *
 * Node-side wrapper around the in-page measurement payload.
 * The browser-side code lives in measure-page.js because it must run inside
 * the page; this module loads it, injects it, and returns the parsed report.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluate } from './cdp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(join(HERE, 'measure-page.js'), 'utf8');

/** The raw source of the in-page payload, for callers that want to embed it. */
export const MEASURE_SOURCE = SRC;

/**
 * A self-contained expression that installs the payload and runs it.
 *
 * The payload is a statement (`window.__impresarioMeasure = function ...`), so
 * it cannot simply be wrapped in parentheses and called. Wrapping it in an
 * IIFE keeps it one expression, which is what Runtime.evaluate wants.
 */
export const MEASURE_EXPRESSION = `(() => {\n${SRC}\n; return window.__impresarioMeasure();\n})()`;

/**
 * Measure the page currently loaded in the given session.
 * @returns {Promise<object>} the report produced by measure-page.js
 */
export async function measurePage(cdp, sessionId) {
  const result = await evaluate(cdp, sessionId, MEASURE_EXPRESSION);
  if (!result || typeof result !== 'object') {
    throw new Error('Measurement returned nothing usable.');
  }
  return result;
}

/**
 * Measure with the page loaded and settled.
 */
export async function measureUrl(cdp, sessionId, url, { settle = 800 } = {}) {
  const { goto } = await import('./cdp.mjs');
  await goto(cdp, sessionId, url, { settle });
  return measurePage(cdp, sessionId);
}

export default measurePage;
