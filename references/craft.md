# Craft

Craft defaults for intentional, readable work. Read before markup and again before the
look pass. Styling advice is contextual, not a ban list: subject-derived physical
shadows, glass, shaders, meshes, kinetic typography, gradients, grids and asymmetry
are permitted. Accessibility, honest evidence and working controls remain requirements.

---

## 1. Type

- **Aim for two lines or fewer** for ordinary marketing headlines at desktop and
  phone widths. Cut words before shrinking them. Poster type, expressive wraps and
  kinetic typography may differ when the composition remains legible; retain semantic
  text and a complete reduced-motion/no-JS reading state.
- **Headline sizes**: 56-96 px desktop, 36-52 px phone for a marketing hero; 32-48 px
  for section headings. A page where every heading is 64 px has no hierarchy.
- **Measure**: 55-75 characters. `max-width: 65ch` on body copy.
- **Leading**: body 1.5, display 1.05-1.15, large statements 1.2.
- **Case**: sentence case by default; uppercase display type can belong to a poster or
  subject-specific title, not long reading copy.
- **Weight**: a restrained set, often two weights plus italic on the text face. Use weight to create
  hierarchy before you use size.
- **Numerals**: `font-variant-numeric: tabular-nums` in tables, prices and counters.
- **Avoid**: justified text, more than one exclamation mark, all-caps paragraphs,
  orphaned single-word headings, `letter-spacing` on body copy.

## 2. Colour

- Body text 4.5:1 minimum; large text (24 px+, or 19 px bold) 3:1; UI borders and icons
  3:1.
- One accent, used sparingly. If the accent appears on every section it is not an
  accent, it is a second ground.
- Build a **tone ladder** per surface: base, raised, sunken. Use space or tone steps
  instead of reflexive dividers; rules can be useful in tables, receipts or real grids.
- Colour is not the only signal. Pair it with size, weight, position or shape.
- Dark mode: derive from the same hue family, not by inverting. Test both if you ship
  both. If you ship only one, ship the one the concept implies.

## 3. Layout

- **Intentional balance.** Equal margins are a useful default, not a rule against
  asymmetry. Empty space must frame the subject/action rather than look unfinished.
- **A coherent grid.** Define gutter and margin tokens; deliberate breaks, visible
  workbench grids or asymmetric stages may express the subject.
- **Vertical rhythm**: a spacing scale (4/8/12/16/24/32/48/64/96/160). Section padding
  from that scale, not from arbitrary pixel values.
- **No accidental dead stretches.** Quiet space can pace an argument or camera journey;
  do not manufacture scroll distance with blank sections.
- **Align**: every section shares the same left edge (or the same centre), except
  deliberately offset compositions.
- **Responsive is a rule, not a collapse.** For each beat, write what changes at
  768 and 390: what reorders, what becomes a scroll strip, what becomes a full-bleed
  image, what gets dropped (and why it is safe to drop).
- **Avoid the "everything centres" reflex.** Alignment should follow content and stage,
  not a repeated hero template. Centre when it genuinely frames the subject.

## 4. Copy

Write the complete copy deck before surrounding-page markup. The earlier flagship
prototype uses representative real content and controls; prove it before spending
time on full-site copy/layout. Do not delay the prototype for a complete page deck.

- **Say the thing.** "We restore vintage synthesizers" beats "Preserving the sonic
  legacy of analog instruments".
- **Concrete nouns and real numbers.** "Since 1974" beats "decades of experience".
- **Short sentences, varied length.** One long sentence then one very short one.
- **No stock phrases**: "Welcome to", "In today's fast-paced world", "Unlock your
  potential", "Seamlessly integrate", "Take it to the next level", "Built with love",
  "Your vision, our passion", "Empowering teams", "Solutions that scale", "Game-
  changing", "Delve into", "Elevate", "Supercharge", "Revolutionise" (and the American
  spelling), "Level up", "Let's create something amazing", "Start your journey",
  "Everything you need, in one place".
