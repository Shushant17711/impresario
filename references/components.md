# Components and libraries

Routing rule: **bespoke by default, library for mechanics.** A library supplies
behaviour (a scroll-scrub, an accessible menu, a particle field); the concept, the
palette, the type and the composition are yours.

For expressive work, choose mechanics and assets for the **functional flagship
prototype first**, before assembling the surrounding page. Independent review of the
actual desktop and phone recording, not a library name or valid canvas, determines
creative acceptance. See [creative-system.md](creative-system.md) and
[evidence.md](evidence.md).

---

## 1. Routing table

| Need | Use | Do not use |
| --- | --- | --- |
| Layout, type, colour, spacing | Your own CSS with custom properties | A UI kit's default styles |
| Entrance / exit animations | CSS + IntersectionObserver | A library, unless the framework is React and you want `motion` |
| React enter/exit, layout animation | `motion` (motion.dev) | Mixing with GSAP for the same element |
| Scroll scrubbing, pinning, timelines | GSAP + ScrollTrigger | Scroll hijacking libraries, wheel-event hacks |
| Smooth inertial scroll | Lenis | Rewriting scroll physics yourself |
| React micro-interactions (cursor, magnet, tilt, counters) | CSS/Motion or selective React Bits mechanics | Treating micro-feedback as the sole expressive scene |
| Background fields, beams, grids | Aceternity UI, or your own CSS | A canvas particle field when CSS will do |
| Menus, dialogs, tabs, comboboxes | shadcn/ui + Radix | Hand-rolled focus traps and escape handling |
| Icons | Lucide (or Phosphor) | Emoji, mixed icon sets, custom SVG blobs |
| Charts | Recharts, visx, Observable Plot | Hand-drawn SVG bar charts that lie about the data |
| 3D / particles | Three.js, OGL, tsParticles | Anything when the concept does not need it |
| Product articulation, doors, exploded assemblies | Suitable model/rig or supplied frame sequence with a renderer/timeline | Pretending a flat card tilt demonstrates the object's mechanism |
| Optical glass, chromatic light, deforming meshes | Shader/material pipeline when needed for the promised behavior | Calling backdrop blur pixel refraction |
| Real environment camera travel | Licensed WebGL scene, Gaussian splat, 360 media or suitable sequence | Calling a pointer-tilted flat image immersive depth |
| Fonts | Google Fonts, Fontshare, Fontsource | Five families, or a webfont for body copy when a system stack works |

## 2. Where each library is genuinely worth it

- **GSAP** — pinned scroll scenes, scrubbed timelines, SVG path drawing, sequence
  choreography. If you have one great scene, GSAP earns its weight.
- **Lenis** — smooth scrolling on a page built around scroll-linked motion. It makes
  scrubbing feel connected to the pointer. Disable it entirely under reduced motion.
- **Motion** — React projects that want declarative enter/exit and layout animation
  without a timeline DSL.
- **React Bits** — selective mechanics such as a character-reveal headline, magnetic
  button or counter, restyled to the subject. No component count target.
- **Aceternity UI** — a background treatment for one section. Its defaults are dark and
  neon; you will be re-colouring them.
- **shadcn/ui + Radix** — behaviour-first primitives. Copy the source, restyle it fully,
  and keep the accessibility semantics.
- **Three.js/OGL or a suitable renderer** — spatial inspection, physical materials,
  shader optics or mesh deformation when the subject needs them. Keep semantic content
  and controls in HTML and provide device/static alternatives.

Use the lightest renderer that can honestly deliver the requested fidelity, not the
lightest renderer regardless of the request. CSS/SVG is valid for stylized scenes and
subject-derived physical shadow, glass treatments, gradients, grids and kinetic type.
It cannot be called photorealistic, refractive or immersive without visible evidence of
that claim. A true optical effect must visibly affect pixels/light; a useful spatial
journey must reveal actual depth, not only the tilt of a plane.

