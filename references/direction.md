# Direction

The direction sheet is the page's constitution. It is written before the code and it is
kept, because every later decision — should this be a card, should this be 20% or 60%
of the screen, should this fade or slide — is answered by it.

A direction sheet is not a mood board. "Dark, modern, techy" is not a direction; it is a
genre label, and every page in that genre will look like yours. A direction names
specific choices and their proportions.

Declare mode `expressive`, `composed` or `app`. An expressive brief starts with the
functional flagship prototype and its independent browser review, not a finished page
around an unproven scene. Serious app screens stay task-first. See
[creative-system.md](creative-system.md) and [evidence.md](evidence.md).

---

## 1. Mood

Three adjectives, and one sentence naming the reference world.

- Adjectives must be in tension. "Rustic and precise" is more useful than "warm" or
  "elegant". "Clinical and celebratory" makes decisions for you.
- The reference world is a *place or artefact*, not a feeling: "a lab notebook that got
  rained on", "a Japanese train-station timetable from 1978", "a Saturday morning at a
  swimming pool", "the back page of a seed catalogue".

If you cannot name the reference world, the direction is not specific enough yet.

## 2. Palette

A palette is **roles and proportions**, not a list of swatches. This is a starting
shape, not a universal number of colors or coverage rule:

| Role | Hex | Share | Notes |
| --- | --- | --- | --- |
| Ground | `<subject-derived ground>` | 55% | The default surface of the page |
| Ink | `<subject-derived ink>` | 25% | Text and primary marks |
| Accent | `<one subject-derived accent>` | 10% | One accent, used sparingly |
| Field | `<contrasting field>` | 8% | A second surface, for a section or a block |
| Support | `<quiet support tone>` | 2% | Small marks and hover states |

Rules:

- **Roles have jobs.** A quiet base and focused accent often help; data categories or
  illustrated worlds may need different roles. Explain the hierarchy.
- **Proportions matter.** The example shares suggest a dominant ground, not mandated
  percentages. Material highlights, gradients and artwork alter the visible balance.
- **Contrast is a requirement, not a preference.** Body text on its ground must clear
  4.5:1; large text 3:1. Check with `inspect.mjs` — it measures.
- **Derive it.** The accent should come from the subject: the red of the shopfront, the
  oxidised copper, the tomato sauce, the sodium lamp. If you picked a colour before
  knowing the subject, go back.
-   **Follow `colour.md` first.** It has the procedure and the measured failures.
-   **Avoid assistant palettes.** Violet/indigo dominance, cream-ground-with-terracotta,
  orange-on-graphite, and dark-ground-with-neon-card are common generated defaults. Both
  the colour family and the proportion must come from the subject, not this document.

### Fields, gradients and light

Use **flat fields** of colour to separate sections and to place emphasis. A field is a
block of ground colour, full-bleed or inset, that carries a section. Gradients can
describe optical falloff, iridescence, heat, atmosphere or the subject's artwork; a
scrim can preserve contrast. A generic purple-to-blue wash chosen before the subject
is a tell, not a reason to forbid every gradient. Judge the rendered purpose.

## 3. Type

One or two families. Each has a role, and a role means a set of permissions.

| Role | Choice | May do | May not do |
| --- | --- | --- | --- |
| Display | A serif, a grotesk with character, or a condensed face | Large sizes, tight leading, occasional italic | Set body copy |
| Text | A readable serif or grotesk | Body copy, quotes, labels | Be the display face at hero size |
| Data | The text face with `font-variant-numeric: tabular-nums` | Numbers, prices, tables, timestamps | Carry a headline |

Rules:

- **Scale**: choose a ratio (1.2 minor third for dense app screens, 1.333 for
  marketing, 1.5+ for poster-like pages) and write the steps down.
- **Measure**: 55-75 characters for body copy. A full-width paragraph at 1440 px is a
  common and cheap-looking mistake.
- **Leading**: 1.4-1.5 for body, 1.0-1.15 for display.
- **Case**: sentence case by default. A subject-derived poster or kinetic title can
  use display capitals; keep reading copy readable and labels legible.
- **Weight**: two weights are usually enough (regular + bold). A page that uses five
  weights looks undecided.
- **One family is a legitimate choice.** A page with one well-chosen family and a real
  scale looks better than one with three.
- **Load only what you use.** Two families maximum, subset to the weights and styles
  actually used, `display=swap`, `preconnect` to the font origin.

## 4. Surface and texture

Use a coherent material vocabulary from the subject's world. Possible choices:

- **Flat field** — no texture. Rely on type and space. Often the strongest choice.
- **Paper** — a grain or fibre overlay, very low opacity, fixed over the whole page.
- **Print** — halftone dots, misregistration, ink spread.
- **Machine** — scanlines, phosphor glow (use sparingly and never on text you must read).
- **Woven / grid** — a woven or perforated texture at 3-6% opacity.
- **Photographic** — the page is one big photograph with type over it. Then the type
  must survive it: use a scrim, and place text on the quiet part of the image.
