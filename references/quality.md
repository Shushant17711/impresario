# Quality

The gate separates functional correctness, current browser evidence and independent
creative acceptance. Valid code, complete paperwork and a green evidence check cannot
certify the visual result.

---

## 1. The gate stack

For expressive work, run the browser evidence and independent review on the functional
flagship prototype **before** building the surrounding page. Repeat for the completed
page. Serious app screens stay task-first; no pinned scene or cinematic showpiece is
required. Use the appropriate tools for the declared mode:

```bash
node <skill>/scripts/lint.mjs ./src
node <skill>/scripts/inspect.mjs http://localhost:3000
node <skill>/scripts/scenes.mjs http://localhost:3000 --manifest .impresario/scenes.json --record
node <skill>/scripts/creative-check.mjs <project-root>
```

Run capture from the project root. Use [evidence.md](evidence.md) for the authoritative
manifest, artifact and review-record contract. The checker rejects invalid/empty roots,
missing referenced source and stale or incomplete evidence. It checks completeness and
freshness only and always reports **creative acceptance NOT EVALUATED**. Neither source
keywords nor counts of phases, entities, properties or motions establish creative merit.

**FAIL** = a defect in the relevant technical contract. Fix it. **WARN** = inspect in
context; document a defensible subject/task reason or fix it. Styling warnings are not
universal bans on shadows, gradients, grids, glass or expressive type.

## 2. What `inspect.mjs` measures

At 1440 x 900, 768 x 1024 and 390 x 844:

- Headline line count and computed size; review wrapping and hierarchy in context.
- The computed size of every heading; the hero title must be legible at 390 px.
- Fonts actually loaded (document.fonts) versus the families declared.
- Contrast of body text, headings and buttons against their backgrounds.
- Colours in use, and how much of the page each one covers (palette dominance).
- Hairline borders, box-shadows and gradients where reported; presence is not a verdict.
- Elements overflowing the viewport horizontally.
- Left/right margin imbalance and blank stretches; distinguish accidental voids from
  authored asymmetry or a useful scene stage.
- Sections without a heading.
- Images without `alt`.
- Controls without a `:focus-visible` style.
- Whether content is hidden when `prefers-reduced-motion: reduce` is set.
- Tap targets smaller than 44 x 44 px on the phone viewport.
- Horizontal scroll at 390 px.

Screenshots are written to `.impresario/inspect/`.

## 3. Scene-local browser evidence

The manifest identifies the actual stage selector, useful action, source file/anchor,
assets and composition descriptions. It supplies separate capture instructions for
`desktop`, `phone`, `reduced` and `reduced-phone`.

For scroll capture, measure the actual scene's runtime scroll start/end in pixels in
each viewport after layout and pinning settle. Checkpoints such as 0, .25, .5, .75 and
1 map into **that local range**, never the document's overall height. These capture
samples are not a minimum motion or composition count. Remeasure after layout changes.

For non-scroll or phone alternatives, describe native steps: label, click selector,
normalized pointer position on a selector, or key such as `ArrowRight`. No arbitrary
JavaScript steps. Reduced modes can capture a labelled complete static state.

Capture writes a source/asset/manifest-bound `.impresario/scenes/index.json`, checkpoint
PNGs/filmstrips and, with `--record`, recording JSON/PNGs plus replay HTML. Follow the
actual index paths, not invented artifact names. Browser screencast replay is sampled
evidence, **not fps, GPU, or device-performance proof**.

Use checkpoints and the actual sequence to check that:

- the scene has a complete composition at 0% and at 100% (not just mid-way);
- nothing pops, jumps or overlaps unintentionally;
- any pinned element releases cleanly at the end;
- entry, transformation and resolution are visibly different useful compositions;
- inspection, choice or navigation actually works with real content;
- phone uses a deliberate touch-safe composition rather than a shrunken desktop;
- reduced desktop and reduced phone still show the complete content;
- the assets/material/depth match the promised fidelity, or limitations are explicit.

## 4. The look pass

Builder look passes improve the work but cannot certify it. An **independent human or
agent** must watch the actual desktop and phone recording and cite specific artifacts
in a critique. Someone who sees only a source listing, motion map, static screenshot
or builder summary has not performed that acceptance review.

Read each screenshot in this order:

1. **First screen.** Does it say what this is, in large type, without scrolling? Would
   you know the subject from a thumbnail?
2. **Composition.** Is the layout intentional? Does asymmetry direct the eye? Is
   anything accidentally huddled in one corner? Is there an unexplained void?
3. **Hierarchy.** Can you tell in three seconds what is the title, what is the
   supporting line, and what the next action is?
4. **Type.** Is the display type confident? Is the body comfortable to read? Is
   anything too tight or too loose? Does the measure feel right?
5. **Colour.** Does the palette read as one decision? Is the accent used sparingly?
   Does any section feel like it belongs to a different site?
6. **Texture and image.** Do the photographs look like this subject? Is the crop rule
   consistent? Are placeholders obvious?
7. **Rhythm.** Do the sections alternate in density? Is there a quiet beat after the
   busy one? Does the page have a beginning, a middle and an end?
