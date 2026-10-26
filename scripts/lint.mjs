#!/usr/bin/env node
/**
 * impresario / lint.mjs
 * Source scan for the house rules in SKILL.md and references/tells.md.
 *
 *   node lint.mjs <file-or-folder> [<file-or-folder> ...]
 *
 * No dependencies. Exits 1 if any FAIL is found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT = new Set([
  '.html', '.htm', '.css', '.scss', '.sass', '.less',
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.mdx',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit',
  'coverage', '.turbo', '.cache', 'public', 'vendor', '__snapshots__',
]);

const findings = [];
let filesScanned = 0;

const rel = (p) => relative(process.cwd(), p).split(sep).join('/');

function add(severity, file, line, rule, message) {
  findings.push({ severity, file, line, rule, message });
}

function walk(target, out = []) {
  let st;
  try { st = statSync(target); } catch { return out; }
  if (st.isDirectory()) {
    for (const entry of readdirSync(target)) {
      if (SKIP_DIRS.has(entry) || entry.startsWith('.impresario')) continue;
      const full = join(target, entry);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (EXT.has(extname(entry))) out.push(full);
    }
  } else if (EXT.has(extname(target))) {
    out.push(target);
  }
  return out;
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

const countMatches = (text, re) => (text.match(re) || []).length;

/**
 * Extract a <tag> body from a file, recording where it starts so that matches
 * inside it can be reported at their real line number.
 */
function extractBlocks(text, tag) {
  const out = [];
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  for (const m of text.matchAll(re)) {
    out.push({ text: m[1], offset: m.index + m[0].indexOf(m[1], m[0].indexOf('>') + 1) });
  }
  return out;
}

/* ------------------------------------------------------------------ rules */

const PHRASES = [
  'welcome to', 'in today.s fast-paced', 'unlock your potential', 'elevate your',
  'supercharge', 'game-chang', 'game chang', 'cutting-edge', 'seamless(ly)?',
  'take it to the next level', 'built with love', 'crafted with passion',
  'your vision, our passion', 'let.s create something', 'start your journey',
  'everything you need, in one place', 'solutions that scale', 'empowering teams',
  'delve into', 'dive deep', 'unlock insights', 'level up your', 'revolution(ise|ize)',
  'next-level', 'bespoke solutions', 'journey begins', 'step into the future',
  'lorem ipsum', 'feature one', 'your text here', 'placeholder text',
  'ai-powered', 'powered by ai', 'the future of', 'not your average',
];

/**
 * HTML rules follow the same shape as the CSS rules:
 *   test(s) -> true when the problem is present.
 *   find(s) -> array of offending snippets, so each one gets its own line number.
 */

