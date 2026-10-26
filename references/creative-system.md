# Creative system

This is the layer that turns a correct brief into a page with a point of view. Read it
after `concept.md` and before `storyboard.md`. It is deliberately framework-agnostic:
the idea belongs to the subject; libraries only provide mechanics.

## 1. Translate the subject into a design engine

Extract these six anchors from the brief:

| Anchor | Question | Output |
| --- | --- | --- |
| Verb | What does the subject do? | forge, orbit, stalk, bloom, archive |
| Material | What is it made of? | steel, ink, smoke, glass, cloth |
| Ritual | What sequence does a visitor perform? | open, inspect, choose, reveal |
| Spatial model | What place does it imply? | dojo, stage, cockpit, archive |
| Signature object | What can become the page's main prop? | sword, lens, map, ticket |
| Evidence | What real content makes it credible? | images, dates, specs, quotes, data |

Write this transformation before implementation:

> The page behaves like **[spatial model]**; its main action is **[ritual]**; **[signature
> object]** changes state as the visitor **[verb]**s through it.

If the transformation cannot be written without generic words such as “modern,”
“dynamic,” or “engaging,” the concept is not ready. Generate three alternatives, then
keep the one with the clearest physical behaviour.

## 2. Choose the appropriate mode and intensity

Choose a level from the brief, not from a personal default. State it in the direction
sheet.

| Level | Appropriate for | Required behaviour |
| --- | --- | --- |
| 1 — composed | docs, utility, restrained editorial | hierarchy and useful state feedback; no forced showpiece |
| 2 — composed, interactive | restrained portfolios, editorial, brands | authored hierarchy and useful task interaction; no compulsory cinematic flagship |
| 3 — cinematic | fiction, music, games, fashion, immersive campaigns | a subject-specific camera, material or spatial journey, proven in the browser |
| 4 — experimental | art pieces, showcases, microsites | unusual input or rendering, but still readable and escapable |

Use manifest mode `expressive` for expressive/cinematic/experimental briefs at levels
3–4, `composed` for restrained pages at levels 1–2, and `app` for serious task-first screens. Intensity describes the
ambition, not a score or a required number of scenes. Do not soften an explicitly
cinematic brief into an ordinary storefront without agreement. Do not turn a billing
screen into a cinematic demo because the user asked for good design.

## 3. Invent scenes, not effects

For the flagship scene first, then any supporting scene, answer:

1. What does the visitor learn or feel here?
2. What subject verb expresses that change?
3. What are the visibly different entry, transformation, and resolution compositions?
4. What is the phone composition?
5. What remains when JavaScript, WebGL, or motion is unavailable?

Example:

> A shinobi page does not “fade in cards.” The visitor draws a blade: the scabbard
> remains pinned while the blade translates along its real axis as the scroll reveals
> the character's discipline. On small screens the blade is an illustrated still with
> a tap-to-reveal state; reduced motion shows the fully drawn blade.

This is a proposed inspection/reveal mechanic, not proof of a cinematic fight. A brief
requiring character ascent, close-ups or a continuous fight still needs appropriate
character/scene artwork and those useful compositions demonstrated in the browser.

Good inventions are physically legible and content-bearing. A sword, garment, map,
camera, machine, waveform, or page can be a prop. A random blob, glow, cursor trail, or
particle field is not a concept unless the subject actually contains it.

## 4. Creative patterns worth adapting

These are design patterns to investigate, not verified claims about any described
reference or templates to stack on a page. Choose what belongs to the subject, then
invent the prop, content and interaction yourself.

### The four creative-web paradigms (optional lenses)

Use whichever lenses help explain this subject before choosing effects. These are
options, not a checklist or a mandate to demonstrate all four:

1. **Scroll as a timeline.** Treat scroll progress as a playhead through a short,
   authored sequence: enter, travel, transform, resolve. Pin only the scene that needs
   a stage. A scene can dolly a camera, rotate a product, morph an object, move through
   a horizontal chapter, or scrub a frame sequence. It must still be readable if the
   visitor scrolls quickly, uses a keyboard, or jumps to an anchor.
2. **Layered depth.** Arrange world, subject and controls in deliberate spatial
   relationships. Foreground overlap, a camera move or occlusion can reveal hierarchy.
   Layered illustration is legitimate, but flat pointer tilt does not prove travel
   through a real environment.
3. **Material and optical behaviour.** Give a material a visual rule: glass bends and
   separates light, fabric folds, ink bleeds, dust trails a moving object, metal catches
   a highlight, a ribbon deforms, or a liquid surface ripples. Use a shader only when
   CSS/SVG/canvas cannot express the promised rule; always provide a static poster and
   semantic HTML fallback. Blur alone is not pixel refraction; a material claim needs
   visible evidence of the behavior being claimed.
