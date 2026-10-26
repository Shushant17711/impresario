# Exemplars: what standout sites actually do

Study the move, not the artwork. Each entry is: **what you experience → the signature
move → why it is memorable → how to rebuild the idea code-only for a different subject.**
Descriptions are from public, well-known versions of these sites and may have changed;
if you can browse, open 2–3 of them (or current Awwwards Site of the Day/Year winners)
and deconstruct them with the template at the bottom before inventing. Never copy
their art, copy their *thinking*.

## The common DNA of award-level sites

Every site below does most of these. Generic AI sites do almost none.

1. **One sentence of memory.** People describe it as "the site where you ___"
   (drive a car through the portfolio, dive to the ocean floor, scroll an AirPod apart).
   Design that sentence first.
2. **The page is a place or an object, not a document.** Scroll moves a camera, turns
   a thing, descends, assembles, travels. Sections are positions along one journey.
3. **Continuity.** Elements travel *between* sections; the hero object becomes the
   next section's subject; colour and light change gradually. Nothing pops in from nowhere.
4. **Typography is a performer.** Huge display type, masked line reveals, letters that
   split, scale, scramble or wrap a 3D form. Type often *is* the hero when no assets exist.
5. **An opening ritual.** Preloader/intro that hands off into the hero (counter → curtain
   → title rises), so the first second already feels authored.
6. **A personality layer.** Custom cursor, magnetic buttons, hover distortion, sound
   toggle, micro-reactions to velocity. Choose the one or two that come from the subject
   (a probe, a brush, a torch). A labelled blend-mode dot cursor isn't personality.
7. **Colour is the subject's, and it's committed.** Igloo is *all* ice blue, neal.fun's
   Deep Sea is *all* depth, Wrapped is *all* saturated blocks. Standout sites commit to the
   subject's colour world. They don't sit on a neutral page with one accent. Motion still
   has real choreography (staggers, overlaps, expo easings). See `colour.md`.
8. **A closing moment.** The footer is a destination (a return to the opening object, the
   finished state of the world, an interactive toy; a giant wordmark is the overused default), not a link dump.

## Exemplar studies

### Apple product pages (AirPods / iPhone / Vision Pro)
- **Experience:** scroll and the product rotates, disassembles, and reassembles; huge
  headlines scale in; sections pin while text swaps beside the object.
- **Move:** canvas image-sequence *scrubbed* by scroll inside a pinned section;
  copy synchronised to frame ranges.
- **Why:** you feel you are physically handling the product; scroll = hands.
- **Code-only translation:** replace the frame sequence with a procedural Three.js
  object or layered SVG that explodes into labelled parts while pinned (see
  `signature-moves.md` §4, §8). For a bakery: a cake splits into layers, each layer
  names an ingredient.

### Stripe (homepage hero era of the animated gradient)
- **Experience:** a slowly flowing, liquid, saturated gradient behind crisp type.
- **Move:** a WebGL mesh-gradient shader (noise-displaced colour fields), very cheap,
  infinitely calm.
- **Why:** premium "alive" surface without any asset.
- **Translation:** a fragment shader whose colours come from the subject (coffee:
  crema browns swirling; ocean NGO: deep teal currents) and whose speed reacts to
  scroll velocity (§5).

### Bruno Simon's portfolio
- **Experience:** you drive a little toy car around a 3D world; projects are places
  you drive to.
- **Move:** the *navigation itself is a game*; physics + low-poly world.
- **Why:** nobody forgets it; the medium proves the skill.
- **Translation:** make the site's navigation an act that belongs to the subject:
  a florist's site where you plant seeds that grow into the menu; a DJ's site where
  a turntable scrubs sections. Always keep a plain DOM nav as escape.

### Dogstudio (dogstudio.co, the 3D dog era)
- **Experience:** a 3D dog's head watches your cursor; background colour changes per
  section while the dog stays.
- **Move:** one *persistent character* across the whole page + section-wise palette shifts.
- **Why:** a mascot with gaze creates instant connection; continuity across sections.
- **Translation:** a persistent hero object that every section re-lights or re-poses
  (a pen nib for a writing app, a planet for an edtech site). Code-only: procedural
  geometry or an SVG character whose eyes/orientation track the pointer.

