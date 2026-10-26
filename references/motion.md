# Motion

Motion can explain a subject, an action or a state change. Motion that is not *about*
something is noise, and noise is worse than stillness. Task-first app screens do not
need a cinematic performance.

**The test:** for each animation you write, complete the sentence *"This moves so that
___"*. If the blank is empty, delete it.

---

## 1. What motion is for

| Purpose | What it does | Example |
| --- | --- | --- |
| **Narrate** | Shows a sequence that happened or will happen | The repair bench: power on, patch, tweak, play |
| **Establish hierarchy** | Says what is important and what came first | The title arrives, then the word, then the picture |
| **Transition** | Carries the eye from one thing to another | A section's image slides to become the next section's background |
| **Feedback** | Confirms that the visitor did something | A button compresses, a value updates |
| **Ambient** | Keeps the page alive when nothing is happening | Dust in a shaft of light, a slow drifting cloud |

An expressive brief is not delivered by entrance fades and hover feedback alone. Build
its functional flagship first: entry, transformation and resolution must be visibly
different useful compositions in the actual browser sequence. There is no minimum
motion, scene, entity or property count and no obligation to add ambient animation.
One action remains one action across chapters. A 5% scale and 4-degree tilt with named
phases fails as the sole spectacle; do not replace it with a numeric angle/scale rule.

For an expressive hero brief, make the subject-specific action available in the first
viewport; autoplay is not required. Reduced motion must show a complete useful state.
See [creative-system.md](creative-system.md) for prototype-first acceptance and
[reference-translations.md](reference-translations.md) for subject-derived grammar.

## 2. Build from the useful action outward

Build in this order. Do not start with the library.

1. **Functional flagship** for expressive work: the subject action and working
   inspection, choice or navigation, not an empty animation shell.
2. **Prototype alternatives and evidence:** desktop, phone, reduced and reduced-phone,
   plus no-JS content and escape. Independently review the actual recording before
   building the surrounding page.
3. **Supporting transitions and feedback:** add only what clarifies continuity or
   confirms a control's result. Entrances and ambient motion are optional.

### Entrances

- Trigger once, when the element enters the viewport. Never re-trigger on scroll up.
- Order matters: heading, then text, then media. The eye follows the argument.
- Stagger: 60-90 ms between siblings. Longer feels sluggish; shorter feels like a
  glitch.
- Travel: 16-32 px upward, with opacity 0 -> 1. Larger travel is for the signature
  move, not for entrances.
- Duration: 400-700 ms, easing from the direction sheet's register.
- **The resting state is visible.** Write the CSS so the element is fully visible by
  default, and let the script add the "not yet entered" state. If the script fails or
  is slow, the content must still be there. This is a correctness rule, not a style
  preference.

### Feedback

- Hover: 120-200 ms, subtle. Colour, position (1-2 px), opacity, or a scale to 1.02.
- Focus-visible: **always**, and visibly. A 2-3 px outline in the accent colour with
  an offset. Never `outline: none`.
- Active/press: compress by 1-2% or shift 1 px down. 80-120 ms.
- Nothing that only animates on hover, with no keyboard equivalent. If a hover reveals
  content, the same content must be reachable by focus.

## 3. Scroll-linked motion

### The rules

- **Never capture the wheel.** No scroll hijacking, no `preventDefault` on wheel, no
  snap-to-section. Native scroll always.
- **Prefer transform/opacity for DOM movement.** Layout and paint-heavy properties
  require profiling. This is not a ban on physical shadows, glass, SVG path changes,
  mesh deformation, shaders, gradients or kinetic typography when the subject needs
  them. Choose a renderer that can deliver the promised visible behavior.
- **Pinning** is optional. Pin only the stage that needs it, then release. Sticky
  task navigation can be justified independently of a scene.
- **Progress-linked, not event-linked.** Drive from scroll *progress* (0-1), not from
  a series of scroll events.
- **Never animate the whole page.** A transform on a wrapper creates a containing block
  and breaks `position: fixed` inside it.

### The choreography