4. **Spatial metaphor.** Make the navigation mechanic belong to the domain: a showroom
   for fashion, a camera track for logistics, a living comic for a story, a timeline
   for a career, a cockpit for a control system, or a workbench for a craft. The
   metaphor should determine the visitor's action, not just the colour palette.

Combine selectively when the same useful action warrants it. The result should feel
like one world, not a collection of demos. See [reference-translations.md](reference-translations.md)
for subject-derived translations and the boundary between described and verified references.

### A. The living catalogue

Turn browsing into a visual instrument rather than a grid of product cards. Items can
float in a spatial field, align to a rail, change scale with focus, or reveal a product
in its real context. A selection should cause a meaningful transformation: garment,
colourway, ingredient, route, or configuration changes in the scene. Keep search,
filters, labels, prices, and keyboard selection as real HTML.

### B. The screen inside the world

Make the interface feel like an artefact being used in a place: a laptop, terminal,
shop window, cockpit, studio bench, projection, or handheld device. Use the frame as
part of the composition, then let the content escape or connect to the surrounding
page. This is especially effective for software, music, fashion, tools, and stories.
Do not fake a screenshot when a real interactive surface would be more honest.

### C. Material becomes interface

Give the subject a physical material with visible behaviour: glass refracts, paper
folds, metal catches light, fabric bends, water distorts, ink spreads, a lens focuses.
Use WebGL, canvas, SVG filters, CSS, or a convincing static illustration only when the
material improves understanding. The material must respond to a real input or narrative
beat; “glassmorphism” as a generic panel style is not enough.

### D. The ordinary becomes uncanny

Start with a recognisable place, object, or workflow, then reveal one impossible but
legible change: a corridor becomes a map, a still photograph breathes, a room becomes
an archive, a product exposes its inner mechanism. The contrast makes the experience
memorable. Preserve an obvious path back to ordinary content so the spectacle does not
become confusion.

### E. The controlled reveal

Let the visitor stage the reveal through scroll, drag, pointer, tap, or a deliberate
choice. Build anticipation with a quiet entry state, one readable transformation, and
a release into normal content. Controls should expose the state machine: closed/open,
before/after, hidden/visible, raw/processed, unconfigured/configured.

### F. The responsive showpiece

Treat mobile as a different composition, not a collapsed desktop. Replace a wide
spatial scene with a focused crop, tap-to-step sequence, vertical story, or poster plus
interaction. If the showpiece cannot survive touch, keyboard, reduced motion, and a
slow GPU, it is a demo—not a usable website.

For every chosen pattern, write: **subject reason**, **prop**, **input**, **state
transition**, **content revealed**, **desktop composition**, **phone composition**,
**reduced-motion fallback**, and **performance fallback**.

### Scene architecture recipes

Select a recipe only after the subject and content justify it:

| Recipe | Best for | Build path | Fallback |
| --- | --- | --- | --- |
| staged camera journey | products, places, logistics, architecture | pinned GSAP timeline or CSS scene; background/midground/foreground planes | normal-flow chapters with still images |
| product turntable | vehicles, clothing, objects, food | 3D model, image sequence, or sprite atlas scrubbed by progress | labelled still gallery and native controls |
| spatial catalogue | stores, portfolios, collections | camera pan + focus rail + detail state | vertical list with focus/selection |
| material laboratory | creative tech, beauty, craft, science | shader/WebGL when needed for the material rule; UI outside canvas | honestly labelled static/material illustration |
| living comic / editorial | narrative, culture, campaigns | pinned panels, masks, illustrated cut-ins, sequential reveal | ordered article with static panels |
| environment explorer | place, hospitality, games, immersive brands | Gaussian splat/WebGL/360 media if justified | 2D panorama, image gallery, or map |
| frame-scrub sequence | mechanisms, transformations, manufacturing | optimized WebP/AVIF sequence or video poster + progress | poster plus play button and captions |
| physics entrance | food, playful products, soft brands | spring/drop with Motion or GSAP; keep objects few | ordinary stacked content |

For the chosen recipe, specify: **scene length**, **progress beats**, **camera/object
states**, **content revealed at each beat**, **input model**, **exit/release**, **asset
format**, **mobile substitution**, and **reduced-motion substitution**. If those cannot
be specified, resolve the gap before implementation. A simpler recipe that changes
promised fidelity needs explicit agreement, not a silent substitution.