If models, articulation data, environment captures, frame sequences or original
character assets are missing, choose the strongest code-native representation (shader, procedural 3D, SVG illustration, kinetic type, CSS 3D) yourself, build it at full craft, and list the asset gap in the handoff — never stop to ask. Document fidelity and provenance. Do not fill an asset gap
with a component demo and call the brief delivered. Reference grammar and original
cross-domain examples are in [reference-translations.md](reference-translations.md).

## 3. Rules when borrowing

1. **Restyle completely.** Every colour, radius, spacing step, border and easing must
   come from the direction sheet. A component with its own palette reads as a foreign
   object.
2. **Read the source before using it.** Know what it animates, what it requires
   (React version, Tailwind, a peer dependency) and what it does under reduced motion.
3. **Check the licence.** Most are MIT; verify, and note it in the report.
4. **Do not ship a library's demo structure.** The demo's arrangement, copy and padding
   are the tell. Replace them.
5. **Keep the bundle honest.** Prefer one timeline owner and a coherent icon set;
   renderer/state mechanics may coexist without competing over the same property.
   Remove unused imports and check bundle size.
6. **Prove the useful action.** A viewer must inspect, a configurator must select
   compatible options, and spatial navigation must reach real content. One action
   across chapters remains one action; no motion/entity/property quota proves quality.

## 4. App screens

App screens are a different genre: the composition rules relax because the work is in
the content.

**Normal here (and unusual on a marketing page):**

- Repeated panels, tables, and list rows.
- Small labels at 11-13 px for metadata (not as decorative eyebrows over headings).
- Quiet 1px borders between data regions.
- Dense information; a data table is the correct answer to "compare these".
- Persistent navigation, a sidebar, a toolbar, a command palette.
- Compact type scale; 14-16 px body.

**Still applies:**

- Every control has hover, focus-visible and active states.
- Contrast rules are unchanged.
- Real data, or obviously-marked sample data — never invented metrics presented as fact.
- Motion is task-first: brief state feedback, useful progress and orientation. No
  forced cinematic showpiece, ambient loop or scroll scene. A domain-specific spatial
  inspector may be appropriate only when it helps the actual work.

**Useful primitives:** shadcn/ui (Table, Dialog, DropdownMenu, Command, Tabs, Toast),
TanStack Table for data grids, TanStack Query for server state, and an icon set with
one stroke weight.

## 5. Accessibility primitives

Never hand-roll these:

| Need | Use |
| --- | --- |
| Focus management in dialogs | Radix / React Aria / native `<dialog>` |
| Menu / listbox keyboard support | Radix, Headless UI |
| Accordion, tabs, switch | Radix, Headless UI, or native elements |
| Skip links, landmarks, heading order | Plain HTML — `<header>`, `<nav>`, `<main>`, `<footer>`, `<h1>`-`<h2>` |
| Form validation messaging | Native + `aria-describedby`, `aria-invalid` |
| Live regions for async updates | `aria-live="polite"` on a real container |
| Alt text | Plain `alt`, decided with the concept (see `craft.md` §5) |

Checks to run before finishing:

- [ ] Tab through the whole page: every interactive element is reachable, in order.
- [ ] The focus ring is visible on every interactive element, at 3:1 contrast or better.
- [ ] Escape closes dialogs and menus; focus returns to the trigger.
- [ ] Every image has meaningful `alt`, or `alt=""` if it is purely decorative.
- [ ] Headings descend without gaps (`h1` -> `h2` -> `h3`), one `h1` per page.
- [ ] Text meets 4.5:1; large text and UI borders meet 3:1.
- [ ] The page is usable at 200% zoom and at 320 px wide.
- [ ] `prefers-reduced-motion` removes travel, loops and smooth scroll.
- [ ] No-JS content and native navigation remain; pinned/experimental scenes have escape.
- [ ] Four-mode scene-local evidence is current where required; actual desktop/phone
      recording is independently reviewed, with artifact-specific critique.
- [ ] Sampled screencast/replay is not presented as fps or GPU-performance proof.