A scene has **entry**, **transformation** and **resolution** compositions, a useful
action, an input mapping and an escape/release. Write these before coding. Timing must
follow the subject's action rather than a fixed settle/body/release recipe.

For example, a workstation opens from an assembled build into an exploded compatibility
view; choosing a workload focuses the relevant parts and shows measured/sample-labelled
performance evidence; the resolved configuration stays selected in a native build list.
That is one inspection/configuration action, even if several captions accompany it.

Measure scroll bounds at runtime for each viewport, after assets and pinning settle.
Capture the scene's own bounds, not progress through the whole document. Phone or
non-scroll alternatives may use native click/pointer/key steps. The versioned manifest
and recording command are documented in [evidence.md](evidence.md).

## 4. Choosing the library

**Use the lightest tool that does the job.**

| Need | Tool | Notes |
| --- | --- | --- |
| CSS transitions and keyframes | CSS | The default. Most entrances and all feedback need nothing else |
| Simple enter/exit, layout animations | **Motion** (Framer Motion's successor) | `motion.dev` — declarative, React-first but framework-agnostic core |
| Scroll scrubbing, pinning, timelines | **GSAP** + ScrollTrigger | The most capable; pinned scenes, timelines, scrubbing |
| Smooth inertial scrolling | **Lenis** | Adds a smoothing layer over native scroll. Disable for reduced motion and for people who prefer it off |
| React animation components | **React Bits** | Text/char reveals, cursor effects, animated counters, tilt cards |
| Tailwind-style component blocks | **Aceternity UI** | Backgrounds, beams, grids, spotlight, moving borders |
| WebGL / particles | **Three.js**, **OGL**, `tsParticles` | Only when the concept needs a rendered field; budget the GPU |
| Icon set | **Lucide** | Consistent stroke weights; never emoji |
| Accessible primitives | **shadcn/ui** + Radix | Menus, dialogs, tabs, comboboxes — the behaviour, styled in your tokens |

Rules:

- **Vanilla CSS first.** A page that needs GSAP is often a page that needs one
  well-chosen scene and some CSS transitions.
- **Prefer one timeline owner**, plus Lenis only if needed. A renderer or state library
  may coexist, but never let competing systems own the same property.
- **Rewrite borrowed patterns in your tokens.** A React Bits component with its own
  colours, easing and spacing will read as a different site pasted into the middle.
- **Progressive enhancement, not page-first construction.** Keep the prototype's
  default HTML readable, then implement its real action immediately. Do not build an
  entire static page before discovering that the flagship cannot be delivered.
- **Rendering claims need evidence.** Stylized CSS/SVG is allowed. Blur does not prove
  glass pixel refraction or chromatic aberration; flat pointer tilt does not prove
  immersive camera depth. Missing assets/capability mean choosing the strongest
  code-native representation yourself and naming the gap in the handoff — never stop to ask.

## 5. Reduced motion

`prefers-reduced-motion: reduce` is a requirement, not a courtesy. It is set by people
with vestibular disorders, by older operating systems, and by some schools.

When it is on:

- **Remove travel.** Opacity fades are acceptable; large movements, parallax, rotation
  and scale are not.
- **Stop continuous animation.** No loops, no drifting, no particles, no auto-playing
  video with motion.
- **Keep scene content.** Replace scrub or travel with a complete static composition
  and instant native inspection/selection where useful. Do not retain a trapping pin.
- **Stop smooth scrolling** (Lenis) entirely.
- **Do not remove content.** A reduced-motion page has the same content as the normal
  one.

Implementation:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

That global reset is a backstop. Still handle the JS-driven scenes explicitly, because
the reset does not touch GSAP timelines or `requestAnimationFrame` loops.

Also: **never auto-play video with sound**, and never autoplay a video at all if it
carries information — let the visitor press play, and give the motion a static poster
frame.

## 6. Performance budget

- Profile motion on the intended devices; optimize or offer a clear fallback when it
  harms reading or input. A sampled screencast/replay is not fps or GPU evidence.
- Promote the elements you animate to their own layer with `will-change` — sparingly,
  and remove it afterwards. `will-change` on many elements creates memory pressure.
- Use `IntersectionObserver` for entrances; never scroll handlers that call
  `getBoundingClientRect` in a loop.
- Batch DOM reads before writes; never interleave them in a rAF callback.
- Throttle expensive work (canvas, filters, backdrop blur) to the device.
- **Test on a 4x CPU throttle** if you can. Animation that is smooth on your machine
  can be unusable on a mid-range phone.

## 7. Motion recipes

**Entrance that does not hide content when JS fails**

```html
<section class="beat">
  <h2 class="beat__title">Your synth comes back to life</h2>
  <p class="beat__body">Every board is recapped...</p>
</section>
```

```css
.beat__title, .beat__body { opacity: 1; transform: none; }
.js .beat--pending .beat__title { opacity: 0; transform: translateY(24px); }
```

Add `js`/pending classes only after the observer or animation handler is installed.
Clear pending states on failure and under reduced motion. An early `js` class alone
does not prove a later bundle will load.

**Smooth scroll with Lenis, disabled for reduced motion**

```js
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) {
  const lenis = new Lenis({ duration: 1.1 });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
```

**Hover that also works on focus**

```css
.card:hover, .card:focus-within { transform: translateY(-2px); }
```

**Avoid unnecessary layout animation**

```css
/* bad */ .bar { transition: width .4s; }
/* good */ .bar__fill { transform: scaleX(0.6); transform-origin: left; }
```


## 8. Mechanical starting points, not showpiece templates

These snippets demonstrate mechanics only. Restyle tokens and supply the subject's
real behavior from the accepted prototype. A pin, mask, caption fade or valid timeline
cannot establish cinematic delivery. None of these capture the wheel.

### 8.1 Pinned scroll scene (GSAP + ScrollTrigger)

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) {
  const scene = document.querySelector('.scene');
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=120%',
      scrub: 0.6,
      pin: true,
      invalidateOnRefresh: true,
    },
  });
  // Add the subject-specific action from the prototype storyboard to tl.
  // The pin/scrub setup alone is not a functional or accepted scene.
}
```

```css
.js .scene--pending .scene__title { opacity: 0; transform: translateY(24px); }
@media (prefers-reduced-motion: reduce) {
  .js .scene--pending .scene__title { opacity: 1; transform: none; }
}
```

### 8.2 Lenis + GSAP, disabled for reduced motion

```js
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) {
  const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}
