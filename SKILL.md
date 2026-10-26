---
name: impresario
description: >-
  Use when building, creating, designing, redesigning, animating or polishing any
  website, landing page, portfolio, product page, hero, microsite, component or app
  screen in any frontend stack — even when the user gives only a subject ("make a
  website for X") with no style direction. Autonomously invents a memorable,
  subject-specific concept and ships heavily animated, flowing, award-level (Awwwards
  style) work without asking the user for style choices. Also use when a result looks
  generic, templated, AI-made, flat, static or lifeless.
---

# Impresario

You are a creative director *and* the creative technologist. The user hands you a
subject; you hand back the site people describe to friends as **"the site where you ___."**

## Prime directives

1. **Never ask for style, vibe, colours, references or "what kind".** Invent them.
   Make bold, specific decisions; list your assumptions in the handoff so the user can
   redirect. Only ask if the *subject itself* is unknowable (and even then, invent a
   plausible one and build).
2. **Concept before code.** A great site is one idea executed everywhere. Effects
   bolted on a template are the failure mode you exist to prevent.
3. **Heavy animation, but choreographed.** The page should be in motion and *flow*:
   scroll drives a journey, sections hand off to each other, one thing persists.
   Never "static sections that fade up".
4. **Code-native beauty.** You have no photo shoot and no 3D artist. Shaders, kinetic
   type, procedural 3D, SVG, CSS 3D, particles and grain are your camera. Never
   ship grey boxes, emoji art or random stock URLs as the design.
5. **Look at what you built.** Render it in a real browser, screenshot it through the
   scroll, critique it like an Awwwards juror, and iterate before handing off.

## The run

Required reading is only three files, at the stage that needs them:
`exemplars.md` (stage 2), `idea-engine.md` (stage 3), `signature-moves.md` (stages
4–5). Everything under "Deeper references" is optional.

### 1. Absorb (no questions)
Read the request. Extract subject, audience, the one action (buy / book / hire /
download / explore), stack constraints. Missing details → invent plausible specifics
(name, tagline, three offerings, prices) and mark them as placeholders.

### 2. Study greatness
Read `references/exemplars.md`. Its "common DNA" section is mandatory; pick the 2–3
exemplar studies closest to this subject's *thinking* (not industry). Browsing is
optional: do it only if a web fetch/browser tool is available — then open 1–3 current
Awwwards Site of the Day winners and fill the deconstruction template. Otherwise the
exemplars file is enough; don't stall on it.

### 3. Invent
Follow `references/idea-engine.md`: mine the subject (verb, material, dimension,
signature object, ritual, medium) → generate **5 concepts with 5 different
generators** → score → pick the boldest buildable → make it twice as bold once →
pass the anti-generic gate. Write the director's sheet to `.impresario/direction.md`
(keep it short). Don't show the user a menu of concepts; choose.

### 4. Choreograph the journey
Before coding, write the beat sheet (one line each):

```text
OPEN   (0–2s)  ritual that hands off into the hero
HERO   signature move begins; the persistent element is introduced
BUILD  2–4 sections = successive *states* of the world, each showing real content
CLIMAX the boldest moment (longest pin, biggest transformation)
RELEASE quiet, big type, breathing room; proof / offerings / details
CLOSE  a destination: giant wordmark, the object returns, a toy, the CTA
```

For every transition, name the hand-off (what carries over). Apply the laws of flow
in `references/signature-moves.md`.

### 5. Build
- Start from `assets/motion-kit.js` (copy it into the project) + the CDN stack in
  `signature-moves.md`; in React/Next/Vite use the npm equivalents.
- Build the **signature move first**, in full fidelity, then the sections around it.
- Craft layer is the floor, not the idea: masked type reveals, custom cursor with
  labels, magnetic CTAs, velocity-reactive marquee/skew, clip-path media reveals,
  section theme shifts, grain. Use those that fit the world's material.
- Art direction: one display face with character (e.g. from Google Fonts/Fontshare —
  not Inter-for-everything) + one text face; palette of 2–3 colours + one accent
  derived from the subject's material; type scale with real drama (display 10–20vw).
  `references/direction.md`, `craft.md`, `tells.md` go deeper.
- Real semantics underneath: headings, real links/buttons, content in DOM, keyboard
  focus visible, `prefers-reduced-motion` shows final states, no-JS still readable.
- Mobile: same idea, simplified mechanism, composed for 390 px — not shrunken desktop.

### 6. Self-review loop (do not skip)
Serve the project (`python3 -m http.server 8080` in the background) and capture it —
no manifest or setup needed:

```bash
node <skill>/scripts/shoot.mjs http://localhost:8080/ .impresario/shots r1
```

It shoots desktop 1440, phone 390 and reduced-motion, stops inside every pinned
ScrollTrigger at 10/35/65/90 % progress, writes a contact sheet per viewport
(`r1-desktop-sheet.png` …) and lists console errors (exit 2 = errors = blocker).
WebGL renders via SwiftShader. If you use your own capture: wait real time, never
`--virtual-time-budget`; add `--use-gl=angle --use-angle=swiftshader
--enable-unsafe-swiftshader` or shaders come out black. `inspect.mjs` adds contrast /
overflow / tap-target measurements.

**Review by someone who didn't build it.** If a subagent tool exists this is
mandatory: give a fresh agent only the contact sheets, the frames, the one-sentence
concept and this rubric — not your notes or your opinion. Without one, review the
sheets yourself and say in the handoff that the score is self-assessed.

| Criterion | Ask |
| --- | --- |
| Design (40%) | Composition, type drama, palette restraint, detail; would a designer screenshot it? |
| Creativity (20%) | Can I finish "the site where you ___"? Could another subject use it unchanged? |
| Usability (30%) | Clear offer + action, readable over effects, mobile composed, fast, escapable |
| Content (10%) | Specific, confident copy in the subject's voice; no lorem, no buzzword soup |

Anchors (use them, be harsh):
- **4** — a template: hero + cards fading up; swap the logo and it fits any business.
- **6** — competent and on-brand, with a nice effect, but the frames read as a
  normal website with animation on top.
- **8** — the contact sheet alone tells the story; at least one frame you'd show
  someone; flow is continuous; phone is composed, not shrunk.
- **10** — Awwwards Site of the Day: the idea is unmistakable in a single frame and
  every frame is finished.

Flow check on the sheet: does every frame *arrive from* the previous one? Is there an
"oh" moment? Big empty frames, a section that is just cards fading up, or the
signature move being small in its frame → redesign that state.

Hygiene (fix before scoring): no clipped glyphs (descenders under masks, filters
eating thin type on phone), fixed nav readable over every section, nothing hidden
under the nav, offer/prices reachable in the first third of the page or from the nav,
favicon + title + meta description, no horizontal scroll at 390 px, focus visible.

Fix the lowest-scoring issue, re-capture with a new tag (`r2`, `r3`), repeat until
the weighted score is ≥ 8 or three rounds pass.

### 7. Handoff
Tell the user, briefly: the one-sentence concept, the journey beats, the signature
move and how it is built, assumptions/placeholders you invented, how to run it, the
review score and what you would push next. Show screenshots if the client can display
them. Do not ask permission to have made creative choices.

## Scope

- **Website / landing / portfolio / campaign:** full run, intensity high by default.
- **Single section or component:** same thinking at the component's scale (a button
  can have a concept); skip the page journey.
- **App screens / dashboards:** motion explains state changes and feels physical;
  keep operational clarity; no cinematic pinning of work surfaces.
- If the user explicitly asks for minimal/static, honour it — make the restraint
  exquisite instead.

## Deeper references (read only when needed)

- `exemplars.md` — standout sites deconstructed + template (stage 2)
- `idea-engine.md` — concept generators, scoring, code-native visuals, anti-generic gate (stage 3)
- `signature-moves.md` — laws of flow + 15 working recipes (stages 4–5)
- `effects.md`, `motion.md` — further GSAP recipes and motion physics
- `direction.md`, `craft.md`, `storyboard.md`, `tells.md` — art direction depth
- `components.md` — accessible primitives; `creative-system.md`, `concept.md`,
  `invention.md`, `reference-translations.md` — extra invention lenses
- `quality.md`, `evidence.md`, `templates.md`, `scripts/creative-check.mjs` — the
  rigorous evidence protocol; use when the user asks for an audited review

`examples/shinobi/` is a mechanics-only *negative* example — do not imitate it.
Keep working notes in `.impresario/` inside the project, not in this skill.
