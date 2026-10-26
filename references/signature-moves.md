# Signature moves: flow choreography + working recipes

The idea (from `idea-engine.md`) decides *what* moves. This file is *how*. Start from
`assets/motion-kit.js` (smooth scroll + GSAP sync, reduced motion, cursor, split
helpers, shader canvas) so plumbing is never the bottleneck.

## Stack (no build step needed)

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<!-- 3D only when the concept needs it -->
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
```

All GSAP plugins (SplitText, Flip, MorphSVG, DrawSVG…) are free. In React/Vite use the
npm packages (`gsap`, `@gsap/react` `useGSAP`, `lenis`, `three`/`@react-three/fiber`).

## The laws of flow (what makes it feel award-level, not "fade-in sections")

1. **Nothing appears from nowhere.** Every element enters *from* a direction, mask,
   scale, or another element. Prefer masked reveals (`yPercent:100` inside
   `overflow:hidden`) over opacity fades.
2. **Scroll is a timeline, not a trigger.** For the hero journey use pinned sections
   with `scrub` so the visitor *drives* the motion. Use one-shot triggers only for
   small supporting reveals.
3. **Hand-offs.** The last state of section N is the first state of section N+1:
   the hero object shrinks into the next section's layout (Flip), the background
   colour of the next section is already bleeding in, a line drawn at the end
   becomes the next section's divider. Overlap timelines (`"<0.2"`, `"-=0.4"`).
4. **One persistent thing.** Something stays across the page (an object, a shader
   background, a cursor, a counter) and *changes state* per section.
5. **Easing vocabulary.** Entrances `expo.out`/`power4.out` (0.9–1.4 s); exits
   `power2.in` (0.4–0.6 s); scrubbed motion `none` or `power1.inOut`; playful
   `back.out(1.7)` / `elastic.out(1,0.5)` sparingly. Never linear for UI entrances.
6. **Stagger everything that is plural** (chars 0.02, words 0.04, lines 0.08, cards 0.1).
7. **Velocity reacts.** Marquees, skews, shader speed, grain respond to scroll velocity
   (`lenis.velocity` / `self.getVelocity()`), so the page feels physical.
8. **Rhythm.** Alternate intense pinned scenes with breathing sections (big quiet type).
   Pace like a film: open → build → climax (the signature move) → release → close.
9. **Accessible by construction.** Content exists in the DOM; motion is decoration on
   top. Under `prefers-reduced-motion`, skip smooth scroll, pins and scrubs and show
   final states. Keyboard focus visible; links are real links.

## Recipes

### §1 Opening ritual: preloader → hero hand-off
```js
const tl = gsap.timeline();
tl.to('.loader__count', { innerText: 100, snap: 'innerText', duration: 1.6, ease: 'power2.inOut' })
  .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' })
  .add(revealLines('.hero__title'), '-=0.5')   // from motion-kit
  .from('.hero__visual', { scale: 1.25, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, '<');
```
```css
.loader{position:fixed;inset:0;z-index:100;display:grid;place-items:end start;padding:4vw;
  background:var(--ink);color:var(--bg);clip-path:inset(0 0 0 0);font-size:12vw}
```

### §2 Masked line / char reveal (SplitText 3.13+)
```js
SplitText.create('.reveal', { type: 'lines', mask: 'lines', autoSplit: true,
  onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out',
    stagger: 0.08, scrollTrigger: { trigger: self.elements[0], start: 'top 85%' } }) });
```
**Descender trap:** tight display leading (0.8–0.9) + a line mask clips the tails of
g/j/p/q/y. Give mask wrappers room and cancel it on the layout so lines don't drift:
`.reveal > div { padding-bottom: .18em; margin-bottom: -.18em; }` (SplitText mask
wrappers are the line's parent `div`). If a *next* state sits right below a masked
line, hide it with `autoAlpha:0` until its turn instead of trusting the mask.

Variants: chars with `rotateX:-90, transformOrigin:'50% 100%'`; outline→fill by
animating `-webkit-text-stroke` + `color`; scramble via `motionKit.scramble(el)`.

### §3 Pinned scene with a scrubbed timeline (the core of every "journey")
```js
const scene = gsap.timeline({ scrollTrigger: {
  trigger: '.scene', start: 'top top', end: '+=300%', pin: true, scrub: 1 } });
scene.to('.obj', { rotate: 180, scale: 0.6, xPercent: -30 })
     .from('.scene__step--1', { yPercent: 100, autoAlpha: 0 }, '<0.2')
     .to('.scene__step--1', { yPercent: -100, autoAlpha: 0 })
     .from('.scene__step--2', { yPercent: 100, autoAlpha: 0 }, '<')
     .to('.scene', { '--bg': 'var(--next-bg)' }, '<');   // colour hand-off
