# Creative effects catalog

These are optional supporting mechanics, not a creative acceptance checklist. There
is no required effect count or compulsory pin. Invent and prototype the useful flagship
first; borrowing three recipes cannot turn a static layout into a cinematic experience.

Each recipe assumes GSAP + ScrollTrigger unless noted. Every one has a reduced-motion
fallback. DOM transform/opacity is a performance preference, not a prohibition on
shader uniforms, articulated rigs, deforming meshes, frame sequences or SVG geometry.

## 1. Pinned hero with mask reveal

Pin the hero. Scrub an aperture/mask open. Headline settles as the mask opens.
`examples/shinobi/index.html` is an incomplete mechanics-only negative example: it
does not deliver the character or blade narrative. Do not use it as showpiece proof.

## 2. Sticky stacking cards

Cards stack on top of each other as you scroll, each pinning briefly.

```js
document.querySelectorAll('.stack__card').forEach((card, i) => {
  ScrollTrigger.create({
    trigger: card,
    start: 'top 12%',
    end: 'bottom 12%',
    pin: true,
    pinSpacing: false,
  });
});
```

```css
.stack__card { will-change: transform; }
```

Fallback: cards simply follow in normal flow.

## 3. Horizontal scroll gallery

A section that scrolls horizontally while the page scrolls vertically.

```js
const track = document.querySelector('.gallery__track');
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.gallery',
    start: 'top top',
    end: () => '+=' + (track.scrollWidth - window.innerWidth),
    scrub: true,
    pin: true,
    invalidateOnRefresh: true,
  },
});
```

Fallback: track becomes a normal vertical list.

## 4. Clip-path wipe between sections

A section reveals itself with a clip-path wipe driven by scroll.

```js
gsap.fromTo('.wipe', { clipPath: 'inset(0 100% 0 0)' }, {
  clipPath: 'inset(0 0% 0 0)',
  ease: 'none',
  scrollTrigger: { trigger: '.wipe', start: 'top 80%', end: 'top 20%', scrub: true },
});
```

## 5. Parallax image drift

Image translates a fraction of the scroll distance. Use sparingly; one image per page.

```js
gsap.to('.parallax img', {
  yPercent: -12,
  ease: 'none',
  scrollTrigger: { trigger: '.parallax', start: 'top bottom', end: 'bottom top', scrub: true },
});
```

## 6. Masked text reveal

Text reveals through a moving mask, like a curtain.

```css
.masked { clip-path: inset(0 100% 0 0); }
```

```js
gsap.to('.masked', {
  clipPath: 'inset(0 0% 0 0)',
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.masked', start: 'top 75%' },
});
```

## 7. Scroll progress line

A thin bar at the top of the page that grows with scroll progress.

```js
gsap.to('.progress', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: { start: 0, end: 'max', scrub: true },
});
```

```css
.progress { transform: scaleX(0); transform-origin: left; height: 2px; background: var(--accent); position: fixed; top: 0; left: 0; right: 0; z-index: 60; }
```

## 8. 3D tilt card

A card that tilts toward the cursor. Use on one or two cards, never a whole grid.

**Supporting polish only.** Small perspective tilts are not camera journeys, spatial
navigation or a useful composition transformation, even if several properties change.

```js
card.addEventListener('pointermove', (e) => {
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
});
card.addEventListener('pointerleave', () => { card.style.transform = ''; });
```

## 9. Animated counter

A number that counts up when it enters view.

```js
const el = document.querySelector('.counter');
const end = +el.dataset.end;
gsap.fromTo(el, { textContent: 0 }, {
  textContent: end,
  duration: 1.4,
  ease: 'power2.out',
  snap: { textContent: 1 },
  scrollTrigger: { trigger: el, start: 'top 80%' },
});
```

## 10. Character reveal headline

Headline characters drop in one at a time. Use once per page.

```js
gsap.from('.char', { yPercent: 110, opacity: 0, stagger: 0.03, duration: 0.6, ease: 'power3.out' });
```

## Reduced-motion rule

For every effect above, when `prefers-reduced-motion: reduce` is on:

- drop travel, parallax, pinning, scrubbing and tilt;
- show the final state immediately;
- keep all content visible and readable;
- stop smooth scrolling.