### Authored-stage planning preflight

Plan expressive work with concrete answers. These examples are not mandatory timing,
phase counts, implementation choices or evidence of acceptance:

| Required field | Weak answer that fails | Acceptable answer |
| --- | --- | --- |
| entry state | “hero appears” | “camera sits behind the closed archive door; title is printed on the glass” |
| progress beats | “elements animate on scroll” | “0–.2 approach, .2–.7 door opens and room tracks forward, .7–1 release into catalogue” |
| transformation | “cards fade in” | “the selected lens rotates from profile to front view and exposes aperture data” |
| content reveal | “more information appears” | “at .55 the three focal lengths become the room's hanging labels” |
| implementation owner | “add a pinned scene” | “GSAP ScrollTrigger pins `.room-scene`; progress drives `cameraX`, `lensRotation`, and `labelOpacity`” |
| release | “next section starts” | “scene unpins at progress 1 and the selected product remains as the first catalogue item” |
| mobile | “stack the columns” | “replace camera track with a tap-stepped portrait gallery and persistent product controls” |
| reduced motion | “disable animation” | “show the fully opened room, all labels, and the selected product in normal flow” |

If the answer contains only `fade`, `slide`, `hover`, `parallax`, `filter`, “pinned,” or
“animated” without a subject, an action and a useful content change, it is not a scene.
This table is a plan, not acceptance. Judge the actual browser sequence, not its names.

### Prototype the functional flagship before the page

Build the expressive brief's hardest scene in isolation before surrounding navigation,
feature grids, testimonials, footer or polish. The prototype must already perform the
visitor's job: inspect a mechanism, choose a compatible configuration, understand a
route, or navigate to real work. A moving ornament with a later promise of useful UI
is not a functional prototype.

Write and implement:

- **Entry:** a complete, legible subject/stage and an obvious available action.
- **Transformation:** a visibly different useful composition, such as an assembled
  workstation opening into labelled compatible parts and workload evidence.
- **Resolution:** the result becomes inspectable, selectable or navigable, with clear
  continuation and escape. It must do more than reset to the same decorative card.
- **Alternatives:** phone interaction, reduced-motion complete state, no-JS content and
  navigation, and a performance fallback that does not misrepresent fidelity.

Record the prototype in the real browser using the scene manifest and the commands in
[evidence.md](evidence.md). An independent human or agent must watch the actual desktop
and phone recording and cite artifacts before the flagship is accepted and page
expansion proceeds. Builder self-review is useful iteration, not certification.

There is **no minimum number of motions, scenes, entities, properties or phase names**.
Entry/transformation/resolution describe compositional meaning, not an inventory quota.
One continuous action across chapters remains one action. A logistics camera journey
through globe, crane, container, truck and ship is a connected journey, not multiple
motions earned by renaming its phases.

A product card that scales 5% and tilts 4 degrees, with fade-in specs and five named
chapters, fails as the sole spectacle. Do not replace that failure with a larger-angle
or percentage threshold. The question is whether the recorded composition and useful
action actually change, not how far a transform travels.

Filtering, drawers, comparisons, hover feedback and smooth scroll can support a scene;
their presence alone does not prove cinematic delivery. An inspection or selection
mechanic can be the flagship when it produces the authored subject-specific journey
and materially helps the visitor. Do not prohibit useful UX in pursuit of spectacle.

### Action inventory, without padding

Keep a concise inventory to explain responsibilities, not to count creativity:

| Field | Required evidence |
| --- | --- |
| name | a memorable subject-action phrase, not “animation 1” |
| trigger | scroll range, drag, pointer, tap, hover, load, or state change |
| subject action | what the real subject/prop does |
| consequence | what content, spatial relationship, or meaning changes |
| choreography | entry, transformation and resolution; relevant timing or input mapping |
| mobile | touch-safe alternate composition |
| reduced motion | complete static/instant equivalent |

Group chapters that continue the same action. Do not count repeated fades, rotations,
progress bars or new labels as independent inventions. In an expressive hero brief,
the flagship must be available on entry; it need not autoplay. Its reduced-motion
poster or instant inspection state must contain the same content.

### Depth and scene checklist

Before implementation, draw the scene in words:

```text
World/background:
Subject/midground:
Foreground control or editorial layer:
What overlaps what:
What changes with progress:
What remains fixed for orientation:
Where the visitor can escape:
```

Never use a floating glass card, particle field, 3D object, or cursor trail as the only
creative idea. Those are treatments; the scene needs a subject, an action, and content.

### Anti-static rejection test

