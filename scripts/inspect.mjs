#!/usr/bin/env node
/**
 * impresario / inspect.mjs
 *
 * Measures a rendered page in a real browser and writes screenshots.
 *
 *   node inspect.mjs <url> [--out DIR] [--widths 1440,768,390] [--no-shots]
 *
 * No dependencies. Needs Chrome, Chromium or Edge (set CHROME_PATH if it is
 * not in a standard location).
 *
 * Exits 1 if any FAIL is found.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  launchChrome, CDP, openPage, goto, evaluate, setViewport, setReducedMotion,
  screenshot, toFileUrl,
} from './lib/cdp.mjs';
import { colourHistogram } from './lib/png.mjs';
import { CHECKS } from './lib/checks.mjs';
import { MEASURE_EXPRESSION } from './lib/measure.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {
    url: null,
    out: '.impresario/inspect',
    widths: [1440, 768, 390],
    shots: true,
    quiet: false,
    help: false,
  };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out' || a === '-o') args.out = argv[++i];
    else if (a === '--widths' || a === '-w') {
      args.widths = String(argv[++i])
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter(Boolean);
    } else if (a === '--no-shots') args.shots = false;
    else if (a === '--quiet' || a === '-q') args.quiet = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else rest.push(a);
  }
  args.url = rest[0] || null;
  return args;
}

function runChecks(m, ctx) {
  const findings = [];
  for (const check of CHECKS) {
    let out;
    try {
      out = check.run(m, ctx) || [];
    } catch (err) {
      out = [{ severity: 'WARN', message: `check "${check.id}" threw: ${err.message}` }];
    }
    for (const f of out) findings.push({ ...f, id: check.id });
  }
  return findings;
}
// __CHUNK2__

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`impresario inspect

  node inspect.mjs <url> [options]

  --out, -o DIR     output directory (default .impresario/inspect)
  --widths, -w LIST viewport widths (default 1440,768,390)
  --no-shots        measure only, do not write screenshots
  --quiet, -q       print only the summary line
`);
    return 0;
  }

  if (!args.url) {
    console.error('inspect: a URL is required.');
    console.error('  node inspect.mjs http://localhost:3000');
    return 2;
  }

  const url = toFileUrl(args.url);
  const outDir = resolve(args.out);
  mkdirSync(outDir, { recursive: true });

  let browser;
  try {
    browser = await launchChrome({ headless: true });
  } catch (err) {
    console.error(`inspect: ${err.message}`);
    return 2;
  }

  const results = [];
  let exitCode = 0;

  try {
    const cdp = await CDP.connect(browser.webSocketDebuggerUrl);
    const { sessionId } = await openPage(cdp);
    const smallest = Math.min(...args.widths);

    for (const width of args.widths) {
      const height = width <= 480 ? 844 : width <= 900 ? 1024 : 900;
      await setViewport(cdp, sessionId, width, height, width <= 480, 1);
      await setReducedMotion(cdp, sessionId, false);
      await goto(cdp, sessionId, url, { settle: 800 });

      const m = await evaluate(cdp, sessionId, MEASURE_EXPRESSION);

      let shot = null;
      let palette = null;
      if (args.shots) {
        shot = await screenshot(cdp, sessionId, { fullPage: false });
        try { palette = colourHistogram(shot, { quantize: 16, step: 2 }); } catch { palette = null; }
      }

      const findings = runChecks(m, { width, palette, reduced: false });

      if (shot) {
        writeFileSync(join(outDir, `${width}-viewport.png`), shot);
        try {
          const full = await screenshot(cdp, sessionId, { fullPage: true });
          writeFileSync(join(outDir, `${width}-full.png`), full);
        } catch { /* a very long page may exceed the capture limit */ }
      }

      results.push({ width, m, findings, palette });

      // Reduced-motion pass at the smallest width only: it is a content check,
      // not a layout check, and one pass is enough to catch hidden content.
      if (width === smallest) {
        await setReducedMotion(cdp, sessionId, true);
        await goto(cdp, sessionId, url, { settle: 700 });
        const rm = await evaluate(cdp, sessionId, MEASURE_EXPRESSION);
        const rmFindings = runChecks(rm, { width, palette: null, reduced: true })
          .filter((f) => f.id === 'reduced-motion');
        results[results.length - 1].findings.push(...rmFindings);

        if (args.shots) {
          const rmShot = await screenshot(cdp, sessionId, { fullPage: false });
          writeFileSync(join(outDir, `${width}-reduced-motion.png`), rmShot);
        }
        await setReducedMotion(cdp, sessionId, false);
      }
    }

    cdp.close();
  } catch (err) {
    console.error(`inspect: ${err.message}`);
    exitCode = 2;
  } finally {
    if (browser) await browser.close();
  }

  if (!args.quiet) {
    console.log(`impresario inspect — ${url}`);
    console.log(`screenshots: ${outDir}`);
    console.log('');
  }

  let totalFail = 0;
  let totalWarn = 0;

  for (const r of results) {
    const fails = r.findings.filter((f) => f.severity === 'FAIL');
    const warns = r.findings.filter((f) => f.severity === 'WARN');
    totalFail += fails.length;
    totalWarn += warns.length;

    if (!args.quiet) {
      console.log(`${r.width}px`);
      console.log(`  h1: ${r.m.h1Text ? `"${r.m.h1Text}"` : '(none)'} · ${r.m.h1Size}px · ${r.m.h1Lines} line(s)`);
      console.log(`  headings: ${r.m.headingSizes.join(', ') || '—'}`);
      console.log(`  fonts: ${r.m.fontsLoaded.length ? r.m.fontsLoaded.join(', ') : '—'}`);
      if (r.palette && r.palette.colours.length) {
        const top = r.palette.colours.slice(0, 5)
          .map((c) => `${c.hex} ${Math.round(c.share * 100)}%`).join(' · ');
        console.log(`  palette: ${top}`);
      }
      console.log(`  sections: ${r.m.sections.length} · overflow: ${r.m.overflow.length} · hscroll: ${r.m.horizontalScroll ? 'yes' : 'no'}`);
      console.log('');
    }

    for (const f of r.findings) {
      if (!args.quiet) {
        console.log(`  ${f.severity === 'FAIL' ? 'FAIL' : 'warn'}  ${f.id}  ${f.message}`);
      }
    }
    if (!args.quiet && r.findings.length) console.log('');
  }

  const summary = results
    .map((r) => {
      const f = r.findings.filter((x) => x.severity === 'FAIL').length;
      const w = r.findings.filter((x) => x.severity === 'WARN').length;
      return `${r.width}: FAIL ${f} · WARN ${w}`;
    })
    .join('  |  ');

  console.log(`inspect — ${summary}   (FAIL ${totalFail} · WARN ${totalWarn})`);
  if (totalWarn) {
    console.log('');
    console.log('Every WARN is a defect until you can defend it in one sentence.');
  }

  if (totalFail > 0) exitCode = 1;
  return exitCode;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(`inspect: ${err.stack || err.message}`);
  process.exit(2);
});