- **Physical stage** — shadows and reflected light describe depth or object contact.
- **Optical / mesh** — glass, shader gradients, deforming surfaces or ribbons express
  a particular material or parameter; keep text and controls in semantic HTML.

Keep texture quiet behind reading copy and check contrast in every material state.
Different materials may belong to different parts of one world; avoid arbitrary
per-section treatments. An opacity number is not a substitute for looking at the text.

Record asset format, fidelity and provenance before promising the scene. CSS/SVG is
valid for stylized work, but a blur is not demonstrated pixel refraction and a flat
plane is not proven spatial immersion. If the required art, model, environment or
renderer is missing, choose the strongest code-native representation (shader, procedural 3D, SVG illustration, kinetic type, CSS 3D) yourself, build it at full craft, and list the asset gap in the handoff — never stop to ask. Never silently downgrade the brief.

## 5. Motion register

The physics of the world. This one word governs every curve and duration later.

| Register | Curves | Durations | Feels like |
| --- | --- | --- | --- |
| **Mechanical** | `cubic-bezier(.2,.8,.2,1)` or a slight anticipation | 180-320 ms | A machine with detents: fast, exact, slightly sprung |
| **Editorial** | `cubic-bezier(.16,1,.3,1)` | 400-800 ms | Print: things settle, they do not bounce |
| **Organic** | spring, low damping | 500-1200 ms | Cloth, water, breath |
| **Brutal** | `steps()`, `linear`, near-zero easing | 60-140 ms | A cut, a print head, a switch |
| **Cinematic** | subject-specific camera/object timing | determined by the action | A useful spatial or physical transformation |

Pick a governing register and write it in the sheet. Timing examples are starting
points, not quotas. A different register can be justified by another material/action,
but avoid unrelated demo physics.

## 5a. Signature motion (the thing that could not be on another site)

Name one motion that is impossible to mistake for another subject's. It must be a
verb phrase tied to the subject's physical behaviour, not a generic effect name.

- Bad: "fade-in hero", "parallax image", "scroll reveal", "aperture open".
- Good: "the coffee that spilled at the top of the page drains back into the cup as
  you read"; "the hanger turns and the garment faces you when your cursor reaches it";
  "the shutter clicks and the frame freezes for a beat when you land".

Write the mechanism and its proof obligation:

- **Motion**: what moves, how far, in what direction, triggered by what.
- **Subject link**: the physical behaviour it imitates, and why it belongs to this subject.
- **Fallback**: what a reduced-motion or no-JS visitor sees instead (content, not nothing).
- **Compositions**: visibly different entry, transformation and resolution, and what
  useful inspection, choice, understanding or navigation they enable.
- **Proof**: actual prototype source anchors, assets, scene-local desktop/phone
  recording and the independent review citing those artifacts.

If you cannot write the subject link in one sentence, the motion is decoration, not a
signature. Go back to the inventory (Object, Ritual) and pick again.

## 6. The one bold thing

Give the work a clear focal idea: the type, picture, material or mechanism. Supporting
parts should strengthen it instead of competing. This is hierarchy advice, not a
required number of loud elements, motions or scenes.

A common failure is spreading boldness across five things, which produces a page that
is loud everywhere and therefore memorable nowhere.

Write it as a sentence: *"The bold thing is the 180 px wordmark that splits as you
scroll."*

## 7. Direction sheet checklist

- [ ] Mood: three adjectives in tension + one reference world.
- [ ] Mode and useful visitor task declared; no forced cinematic demo for app screens.
- [ ] Palette: subject-derived roles with hex and intended proportions.
- [ ] Type: one or two families with roles, scale, measure, leading, case, weights.
- [ ] Surface/material: coherent purpose, legibility and honest fidelity.
- [ ] Motion register: one row of the table above.
- [ ] Signature motion: name + subject link + fallback (not a generic effect).
- [ ] Expressive prototype: real action and visibly different entry/transformation/resolution.
- [ ] Missing assets resolved or explicitly blocked; no silent feasibility downgrade.
- [ ] One bold thing: one sentence.
- [ ] The competitor check: would a similar prompt produce this? If yes, revise.
- [ ] The `tells.md` check: defaults removed or justified in this specific context.

### 8. Palette and composition anti-repeat gate

Compare this direction with the previous page in the project or the last generated
direction if one exists. Investigate repeated defaults without a subject-specific
reason; do not turn this into another numeric creativity score:

- orange/terracotta accent on graphite/grey/cream ground;
- centred oversized sans-serif hero;
- thin bordered rectangular cards;
- archive/storefront/editorial worksheet framing;
- 50/50 split sections;
- card grid as the primary visual object;
- one small picker as the only live interaction.

For expressive work, decide whether palette, type, spatial composition, material,
navigation, hero object and motion actually arise from the new subject. “The subject
is different” and a list of changed tokens are not visual proof. Consult the optional
translation lenses in [reference-translations.md](reference-translations.md), then
prototype and judge the actual browser result rather than manufacturing differences.