```
Length of pin = amount of story. 200–400 % for a hero journey.

### §4 Scroll-scrubbed object (3D or layered SVG "exploded view")
Drive any state from progress: `onUpdate: self => world.setProgress(self.progress)`,
then inside `setProgress` interpolate camera position, part offsets, material colour.
Exploded view: each part has a `dir` vector; `part.position.copy(dir).multiplyScalar(p*2)`.

### §5 Living shader background (no deps; colours from the subject)
Use `motionKit.shader(canvas, fragSrc)`; uniforms `uTime`, `uRes`, `uMouse`,
`uScroll`, `uVel` are supplied. Flow/liquid gradient fragment:
```glsl
precision highp float; uniform float uTime,uScroll,uVel; uniform vec2 uRes,uMouse;
uniform vec3 uA,uB,uC;
float n(vec2 p){return sin(p.x)*sin(p.y);}
void main(){ vec2 uv=gl_FragCoord.xy/uRes; vec2 p=uv*3.;
  float t=uTime*.15+uScroll*2.;
  for(int i=1;i<5;i++){ p+=.6/float(i)*vec2(sin(p.y*float(i)+t), cos(p.x*float(i)+t*1.3)); }
  float m=.5+.5*sin(p.x+p.y); float d=distance(uv,uMouse);
  vec3 col=mix(mix(uA,uB,m),uC,smoothstep(.35,0.,d)*.6);
  col+= (fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.06; // grain
  col=clamp(col,0.,1.); gl_FragColor=vec4(col,1.); }
```
**Colour clipping:** pass palette colours in *linear-ish* 0–1 values and keep the
brightest below ~0.92 per channel; additive highlights over a pale colour clip toward
lemon/green. Check the palest state in a screenshot, not in your head.

Shift `uA/uB/uC` per section with `gsap.to(uniforms.uA.value, {...})` for colour hand-offs.

### §6 Custom cursor + magnetic buttons
`motionKit.cursor()` gives a lerped dot/ring; add `data-cursor="View"` to grow it into
a label. `motionKit.magnetic('.btn', 0.35)` pulls buttons toward the pointer. Disable on
touch (`matchMedia('(pointer:fine)')`).

### §7 Velocity marquee
```js
const mq = gsap.to('.marquee__track', { xPercent: -50, repeat: -1, duration: 20, ease: 'none' });
lenis.on('scroll', ({ velocity }) => {
  gsap.to(mq, { timeScale: 1 + Math.min(Math.abs(velocity) / 4, 6) * Math.sign(velocity || 1), duration: .3 });
  gsap.to('.marquee', { skewX: gsap.utils.clamp(-12, 12, velocity * -0.4), duration: .4 });
});
```

### §8 Horizontal journey inside a pin
```js
const track = document.querySelector('.h__track');
gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
  scrollTrigger: { trigger: '.h', pin: true, scrub: 1, end: () => '+=' + track.scrollWidth,
    invalidateOnRefresh: true } });
```
Make the cards *do* something mid-travel (containerAnimation triggers): parallax inner
image, rotate in, colour-up when centred.

### §9 Particles that form text or a silhouette
Draw the word on an offscreen canvas, sample filled pixels every 4–6 px into targets,
spawn particles at random/cursor positions, spring them to targets
(`v += (target-p)*0.06; v *= 0.85`), repel within 80 px of the cursor. On scroll,
lerp targets to the next word/shape → particles re-form (hand-off!).

### §10 Image/section reveals with clip-path
```js
gsap.fromTo('.media', { clipPath: 'inset(40% 30% 40% 30% round 2rem)' },
  { clipPath: 'inset(0% 0% 0% 0% round 0rem)', ease: 'none',
    scrollTrigger: { trigger: '.media', start: 'top 80%', end: 'top 20%', scrub: true } });
```
Inner element counter-scales (`scale:1.3 → 1`) for parallax depth.

### §11 Flip hand-off (hero object → next layout)
```js
const state = Flip.getState('.hero-obj');
document.querySelector('.slot').appendChild(document.querySelector('.hero-obj'));
Flip.from(state, { duration: 1.2, ease: 'expo.inOut', scale: true });
```
Scroll-driven version: `Flip.fit()` into a timeline inside §3.

### §12 SVG line draw / path morph
`stroke-dasharray`/`dashoffset` scrubbed (or DrawSVG plugin); morph shapes with
MorphSVG between subject-specific silhouettes (bean → cup → logo).

### §13 Page/state transitions
Same-document: `document.startViewTransition(() => swap())` with
`view-transition-name` on shared elements; style `::view-transition-old/new(root)`
with clip-path wipes in the world's material. Multi-page: CSS
`@view-transition { navigation: auto; }`.

### §14 Section theme shifts
Each section declares `data-theme="<subject state>"` (e.g. `dawn|noon|sodium`, `cracked|rewired|booted`; never a generic `dark|cream|accent` set); a ScrollTrigger per section
tweens CSS variables on `<html>` when its centre crosses the viewport centre. The
persistent background (shader or solid) changes smoothly instead of hard cuts.

### §15 Three.js hero, procedural (no model files)
`LatheGeometry` (cups, vases, bottles from a 2D profile), `ExtrudeGeometry` from SVG
paths (logos, letters), `TorusKnot`/`Icosahedron` with `MeshPhysicalMaterial`
(`transmission`, `roughness`, `iridescence`, `clearcoat`), `RoomEnvironment` for
reflections, `ACESFilmicToneMapping`. Cap `devicePixelRatio` at 2, pause when offscreen.

## Performance and fallback essentials
- Animate `transform`, `opacity`, `clip-path`, CSS vars, shader uniforms; avoid layout props.
- One owner per property (don't let CSS transitions and GSAP fight).
- `ScrollTrigger.refresh()` after fonts/images load; `invalidateOnRefresh` for size math.
- Reduced motion: `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`
  around all pins/scrubs; otherwise show end states. Lenis off.
- Mobile: keep the idea, simplify the mechanism (shorter pins, fewer particles, no
  cursor, DPR 1.5). Test at 390 px wide.