- **No em-dash overuse**; one is fine, four in a paragraph is a tic.
- **Headings are arguments**, not labels.
- **Buttons say what happens**: "Book a 20-minute call", not "Submit" or "Learn more".
- **Real proof or none.** Do not invent testimonials, customer counts, awards or
  statistics. If the brief has none, the page has none — say something else instead
  (the process, the guarantee, the team, the work).

## 5. Imagery

- **Real pictures of this subject's world.** A shop's bench, the actual dish, the real
  workshop, the person's actual studio. Generic stock (handshakes, skyline, smiling
  team) is worse than no photograph.
- **Commit to a crop grammar.** Framing should explain the subject: overview,
  inspection close-up and mechanism detail can differ intentionally. Random crops do not.
- **Alt text describes, it does not repeat**: "the shopfront on Fournier Street at
  dusk", not "shopfront image".
- **Decorative images** take `alt=""`.
- **Credit every picture**: title, creator, licence, source URL. Put the credit on the
  page (a caption, or a credits section at the end) unless the licence forbids it.
- **Missing assets are not blockers.** Choose the strongest code-native representation (shader, procedural 3D, SVG illustration, kinetic type, CSS 3D) yourself, build it at full craft, and list the asset gap in the handoff — never stop to ask. A report label does not authorize a silent downgrade.
- **Drawing is allowed and often better.** A precise SVG illustration of the subject's
  object beats a stock photo of something else.
- **A clear visual focus.** A collage, comic close-up sequence or exploded parts view
  can be appropriate if it directs attention and uses real/authored subject assets.

CSS/SVG constructions are allowed at honest stylized fidelity. Do not call a flat
device card photorealistic, a blur refractive glass, or a pointer-tilted plane an
immersive environment without actual browser evidence. Physical shadow, reflected
light and glass behavior can establish a material stage; ordinary panel blur cannot
stand in for a requested optical simulation.

## 6. Micro-details that separate good from generic

- A plain nav bar is a good default. A spatial category rail or physically grounded
  glass control may fit the scene; keep native links, focus, escape and a DOM fallback.
- The footer carries the information people actually need: contact, a real address,
  legal links, credits. Not four columns of empty links.
- Buttons: one primary per screen. Primary = filled ground colour; secondary = text.
  No two primaries side by side.
- Form labels always visible. Placeholder-only inputs are not labels.
- Loading states reflect the real operation. Use a skeleton, concise progress or a
  labelled spinner where appropriate; no theatrical fake preloader.
- Empty states say what will appear and how to make it appear.
- Favicon and page title are set; the title is not "Home".
- `theme-color` set to the page's ground colour.
- Numbers in the copy use real formatting.
- Links are underlined (or clearly styled), not distinguished by colour alone.
- Tables have real `<th>`, `scope`, and alignment set per column.

## 7. The contextual anti-generic checklist

Before the look pass, verify:

- [ ] Eyebrows and numbering communicate real metadata or sequence, not fake structure.
- [ ] Dividers, grids and outlined regions support actual structure or subject material.
- [ ] Gradients, shadows and glass have a subject-derived visual/material purpose.
- [ ] Palette is derived from this subject, not a habitual violet or terracotta default.
- [ ] Repeated cards/rows serve comparison or task consistency rather than fill space.
- [ ] Navigation shape follows the task/stage; native interaction remains usable.
- [ ] Particles, meshes and kinetic type contribute meaning, not demo decoration.
- [ ] No fake data presented as fact or falsely claimed asset/material fidelity.
- [ ] No invented social proof.
- [ ] Headlines and body are legible at all supported widths and in static fallbacks.
- [ ] Alignment and asymmetry are deliberate, not the reflex of centring every section.
- [ ] Every section has a heading.
- [ ] Every control has hover, focus-visible, active.
- [ ] The page has real content in every section.
- [ ] Expressive flagship was functional and independently reviewed from actual desktop
      and phone recordings before the surrounding page was expanded.
