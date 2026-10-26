/**
 * impresario / checks.mjs
 *
 * The inspection rules. Each check receives the measured page report and a
 * context object, and returns findings.
 *
 * A finding is { severity, message }.
 * FAIL = a defect. WARN = a judgement call; it must be defensible in one sentence.
 */

export const CHECKS = [
  {
    id: 'h1-present',
    run: (m) => {
      const out = [];
      if (m.h1Count === 0) {
        out.push({ severity: 'FAIL', message: 'No visible <h1>. The page has no title.' });
      } else if (m.h1Count > 1) {
        out.push({ severity: 'FAIL', message: `${m.h1Count} visible <h1> elements. There must be exactly one.` });
      } else if (!m.h1Text) {
        out.push({ severity: 'FAIL', message: 'The <h1> is empty.' });
      }
      return out;
    },
  },
  {
    id: 'h1-lines',
    run: (m) => {
      if (m.h1Count !== 1 || m.h1Lines <= 2) return [];
      return [{
        severity: 'WARN',
        message: `The <h1> runs ${m.h1Lines} lines. Check intentional display composition and mobile readability; two lines is a default, not a creative limit.`,
      }];
    },
  },
  {
    id: 'h1-legible',
    run: (m, ctx) => {
      if (m.h1Count !== 1) return [];
      const min = ctx.width <= 480 ? 30 : 34;
      if (m.h1Size >= min) return [];
      return [{
        severity: 'FAIL',
        message: `The <h1> is ${m.h1Size}px at ${ctx.width}px wide. It must be at least ${min}px.`,
      }];
    },
  },
  {
    id: 'heading-scale',
    run: (m) => {
      const sizes = m.headingSizes;
      if (sizes.length < 2) return [];
      for (let i = 1; i < sizes.length; i++) {
        if (sizes[i - 1] / sizes[i] < 1.1) {
          return [{
            severity: 'WARN',
            message: `Heading sizes ${sizes.join(', ')} are too close together; the hierarchy does not read.`,
          }];
        }
      }
      return [];
    },
  },
  {
    id: 'heading-contrast',
    run: (m) => {
      const out = [];
      for (const h of m.headings) {
        if (!h.visible) continue;
        const need = h.size >= 24 ? 3 : 4.5;
        if (h.contrast < need) {
          out.push({
            severity: 'FAIL',
            message: `${h.tag} "${h.text}" has ${h.contrast}:1 contrast; ${need}:1 needed.`,
          });
        }
      }
      return out;
    },
  },
  {
    id: 'body-contrast',
    run: (m) => {
      const w = m.worstBodyContrast;
      if (!w) return [];
      return [{
        severity: 'FAIL',
        message: `Text contrast ${w.ratio}:1 (needs ${w.need}:1) at ${w.selector} — "${w.text}".`,
      }];
    },
  },
  {
    id: 'fonts',
    run: (m) => {
      if (!m.fontsNotLoaded.length) return [];
      return [{
        severity: 'FAIL',
        message: `Declared but not loaded: ${m.fontsNotLoaded.join(', ')}. The page is falling back to a different face.`,
      }];
    },
  },
  {
    id: 'overflow',
    run: (m) => {
      if (!m.overflow.length) return [];
      const shown = m.overflow.slice(0, 4).map((o) => `${o.selector} (${o.left}→${o.right})`);
      const more = m.overflow.length > 4 ? ` (+${m.overflow.length - 4} more)` : '';
      return [{
        severity: 'FAIL',
        message: `${m.overflow.length} element(s) overflow horizontally: ${shown.join(', ')}${more}.`,
      }];
    },
  },
  {
    id: 'horizontal-scroll',
    run: (m) => {
      if (!m.horizontalScroll) return [];
      return [{
        severity: 'FAIL',
        message: `The page scrolls horizontally: scrollWidth ${m.scrollWidth} > viewport ${m.viewport.width}.`,
      }];
    },
  },
  {
    id: 'img-alt',
    run: (m) => {
      if (!m.altless.length) return [];
      const shown = m.altless.slice(0, 4).map((i) => i.selector).join(', ');
      return [{
        severity: 'FAIL',
        message: `${m.altless.length} <img> without alt: ${shown}. Use alt="" for decorative images.`,
      }];
    },
  },
  {
    id: 'focus-visible',
    run: (m) => {
      if (m.focusVisibleRules > 0) return [];
      return [{
        severity: 'WARN',
        message: 'No :focus-visible rule found in any stylesheet. Keyboard users get the browser default.',
      }];
    },
  },
  {
    id: 'tap-targets',
    run: (m, ctx) => {
      if (ctx.width > 480 || !m.tapTargets.length) return [];
      const shown = m.tapTargets.slice(0, 4)
        .map((t) => `${t.selector} ${t.width}×${t.height}`).join(', ');
      return [{
        severity: 'FAIL',
        message: `${m.tapTargets.length} tap target(s) under 44×44: ${shown}.`,
      }];
    },
  },
  {
    id: 'no-heading',
    run: (m) => {
      if (!m.noHeading.length) return [];
      return [{
        severity: 'WARN',
        message: `Section without a heading: ${m.noHeading.slice(0, 4).join(', ')}.`,
      }];
    },
  },
  {
    id: 'blank-stretch',
    run: (m) => {
      if (!m.blankStretches.length) return [];
      const worst = m.blankStretches.reduce((a, b) => (b.height > a.height ? b : a));
      return [{
        severity: 'WARN',
        message: `A blank stretch of ${worst.height}px (from ${worst.from} to ${worst.to}). Half a viewport is ${Math.round(m.viewport.height / 2)}px.`,
      }];
    },
  },
  {
    id: 'margin-balance',
    run: (m) => {
      const messages = [];
      for (const s of m.sections) {
        if (s.contentLeft === null || s.contentRight === null) continue;
        if (s.height < 200) continue;
        const left = s.contentLeft;
        const right = m.viewport.width - s.contentRight;
        const diff = Math.abs(left - right);
        if (diff > 2 && Math.min(left, right) > 0) {
          messages.push(`${s.selector} is not centred: ${left}px left, ${right}px right.`);
        }
      }
      if (!messages.length) return [];
      // Collapse repeats — a site-wide container offset is one problem, not eight.
      const unique = [...new Set(messages.map((s) => s.replace(/^[^ ]+ /, '')))];
      return [{
        severity: 'WARN',
        message: `${unique.length} section(s) have unequal margins (${unique.slice(0, 2).join('; ')}).`,
      }];
    },
  },
  {
    id: 'decorations',
    run: (m) => {
      const out = [];
      if (m.gradients > 0) {
        out.push({ severity: 'WARN', message: `${m.gradients} gradient(s): review subject-derived lighting/material role and contrast.` });
      }
      if (m.blurs > 0) {
        out.push({ severity: 'WARN', message: `${m.blurs} backdrop-filter(s): review optical role, readability and cost; blur is not refraction.` });
      }
      if (m.shadows > 0) {
        out.push({ severity: 'WARN', message: `${m.shadows} shadow(s): verify physical contact/depth or functional elevation, not default decoration.` });
      }
      if (m.borders > 0) {
        out.push({ severity: 'WARN', message: `${m.borders} visible border(s) in use. Prefer space or a tone step.` });
      }
      return out;
    },
  },
  {
    id: 'palette',
    run: (m, ctx) => {
      if (!ctx.palette || !ctx.palette.colours.length) return [];
      const out = [];
      const colours = ctx.palette.colours;
      const top = colours.slice(0, 6);
      const total = colours.reduce((s, c) => s + c.count, 0) || 1;
      const topShare = top.reduce((s, c) => s + c.count, 0) / total;
      if (topShare < 0.55) {
        out.push({
          severity: 'WARN',
          message: `The palette is fragmented: the top six colours cover only ${Math.round(topShare * 100)}% of the page.`,
        });
      }
      const topColour = top[0];
      if (topColour && topColour.share > 0.9) {
        out.push({
          severity: 'WARN',
          message: `One colour covers ${Math.round(topColour.share * 100)}% of the page. There is no field, no accent, no contrast.`,
        });
      }
      if (colours.length > 40) {
        out.push({
          severity: 'WARN',
          message: `${colours.length} distinct colours: review role consistency; imagery, spatial lighting and shaders may legitimately use many colours.`,
        });
      }
      return out;
    },
  },
  {
    id: 'reduced-motion',
    run: (m, ctx) => {
      if (!ctx.reduced) return [];
      const hidden = m.headings.filter((h) => !h.visible);
      if (!hidden.length) return [];
      return [{
        severity: 'FAIL',
        message: `With reduced motion on, ${hidden.length} heading(s) are hidden. Content must never depend on animation.`,
      }];
    },
  },
];
