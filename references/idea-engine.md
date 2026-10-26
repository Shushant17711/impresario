# Idea engine: inventing the concept without asking anyone

You are the creative director. The user gave you a subject; inventing the rest is your
job. Do not ask "what style do you want?" Decide, build, and state your assumptions at
the end. A bold decision the user can redirect is worth more than a question.

## Step 1 — Mine the subject (2 minutes, in your head or in `.impresario/direction.md`)

Fill all of these from the subject. If information is missing, **invent plausible
specifics** (a name, a tagline, 3 offerings) and mark them as placeholders in the handoff.

- **Verb:** what does it *do*? (brew, launch, heal, compile, grow, protect)
- **Material:** what is it *made of*, literally or emotionally? (steam, steel, paper, light)
- **Dimension:** what can be measured along a line? (depth, altitude, time, temperature,
  speed, size, zoom level, layers)
- **Signature object:** one thing that can be the page's hero prop (cup, rocket, seed,
  lens, key, cassette).
- **Ritual:** the sequence the user performs (order → wait → receive; plant → water → bloom).
- **Medium it lives in:** where it would show up in the real world (menu, receipt,
  terminal, map, record sleeve, lab report, ticket, poster).

## Step 2 — Generate 5 concepts with these generators

Use a *different* generator for each concept. Each concept = one sentence:
**"The site where you ___."**

| Generator | Recipe | Example (coffee roastery) |
| --- | --- | --- |
| **Scroll is a dimension** | Map scroll to the subject's dimension | Scroll descends from the farm at 1,800 m to your cup; altitude counter, fog, then steam |
| **The page is the object** | The whole viewport *is* the signature object | The page is a cup seen from above; scrolling stirs the crema into each section |
| **Process / transformation** | Visitor drives the subject's real process | Scroll roasts the bean: green → yellow → first crack (screen shake) → dark |
| **Medium parody** | The site imitates the medium it lives in | The site is a café receipt printing as you scroll; items are the menu |
| **Toy / game** | Navigation is play | Drag a pour-over kettle; the water you pour fills sections |
| **Material world** | The subject's material leads the transitions (other things from its world can join) | Everything is liquid: sections pour into each other, type ripples |
| **Scale shift** | Zoom from macro to micro (or reverse) | Zoom from a world map into a farm into a bean into the cell of its flavour |
| **Persistent character** | One mascot/object stays and reacts | A single bean character watches the cursor and travels with you |

## Step 3 — Pick, don't average

Score each concept 1–5 on:

1. **Memorability** — would someone retell it tomorrow?
2. **Subject truth** — could a competitor in a different industry use it unchanged? (If yes, score 1.)
3. **Buildability code-only** — can it look *premium* with shaders, type, SVG,
   CSS 3D, canvas or procedural Three.js, without photos you do not have?
4. **Usefulness** — does the journey also show the offering, prices, features, CTA?
5. **Motion wow** — does the concept's core *require* the subject's material to
   physically move (pour, crack, swarm, bloom), and can the visitor push it? A concept
   that's mostly illustration plus line drawing scores ≤ 2.

Pick the highest total, tie-break toward **memorability**. Never merge two concepts
into a mush; you may borrow *one* device from the runner-up.

Then upgrade the intensity once. Pick **one** of these and apply it, concretely:
- the signature move takes over the *whole viewport* instead of a box in a layout;
- the persistent element survives into one *more* section (ideally the footer);
- the visitor's input (scroll speed, pointer, click) visibly changes the material;
- the climax pin gets longer and holds a second transformation, not a second section;
- the display type becomes part of the world (filled with, cut by, or made of it).
Write which one you chose in the director's sheet.

## Step 4 — Write the director's sheet (short)

```text
THE SITE WHERE YOU: ...
WORLD / MATERIAL: ...                      (the material that leads; others from the world may join)
MOTION: living material · 5-second wow · subject motion list · input → material
HERO SIGNATURE MOVE: ...                   (mechanism + what changes)
CONTINUITY DEVICE: ...                     (what persists/travels between sections)
SECTION JOURNEY: 1 ... → 2 ... → 3 ... → close ...   (each is a *state* of the world)
OPENING RITUAL: ...   CLOSING MOMENT: ...
TYPE: display face + text face, how type moves
PALETTE: structure (colour.md §2) + 8 sampled subject colours → roles, 2+ states along the journey
TYPE REASON: where in the subject's world this lettering comes from
PERSONALITY LAYER: cursor, hover, sound? micro-reactions
VISUAL SOURCE: shader / procedural 3D / SVG illustration / kinetic type / CSS 3D
ASSUMPTIONS I MADE: ...
```

## Code-native visuals: how to look premium with no assets

Never ship grey boxes, emoji, or random Unsplash URLs as "the design". Choose:

- **Kinetic typography as hero** — 12–25vw display type, split into chars/lines,
  masked, scaled, outlined, filled with video/gradient via `background-clip:text`.
- **Fragment shaders** — gradients, noise fields, liquid, smoke, grain, light
  beams; colours from the subject. One full-screen quad, no dependencies.
- **Procedural 3D** — Three.js primitives (torus knots, extruded SVG shapes,
  instanced spheres, lathe geometry for cups/vases/bottles) with physical materials,
  environment lighting and soft shadows.
- **SVG illustration** — authored shapes with path morphing and line drawing; flat
  graphic style can be award-level (think motion-graphics posters).
- **CSS 3D** — real `perspective`, `preserve-3d` cards, cubes, book pages, folds.
- **Generative patterns** — particles, flow fields, grids that react to cursor/scroll.
- **Grain + light** — a subtle noise overlay and radial light make flat colour feel
  photographic.

If a real photo would be essential (e.g., a specific restaurant's dishes), design
image slots with art-directed frames and motion so dropping in real photos later
looks great, and use a styled generative stand-in now.

## Anti-generic gate (reject and rethink if any is true)

- Hero = centred headline + subtitle + two buttons over a gradient blob.
- Sections = icon cards in a 3-column grid, each fading up on scroll.
- The animation would work identically on any other subject.
- You cannot finish "the site where you ___" with a verb that is not "read" or "scroll".
- Purple-to-blue gradient, glassmorphism cards, and Inter everywhere with no reason.
- Paper/cream ground + black ink + one orange/red/amber accent, or near-black + one
  hot accent; >85% of the page grey/cream/black (see `colour.md`).
- The site could be swapped with the last impresario build: same preloader counter,
  labelled cursor, grain, serif-display + mono-labels, dark climax flip, giant wordmark.