8. **The bold thing.** Is it obvious what the page's one memorable element is? Is
   everything else quiet enough for it to land?
9. **Motion (from the actual recording).** What changes compositionally from entry
   through transformation to resolution? Can the visitor inspect, choose or navigate?
   Does a claimed camera journey, refraction or physical turn actually occur?
10. **The generic test.** Apply `tells.md` §7 to the pictures, then its sequence test
    to the actual desktop and phone recording.

Write down the **top three problems** after the first pass. Fix those three. Recapture
and review. After **three unsuccessful visual iterations**, ship the best version and
name the remaining artifact-specific failures plus your next proposed move in the handoff. Do not accept the remaining defects as taste. Without an independent
reviewer, run the harsh self-review rubric in SKILL.md and say so.

An optional `.impresario/creative-review.json` records an independent reviewer, verdict,
capture hash, artifact-specific evidence and limitations. The checker validates shape
and hash binding only; it cannot verify independence, truth or visual merit. See
[evidence.md](evidence.md). New captures require renewed review of the current artifacts.

## 5. The report format

```
CONCEPT
  Idea sentence: On this page, ___ becomes ___.
  Live thing:    ___ (archetype: picker / reader / viewer / generator / instrument)
  Argument:      The page argues ___.

DIRECTION
  Mood:     ___
  Palette:  subject-derived roles/proportions ___
  Type:     ___ for display, ___ for text, tabular numerals for data
  Surface:  ___
  Motion:   ___ register
  Bold:     ___

BEATS
  1. ___ — family: ___  (scroll scene: yes/no, carrying ___)
  2. ...
  ...

SIGNATURE MOVE
  ___

FUNCTIONAL PROTOTYPE
  Mode: ___ ; flagship action and useful result: ___
  Entry / transformation / resolution compositions: ___
  Asset fidelity/provenance and missing-asset decisions: ___
  Independent prototype review artifacts / verdict: ___
  Surrounding page expanded after acceptance: ___

GATE RESULTS
  lint.mjs     FAIL 0 · WARN __
  inspect.mjs  1440 FAIL __ · 768 FAIL __ · 390 FAIL __   (remaining WARNs: __)
  scenes.mjs   manifest / index / desktop / phone / reduced / reduced-phone: ___
  Recording/replay and checkpoint/filmstrip paths: ___
  creative-check.mjs completeness / freshness: ___
  Creative acceptance NOT EVALUATED by checker
  Look pass round 1: top three problems __
  Round 2: ___  Round 3: ___
  Independent reviewer kind/name: ___
  Actual desktop and phone recordings watched: ___
  Artifact-specific critique / current capture hash: ___
  Verdict: accepted / rejected / pending ; limitations: ___
  If blocked or rejected after three iterations, next decision: ___

CONTENT AND CREDITS
  Images: ___ (creator, licence, source) — credited at ___
  Placeholders standing in for photography: ___
  Sample content to replace before launch: ___
  Assumptions: ___
```

## 6. Definition of done

- [ ] Concept and prototype direction were written before prototype code; the full
      storyboard followed expressive prototype acceptance, before surrounding-page code.
- [ ] Expressive flagship was a functional prototype before page expansion.
- [ ] Its current recorded entry, transformation and resolution are visibly different
      useful compositions; no count-based or small-tilt substitute.
- [ ] Idea sentence passes the competitor test.
- [ ] Live thing works with a thumb and keyboard; no-JS content and native task path exist.
- [ ] Every section has a heading; the first screen says what this is.
- [ ] Type is legible at desktop and phone; wrapping follows the intended hierarchy.
- [ ] Composition, spacing and asymmetry are intentional; no accidental overflow.
- [ ] Contrast passes; focus rings visible on every control.
- [ ] Reduced motion honoured; required content remains visible in every mode.
- [ ] `lint.mjs` and `inspect.mjs`: 0 FAIL.
- [ ] For expressive work, current scene-local evidence exists for all four viewport
      modes; composed/app work captures applicable declared interactions, with no forced flagship.
- [ ] Evidence checker passes completeness/freshness, without claiming creative acceptance.
- [ ] Every screenshot looked at; top three problems recorded and fixed.
- [ ] For expressive work, an independent reviewer watched actual desktop and phone
      recordings and cited artifacts. Composed/app work is reviewed against its task behavior.
- [ ] Expressive creative verdict is independently accepted and limitations recorded;
      builder self-approval is not certification. Otherwise report pending/rejected/blocked.
- [ ] Imagery credited; placeholders and assumptions listed.

## Motion audit (run before the look pass)

- [ ] Any pinned scene releases correctly and has a skip/escape; pinning is optional.
- [ ] Each action carries useful subject content; chapters of one action stay one action.
- [ ] No wheel capture, no snap-to-section, no scroll hijacking.
- [ ] Transform/opacity used for efficient DOM movement where appropriate; physical
      shadows, optical glass, shaders, meshes and kinetic type are profiled in context.
- [ ] Reduced motion shows the same content, static, no hidden headings.
- [ ] Motion does not block reading or keyboard use.
- [ ] Lenis disabled under reduced motion.
