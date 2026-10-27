/* eslint-env browser */
/**
 * impresario / measure-page.js
 *
 * Runs inside the page and returns a JSON-serialisable report of what the
 * rendered page actually looks like. Injected by inspect.mjs and scenes.mjs.
 *
 * Deliberately defensive: a page may be half-built, may have no <body>, may
 * have opaque backgrounds. Nothing here should throw on a broken page.
 */
window.__impresarioMeasure = function measure() {
  const out = {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    horizontalScroll: false,
    fontsDeclared: [],
    fontsLoaded: [],
    fontsNotLoaded: [],
    headings: [],
    h1Count: 0,
    h1Lines: 0,
    h1Size: 0,
    h1Text: '',
    headingSizes: [],
    worstBodyContrast: null,
    sections: [],
    overflow: [],
    altless: [],
    noHeading: [],
    tapTargets: [],
    focusVisibleRules: 0,
    borders: 0,
    shadows: 0,
    gradients: 0,
    blurs: 0,
    blankStretches: [],
  };

  const parse = (rgb) => {
    const m = String(rgb || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
    if (parts.some((n) => Number.isNaN(n))) return null;
    return {
      r: parts[0] || 0,
      g: parts[1] || 0,
      b: parts[2] || 0,
      a: parts.length > 3 ? parts[3] : 1,
    };
  };

  const luminance = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const contrast = (a, b) => {
    const l1 = 0.2126 * luminance(a.r) + 0.7152 * luminance(a.g) + 0.0722 * luminance(a.b);
    const l2 = 0.2126 * luminance(b.r) + 0.7152 * luminance(b.g) + 0.0722 * luminance(b.b);
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  };

  const effectiveBg = (el) => {
    let node = el;
    let acc = null;
    while (node && node.nodeType === 1) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0) {
        if (bg.a >= 0.999) return bg;
        if (!acc) acc = { r: 0, g: 0, b: 0, a: 0 };
        acc = {
          r: acc.r + bg.r * bg.a * (1 - acc.a),
          g: acc.g + bg.g * bg.a * (1 - acc.a),
          b: acc.b + bg.b * bg.a * (1 - acc.a),
          a: acc.a + bg.a * (1 - acc.a),
        };
      }
      node = node.parentElement;
    }
    if (acc && acc.a > 0) {
      return { r: acc.r / acc.a, g: acc.g / acc.a, b: acc.b / acc.a, a: 1 };
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const label = (el) => {
    const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
    return t.length > 70 ? t.slice(0, 67) + '…' : t;
  };

  const sel = (el) => {
    if (!el || !el.tagName) return '(unknown)';
    const id = el.id ? '#' + el.id : '';
    const raw = typeof el.className === 'string' ? el.className.trim() : '';
    const cls = raw ? '.' + raw.split(/\s+/).slice(0, 2).join('.') : '';
    return el.tagName.toLowerCase() + id + cls;
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  out.scrollWidth = document.documentElement.scrollWidth;
  out.scrollHeight = document.documentElement.scrollHeight;
  out.horizontalScroll = out.scrollWidth > vw + 1;

  /* fonts */
  /*
   * Two different questions, kept apart on purpose:
   *   - which families does the CSS *ask* for (font-family declarations)?
   *   - which families does the browser actually have (document.fonts)?
   * Only @font-face rules create entries in document.fonts, so comparing the
   * two lists directly would report every locally installed face as missing.
   * A family is only "not loaded" when it was declared by @font-face and the
   * browser could not get it.
   */
  const declared = new Set();
  const webFamilies = new Set();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of Array.from(rules || [])) {
      if (!rule.style) continue;
      const families = String(rule.style.fontFamily || '')
        .split(',')
        .map((f) => f.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      for (const f of families) declared.add(f);
      // CSSRule.FONT_FACE_RULE === 5
      if (rule.type === 5) {
        for (const f of families) webFamilies.add(f);
      }
    }
  }

  const faces = new Map();
  const loaded = new Set();
  try {
    document.fonts.forEach((f) => {
      const name = String(f.family || '').replace(/^["']|["']$/g, '');
      if (!name) return;
      if (!faces.has(name)) faces.set(name, []);
      faces.get(name).push(f);
      if (f.status === 'loaded') loaded.add(name);
    });
  } catch { /* ignore */ }

  const generic = /^(serif|sans-serif|monospace|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|cursive|fantasy|-apple-system|blinkmacsystemfont|inherit|initial|unset)$/i;

  const notLoaded = [];
  for (const name of webFamilies) {
    if (generic.test(name)) continue;
    if (loaded.has(name)) continue;
    const list = faces.get(name) || [];
    if (list.some((f) => f.status === 'error')) { notLoaded.push(name); continue; }
    try {
      if (!document.fonts.check(`16px "${name}"`)) notLoaded.push(name);
    } catch { /* ignore */ }
  }

  out.fontsDeclared = [...declared];
  out.fontsLoaded = [...loaded];
  out.fontsNotLoaded = notLoaded;

  /* headings */
  const headingEls = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  for (const el of headingEls) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const size = parseFloat(cs.fontSize) || 0;
    const lh = cs.lineHeight === 'normal' ? size * 1.2 : (parseFloat(cs.lineHeight) || size);
    const lines = lh > 0 ? Math.max(1, Math.round(rect.height / lh)) : 1;
    const colour = parse(cs.color) || { r: 0, g: 0, b: 0, a: 1 };
    const bg = effectiveBg(el);
    out.headings.push({
      tag: el.tagName.toLowerCase(),
      selector: sel(el),
      text: label(el),
      size: Math.round(size * 10) / 10,
      lineHeight: Math.round(lh * 10) / 10,
      lines,
      width: Math.round(rect.width),
      contrast: Math.round(contrast(colour, bg) * 100) / 100,
      visible: rect.width > 0 && rect.height > 0 &&
        cs.visibility !== 'hidden' && cs.display !== 'none' &&
        parseFloat(cs.opacity) > 0.01,
    });
  }
  const h1s = out.headings.filter((h) => h.tag === 'h1' && h.visible);
  out.h1Count = h1s.length;
  out.h1Lines = h1s.length ? h1s[0].lines : 0;
  out.h1Size = h1s.length ? h1s[0].size : 0;
  out.h1Text = h1s.length ? h1s[0].text : '';
  out.headingSizes = [...new Set(out.headings.filter((h) => h.visible).map((h) => h.size))]
    .sort((a, b) => b - a);

  /* body text contrast — the worst offender is what matters */
  const bodyEls = Array.from(document.querySelectorAll(
    'p, li, dd, dt, figcaption, blockquote, td, th, label, span, a, button'
  ));
  let worst = null;
  for (const el of bodyEls) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (parseFloat(cs.opacity) < 0.05) continue;
    // Skip containers that have block children; we only judge leaf text.
    if (el.children.length > 0 && !el.matches('a, button, span')) continue;
    const own = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    );
    if (!own) continue;
    const colour = parse(cs.color);
    if (!colour || colour.a < 0.05) continue;
    const bg = effectiveBg(el);
    const ratio = contrast(colour, bg);
    const size = parseFloat(cs.fontSize) || 0;
    const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need && (!worst || ratio < worst.ratio)) {
      worst = {
        selector: sel(el),
        text: label(el),
        ratio: Math.round(ratio * 100) / 100,
        need,
        size: Math.round(size * 10) / 10,
      };
    }
  }
  out.worstBodyContrast = worst;

  /* sections */
  const sectionEls = Array.from(document.querySelectorAll(
    'section, article, header, footer, main > *, [role="region"]'
  ));
  const seen = new Set();
  for (const el of sectionEls) {
    if (seen.has(el)) continue;
    seen.add(el);
    const rect = el.getBoundingClientRect();
    if (rect.height < 40) continue;
    const cs = getComputedStyle(el);
    const inner = el.querySelector('*');
    let contentLeft = null;
    let contentRight = null;
    if (inner) {
      const ir = inner.getBoundingClientRect();
      contentLeft = Math.round(ir.left + window.scrollX);
      contentRight = Math.round(ir.right + window.scrollX);
    }
    out.sections.push({
      selector: sel(el),
      top: Math.round(rect.top + window.scrollY),
      height: Math.round(rect.height),
      hasHeading: !!el.querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]'),
      padLeft: Math.round(parseFloat(cs.paddingLeft) || 0),
      padRight: Math.round(parseFloat(cs.paddingRight) || 0),
      marginLeft: Math.round(parseFloat(cs.marginLeft) || 0),
      marginRight: Math.round(parseFloat(cs.marginRight) || 0),
      contentLeft,
      contentRight,
      background: cs.backgroundColor,
      position: cs.position,
      transform: cs.transform,
    });
  }

  /* horizontal overflow */
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.right <= vw + 1 && rect.left >= -1) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' && rect.width <= vw + 1) continue;
    if (cs.overflowX === 'hidden' || cs.overflowX === 'clip') continue;
    // clipped by an ancestor that itself stays inside the viewport (pinned stages,
    // fixed scene layers, masked reveals): the visitor never sees or scrolls to it
    let clipped = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const acs = getComputedStyle(a);
      if (acs.overflowX === 'hidden' || acs.overflowX === 'clip' || acs.overflow === 'hidden' || acs.overflow === 'clip') {
        const ar = a.getBoundingClientRect();
        if (ar.right <= vw + 1 && ar.left >= -1) { clipped = true; break; }
      }
    }
    if (clipped) continue;
    out.overflow.push({
      selector: sel(el),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
    });
    if (out.overflow.length > 40) break;
  }

  /* images without alt */
  for (const el of Array.from(document.querySelectorAll('img'))) {
    if (!el.hasAttribute('alt')) {
      out.altless.push({ selector: sel(el), src: (el.getAttribute('src') || '').slice(0, 80) });
    }
  }

  /* sections without a heading */
  for (const s of out.sections) {
    if (s.hasHeading) continue;
    if (s.height > 120) out.noHeading.push(s.selector);
  }

  /* tap targets */
  const TAP = 'a[href], button, input, select, textarea, [role="button"], [role="link"], summary';
  for (const el of Array.from(document.querySelectorAll(TAP))) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (rect.height >= 44 && rect.width >= 44) continue;
    // Inline links inside a paragraph are exempt — they are text, not targets.
    if (el.tagName === 'A' && el.closest('p, li') && cs.display === 'inline') continue;
    out.tapTargets.push({
      selector: sel(el),
      text: label(el),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
  }

  /* :focus-visible rules present in any stylesheet */
  let focusVisible = 0;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of Array.from(rules || [])) {
      if (rule.selectorText && /:focus-visible/.test(rule.selectorText)) focusVisible++;
    }
  }
  out.focusVisibleRules = focusVisible;

  /* decorative counts */
  let borders = 0;
  let shadows = 0;
  let gradients = 0;
  let blurs = 0;
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const cs = getComputedStyle(el);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const w = parseFloat(cs['border' + side + 'Width']);
      const style = cs['border' + side + 'Style'];
      if (w >= 0.5 && style && style !== 'none') borders++;
    }
    if (cs.boxShadow && cs.boxShadow !== 'none') shadows++;
    if (cs.backgroundImage && /gradient/.test(cs.backgroundImage)) gradients++;
    if (cs.backdropFilter && cs.backdropFilter !== 'none') blurs++;
  }
  out.borders = borders;
  out.shadows = shadows;
  out.gradients = gradients;
  out.blurs = blurs;

  /* blank vertical stretches between painted content */
  /*
   * Semantic <section> elements are not a reliable proxy for "where the
   * content is": many pages have no <section> tags at all, which would make
   * the whole page look like one blank stretch. Instead, measure the bands
   * actually covered by visible content and look for the gaps between them.
   */
  const MEDIA = 'img, svg, video, canvas, iframe, picture, button, input, select, textarea';
  const bands = [];
  const all = Array.from(document.body ? document.body.querySelectorAll('*') : []);
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (parseFloat(cs.opacity) < 0.05) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const isMedia = el.matches(MEDIA);
    const hasOwnText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    );
    // Ignore elements whose text belongs to a child that also reports it.
    if (!isMedia && !hasOwnText) continue;
    bands.push({
      top: Math.round(rect.top + window.scrollY),
      bottom: Math.round(rect.bottom + window.scrollY),
    });
  }

  bands.sort((a, b) => a.top - b.top);
  const merged = [];
  for (const b of bands) {
    const last = merged[merged.length - 1];
    if (last && b.top <= last.bottom + 1) {
      last.bottom = Math.max(last.bottom, b.bottom);
    } else {
      merged.push({ top: b.top, bottom: b.bottom });
    }
  }

  const pageBottom = Math.max(
    out.scrollHeight,
    document.body ? document.body.scrollHeight || 0 : 0
  );
  let cursor = 0;
  for (const band of merged) {
    if (band.top - cursor > vh * 0.5) {
      out.blankStretches.push({
        from: Math.round(cursor),
        to: Math.round(band.top),
        height: Math.round(band.top - cursor),
      });
    }
    cursor = Math.max(cursor, band.bottom);
  }
  if (pageBottom - cursor > vh * 0.5) {
    out.blankStretches.push({
      from: Math.round(cursor),
      to: Math.round(pageBottom),
      height: Math.round(pageBottom - cursor),
    });
  }

  return out;
};