Before implementation, ask: **What would a screenshot of the first frame fail to show
that the visitor discovers by scrolling or interacting?** If the answer is “nothing
except a filter, hover colour, or entrance fade,” reject the direction for expressive
work. The page needs a stateful stage whose meaning changes through the interaction.

## 5. Asset and media ladder

Match the promised fidelity to assets and rendering that can actually support it:

1. supplied/licensed photo, video, SVG, 3D model, or illustration;
2. an authored CSS/SVG construction that represents the subject at an explicitly
   stylized fidelity, not a decorative placeholder pretending to be a real object;
3. a generated image or motion asset, if authorized, clearly marked for replacement
   with a usable prompt saved in `.impresario/assets.md`;
4. a typographic or data-driven composition that still has a subject-specific action.

Never hotlink an unverified image, invent a person's likeness, or present a placeholder
as final art. Record source, creator, licence, and replacement notes in the report.
When visual references are available, inspect them for motion grammar and interaction
principles, not to copy protected artwork. User descriptions alone do not verify a
reference's mechanism.

If a required model, frame sequence, real character illustration, environment capture
or optical renderer is unavailable, choose the strongest code-native representation (shader, procedural 3D, SVG illustration, kinetic type, CSS 3D) yourself, build it at full craft, and list the asset gap in the handoff — never stop to ask. Record the gap and fidelity limitations.
Do not silently substitute rectangles for characters, flat tilt for spatial travel, or
blur for refraction and then claim the requested result. CSS/SVG is not forbidden;
calling a stylized construction photorealistic, refractive or immersive without actual
browser evidence is. Subject-derived shadows, glass, shaders, meshes, gradients,
kinetic typography, grids and asymmetry are legitimate when their behavior is useful.

## 6. Motion grammar reference map

Use inspiration sources to name a behaviour, then rebuild it in the project's tokens.
They are references, not dependencies:

- **Prompt Motion, Landing Love, Awwwards:** study camera language, pacing, section
  transitions, and density. Save a short “borrowed grammar” note, never a screenshot
  collage as the design.
- **GSAP + ScrollTrigger:** pinned, scrubbed, sequenced, SVG, and scroll scenes.
- **Motion:** React state, layout, gesture, and enter/exit transitions.
- **Lenis:** optional scroll interpolation; never required for reading or navigation.
- **Three.js/OGL/tsParticles:** spatial or generative fields only when the concept
  needs a canvas; provide a DOM/static equivalent.
- **Lottie/Rive:** authored vector character or product motion; keep semantic text and
  controls outside the canvas.
- **React Bits/Aceternity/Skiper UI:** implementation starting points. Extract one
  mechanism, then restyle and recompose it. Do not ship the demo composition.
- **Impeccable, TasteSkill, ui-ux-pro-max, and similar skills:** use for critique,
  tokens, anti-pattern detection, and system completeness; they do not replace the
  subject concept or storyboard.

Pick one primary motion system. CSS is the default; add one of Motion or GSAP. Add
Lenis only when scroll is part of the concept. Add WebGL, Rive, or Lottie only when a
cheaper representation cannot express the idea.

## 7. Interaction and accessibility contract

Every invention must have:

- a keyboard/focus path and a touch equivalent;
- visible content before scripts finish;
- a `prefers-reduced-motion` composition with no scrub, parallax, looping particles,
  auto-playing video, or forced smooth scroll;
- a “skip scene” or normal-flow escape for pinned/experimental sections;
- a performance budget: profile on a throttled phone and remove effects that compete
  with reading. Sampled browser replay is not fps or GPU-performance proof.

Do not use wheel capture, scroll hijacking, fake loading screens, hover-only meaning,
or animation that blocks navigation. Creativity is a richer explanation of the subject,
not a waiver of usability.

## 8. Preflight prompt to use internally

Before coding, write:

```text
Subject:
Audience and one job:
Subject verb / material / ritual / place / prop:
Physical metaphor:
Creative intensity:
Signature scene (entry -> transformation -> resolution; escape/release):
Visitor's useful inspection / choice / navigation:
Supporting content (only after prototype acceptance):
Asset plan and licences:
Missing assets / promised fidelity / decision needed:
Primary motion system:
Phone composition:
Reduced-motion and no-JS fallback:
Prototype source anchors and runtime capture plan:
Independent reviewer / actual recording artifacts / acceptance status:
Why each effect exists:
```

If an effect has no answer to “why,” remove it. An expressive brief at intensity 3–4
needs a proven useful flagship transformation; static clarity and restrained feedback
may be correct for composed/app work and are not failures of that brief.