```

### 8.3 Framer Motion (React) enter/exit

```tsx
import { motion, AnimatePresence } from 'motion/react';

<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
  {children}
</motion.section>
```

Use `once: true` for decorative entrances and `layout` only for a real state change.
This enhancement also needs a visible no-JS state and explicit reduced-motion handling.

### 8.4 Aceternity-style background (recoloured)

Borrow a background treatment only when subject-justified. Restyle every colour, blur
and opacity to the direction sheet. Strip the demo's dark/neon defaults unless they
are actually appropriate. A background component is not the flagship action.

```tsx
// beams, spotlight, or moving border — pick one
<BeamsBackground className="absolute inset-0" beamColor="var(--accent)" />
```

### 8.5 React Bits pieces (selective mechanics)

Character-reveal headline, magnetic button, animated counter. Restyle completely:
colours, easing, spacing, and the trigger threshold all come from the sheet.

```tsx
<MagneticButton strength={0.3}>Book a 20-minute call</MagneticButton>
```

### 8.6 Reduced-motion equivalents

```js
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// GSAP
if (reduced) {
  gsap.set('.scene__image, .scene__caption', { clearProps: 'all' });
} else {
  // timeline above
}

// Framer Motion
<motion.div
  initial={reduced ? false : { opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

And stop Lenis entirely (see 8.2).

### 8.7 Performance checks

- Prefer `transform` and `opacity` for DOM movement; profile needed material/rendering work.
- Promote with `will-change` only during the animation; remove afterwards.
- Use `IntersectionObserver` for entrances; no scroll handlers reading layout.
- Batch DOM reads before writes in rAF callbacks.
- Test on a 4x CPU throttle before calling a scene done.
- Watch and cite the actual desktop/phone recording for creative review; profiling and
  builder self-review do not replace independent visual acceptance.