### Igloo Inc (Awwwards Site of the Year 2024)
- **Experience:** dark, icy, glassy 3D blocks; scroll travels between frozen
  "exhibits"; text materialises from particles/glitch; sound design.
- **Move:** strong *world material* (ice) applied to everything — type, transitions,
  UI — plus a scroll camera through discrete scenes.
- **Why:** total material consistency makes it feel like a single crafted object.
- **Translation:** pick ONE material for the subject (rust, honey, smoke, chrome, solder, glacier,
  clay, neon, water) and let every transition be that material behaving
  (rust spreads, honey pours, smoke disperses).

### Lusion / Active Theory (studio sites)
- **Experience:** real-time 3D with physics, fluid sims, heavy post-processing; the
  cursor disturbs the scene.
- **Move:** the visitor's pointer is a *force* in a simulated world.
- **Why:** interaction feels tactile, not clicky.
- **Translation:** a canvas particle/fluid field the cursor pushes, whose particles
  later *form* the headline or the product silhouette (§9).

### neal.fun — "The Deep Sea", "The Size of Space"
- **Experience:** you scroll down and you are literally descending into the ocean;
  depth counter, light fades to black, creatures appear at their real depths.
- **Move:** **scroll = a real physical dimension** (depth, time, size, distance).
- **Why:** the metaphor is so direct a child gets it; content *is* the journey.
- **Translation:** a history site where scroll is years; a coffee site where scroll is
  the bean's journey from farm altitude to cup; a fitness app where scroll is heart rate.

### The Pudding / NYT "Snow Fall" (scrollytelling)
- **Experience:** sticky graphic, text steps scroll past and the graphic changes state.
- **Move:** *sticky stage + stepping narrative*.
- **Why:** turns information into a story the reader controls.
- **Translation:** any product with a "how it works" — the stage is the product,
  steps re-pose it.

### Poolsuite (poolsuite.net)
- **Experience:** the website is a retro Mac-style desktop with windows, a music
  player, and summer vibes.
- **Move:** **the site parodies an interface/medium** (OS, terminal, magazine, TV
  channel, receipt, airport board, game menu).
- **Why:** the format itself carries the brand's attitude.
- **Translation:** a law firm site as a case file; a band as a cassette deck; a
  dev tool as a terminal that boots; a restaurant as a printed menu that unfolds.

### Obys / Locomotive / Cuberto (agency craft)
- **Experience:** buttery smooth scroll, giant editorial type with line-by-line masked
  reveals, images that distort/ripple on hover, magnetic buttons, a cursor that grows
  into labels ("View", "Drag").
- **Move:** *micro-choreography everywhere* — the craft layer.
- **Why:** each interaction is rewarded; the site feels expensive.
- **Translation:** apply §1–§3, §6, §7 of `signature-moves.md` as the baseline polish
  on top of the big idea. This is the floor, not the idea.

### Linear (product marketing)
- **Experience:** dark, precise, glowing edges, product UI shown in perspective that
  flattens as you scroll, subtle grid/light beams.
- **Move:** *the real product UI is the hero*, staged with light.
- **Why:** credibility + beauty for software.
- **Translation:** for SaaS/dev tools, build a live, animated fake of the product UI
  in HTML (typing, cards moving, graphs drawing) instead of a screenshot.

### Spotify Wrapped (campaign web stories)
- **Experience:** punchy full-screen colour blocks, oversized numbers, shapes that
  morph between cards, fast rhythm.
- **Move:** *rhythm and bold flat colour* — motion graphics, not 3D.
- **Why:** proves heavy animation does not need WebGL.
- **Translation:** stats/personal-data pages: numbers count up, shapes morph (SVG
  path or clip-path), each step a colour shift.

## Deconstruction template (use when browsing a new reference)

```text
SITE:
ONE-SENTENCE MEMORY ("the site where you..."):
WORLD / MATERIAL:
HERO MOVE (mechanism: pin+scrub / shader / 3D / sequence / DOM):
CONTINUITY DEVICE (what persists between sections):
TYPE BEHAVIOUR:
OPENING RITUAL / CLOSING MOMENT:
PERSONALITY LAYER (cursor, hover, sound):
PALETTE & PACE:
WHAT I WILL TRANSLATE (the thinking, for my subject):
```