const HTML_RULES = [
  {
    id: 'meta-viewport',
    severity: 'FAIL',
    test: (s) => !/<meta[^>]+name=["\']viewport["\']/i.test(s),
    msg: 'No <meta name="viewport">. The page will not scale on a phone.',
  },
  {
    id: 'meta-zoom',
    severity: 'FAIL',
    test: (s) => /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\b|\.)/i.test(s),
    msg: 'Viewport blocks zoom (user-scalable=no / maximum-scale=1).',
  },
  {
    id: 'html-lang',
    severity: 'WARN',
    test: (s) => !/<html[^>]+lang\s*=/i.test(s),
    msg: '<html> has no lang attribute.',
  },
  {
    id: 'title',
    severity: 'FAIL',
    test: (s) => !/<title[^>]*>[^<]{1,}/i.test(s),
    msg: 'No non-empty <title>.',
  },
  {
    id: 'h1-count',
    severity: 'WARN',
    test: (s) => countMatches(s, /<h1[\s>]/gi) !== 1,
    msg: (s) => `Expected exactly one <h1>, found ${countMatches(s, /<h1[\s>]/gi)}.`,
  },
  {
    id: 'img-alt',
    severity: 'FAIL',
    find: (s) => (s.match(/<img\b[^>]*>/gi) || []).filter((t) => !/\balt\s*=/i.test(t)),
    msg: 'An <img> has no alt attribute (use alt="" if purely decorative).',
  },
  {
    id: 'emoji',
    severity: 'WARN',
    find: (s) => [...s.matchAll(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)].map((m) => m[0]),
    msg: 'Emoji detected. Use an icon set or drawn marks instead.',
  },
  {
    id: 'target-blank',
    severity: 'WARN',
    find: (s) => (s.match(/<a\b[^>]*target=["\']_blank["\'][^>]*>/gi) || [])
      .filter((t) => !/rel\s*=\s*["\'][^"\']*noopener/i.test(t)),
    msg: 'A target="_blank" link has no rel="noopener".',
  },
  {
    id: 'outline-none',
    severity: 'FAIL',
    test: (s) => /outline\s*:\s*(none|0)\b/i.test(s) && !/:focus-visible/i.test(s),
    msg: 'outline removed without a :focus-visible replacement.',
  },
  {
    id: 'overflow-hidden-coverup',
    severity: 'WARN',
    test: (s) => /overflow-x\s*:\s*hidden/i.test(s),
    msg: 'overflow-x:hidden hides horizontal overflow instead of fixing it.',
  },
];

const CSS_RULES = [
  {
    id: 'gradient',
    severity: 'WARN',
    find: (s) => [...s.matchAll(/(linear|radial|conic)-gradient\s*\([\s\S]{0,200}?\)/gi)].map((m) => m[0]),
    msg: 'Gradient: verify a subject-derived lighting/material/composition role and readable contrast; reject generic decoration.',
    // A scrim under text on a photograph is the one allowed use.
    except: (s, m) => (m ? /rgba\([^)]*,\s*0?\.\d+\s*\)|transparent/i.test(m) : false),
  },
  {
    id: 'gradient-text',
    severity: 'WARN',
    test: (s) => /background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text/i.test(s),
    msg: 'Text masking: verify intentional display typography and contrast, not decorative default styling.',
  },
  {
    id: 'backdrop-filter',
    severity: 'WARN',
    test: (s) => /backdrop-filter\s*:/i.test(s),
    msg: 'Backdrop filter: justify the optical/spatial role and test readability/performance. Blur is not true refraction.',
  },
  {
    id: 'box-shadow-static',
    severity: 'WARN',
    test: (s) => /box-shadow\s*:/i.test(s),
    msg: 'Shadow: verify physical contact/depth or functional elevation; avoid decorative card shadows by default.',
  },
  {
    id: 'text-shadow',
    severity: 'WARN',
    test: (s) => /text-shadow\s*:/i.test(s),
    msg: 'Text shadow: verify subject-specific lighting or legibility rather than a generic glow.',
  },
  {
    id: 'hairline-border',
    severity: 'WARN',
    find: (s) => [...s.matchAll(/border(?:-top|-bottom|-left|-right)?\s*:\s*1px\s+(?:solid|dashed|dotted)\b[^\n;]*/gi)].map((m) => m[0]),
    msg: '1px border used as a divider or box outline. Use space or a tone step.',
  },
  {
    id: 'uppercase',
    severity: 'WARN',
    test: (s) => /text-transform\s*:\s*uppercase/i.test(s),
    msg: 'text-transform:uppercase. Only for genuine short labels, never eyebrows.',
  },
  {
    id: 'letter-spacing',
    severity: 'WARN',
    test: (s) => /letter-spacing\s*:\s*0\.\d+em/i.test(s),
    msg: 'Small letter-spacing, usually on an uppercase label. Avoid.',
  },
  {
    id: 'animate-layout',
    severity: 'WARN',
    test: (s) => /transition[^;{}]*(?:\bwidth|\bheight|\btop|\bleft|\bmargin|\bpadding|\bfont-size)\b[^;{}]*(?:0?\.\d+|\d+m?s)/i.test(s),
    msg: 'Layout animation: prefer composited properties for DOM motion; measure repaint cost if layout is essential to the concept.',
  },
  {
    id: 'will-change',
    severity: 'WARN',
    test: (s) => /will-change\s*:/i.test(s),
    msg: 'will-change found. Keep it to one or two elements and remove it after.',
  },
  {
    id: 'blur-heavy',
    severity: 'WARN',
    test: (s) => /filter\s*:\s*blur\s*\(\s*([1-9]\d|\d{3,})px/i.test(s),
    msg: 'Heavy blur filter. Expensive to composite; usually decoration.',
  },
  {
    id: 'reduced-motion-missing',
    severity: 'WARN',
    test: (s) => /@keyframes|animation\s*:/i.test(s) && !/prefers-reduced-motion/i.test(s),
    msg: 'Animations declared with no prefers-reduced-motion fallback.',
  },
  {
    id: 'scroll-behavior',
    severity: 'WARN',
    test: (s) => /scroll-behavior\s*:\s*smooth/i.test(s) && !/prefers-reduced-motion/i.test(s),
    msg: 'scroll-behavior:smooth with no reduced-motion guard.',
  },
  {
    id: 'important-abuse',
    severity: 'WARN',
    test: (s) => countMatches(s, /!\s*important/g) > 6,
    msg: 'Many !important declarations. Specificity is usually the real problem.',
  },
];

const JS_RULES = [
  {
    id: 'wheel-prevent',
    severity: 'FAIL',
    test: (s) => /addEventListener\s*\(\s*['"](?:wheel|mousewheel)['"]/.test(s) &&
      /preventDefault/.test(s),
    msg: 'Wheel event with preventDefault: scroll hijacking. Never capture the wheel.',
  },
  {
    id: 'scroll-snap',
    severity: 'WARN',
    test: (s) => /scroll-snap-type/i.test(s),
    msg: 'scroll-snap-type. Snapping fights the reader; verify it is deliberate.',
  },
  {
    id: 'scroll-listener',
    severity: 'WARN',
    test: (s) => /addEventListener\s*\(\s*['"]scroll['"]/.test(s),
    msg: 'A scroll listener. Prefer IntersectionObserver or a scrubbed timeline.',
  },
  {
    id: 'set-interval',
    severity: 'WARN',
    test: (s) => /setInterval\s*\(/.test(s),
    msg: 'setInterval. Check it is cleaned up and pauses when off-screen.',
  },
];

/* ------------------------------------------------------------------- main */

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('usage: node lint.mjs <file-or-folder> [...]');
  process.exit(2);
}

const files = targets.flatMap((t) => walk(t));

if (files.length === 0) {
  console.error('lint: no matching files found.');
  process.exit(2);
}

for (const file of files) {
  filesScanned++;
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  const ext = extname(file);
  const isHtml = ['.html', '.htm', '.vue', '.svelte', '.astro', '.jsx', '.tsx', '.mdx'].includes(ext);
  const isCss = ['.css', '.scss', '.sass', '.less', '.vue', '.svelte', '.astro'].includes(ext);
  const isJs = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'].includes(ext);


  // CSS and JS can live inside an HTML file: scan <style> and <script> blocks.
  // Each chunk remembers where it starts so findings get real line numbers.
  const cssChunks = [];
  const jsChunks = [];
  if (isHtml) {
    for (const b of extractBlocks(text, 'style')) cssChunks.push(b);
    for (const b of extractBlocks(text, 'script')) jsChunks.push(b);
  } else {
    if (isCss) cssChunks.push({ text, offset: 0 });
    if (isJs) jsChunks.push({ text, offset: 0 });
  }

  const scan = (chunks, set, kind) => {
    chunks.forEach(({ text: chunk, offset: base }) => {
      for (const rule of set) {
        let matches = [];
        if (rule.find) {
          matches = rule.find(chunk);
        } else if (rule.test && !rule.test(chunk)) {
          continue;
        } else if (rule.regex) {
          matches = [...chunk.matchAll(rule.regex)].map((m) => m[0]);
        } else {
          matches = [null];
        }
        let searchFrom = 0;
        for (const m of matches) {
          if (rule.except && rule.except(chunk, m)) continue;
          let line = 0;
          if (m) {
            const at = chunk.indexOf(m, searchFrom);
            if (at !== -1) searchFrom = at + m.length;
            line = lineOf(text, base + (at === -1 ? 0 : at));
          }
          add(rule.severity, rel(file), line, rule.id,
            typeof rule.msg === 'function' ? rule.msg(chunk) : rule.msg);
        }
      }
    });
  };

  scan([{ text, offset: 0 }], isHtml ? HTML_RULES : [], 'html');
  scan(cssChunks, CSS_RULES, 'css');
  scan(jsChunks, JS_RULES, 'js');

  // Copy phrases, only in user-facing text files.
  if (isHtml || ext === '.jsx' || ext === '.tsx' || ext === '.vue' || ext === '.svelte' || ext === '.mdx') {
    const lower = text.toLowerCase();
    for (const phrase of PHRASES) {
      const idx = lower.indexOf(phrase);
      if (idx === -1) continue;
      add('WARN', rel(file), lineOf(text, idx), 'stock-phrase',
        `Stock phrase found: "${phrase}". Say the thing instead.`);
    }
  }
}

/* ---------------------------------------------------------------- report */

const order = { FAIL: 0, WARN: 1 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.file.localeCompare(b.file));

const fails = findings.filter((f) => f.severity === 'FAIL');
const warns = findings.filter((f) => f.severity === 'WARN');

console.log(`impresario lint — ${filesScanned} file(s) scanned`);
console.log('');

if (findings.length === 0) {
  console.log('PASS  no banned patterns found');
} else {
  let last = '';
  for (const f of findings) {
    if (f.file !== last) {
      console.log(f.file);
      last = f.file;
    }
    const loc = f.line ? `:${f.line}` : '';
    console.log(`  ${f.severity === 'FAIL' ? 'FAIL' : 'warn'}  ${f.rule}${loc}  ${f.message}`);
  }
  console.log('');
}

console.log(`FAIL ${fails.length}   WARN ${warns.length}`);

if (warns.length) {
  console.log('');
  console.log('WARNs require contextual review: legitimate rendering techniques are not defects merely because they appear here.');
}

process.exit(fails.length ? 1 : 0);
