# Inventing motion from the subject

Generic pages move the same way: a fade-in, a parallax, an aperture. The problem is
often earlier than animation: the conventional layout was built before proving a
subject-specific scene. Invent useful compositions, then prototype the experience.

Read this during invention and flagship prototyping, not only after building a page.

## 1. The rule

Motion must be a **verb phrase about the subject**, not an effect name.

- Effect name: "scroll reveal", "parallax", "aperture open", "fade in".
- Subject verb: "the coffee drains back into the cup", "the hanger turns the garment
  toward you", "the shutter freezes the frame for a beat".

If you can swap the subject and the motion still makes sense, the motion is generic.
Throw it out.

## 2. Mining the inventory

Motion comes from two slots:

- **Object / shape** — what does it look like, and how does that thing move in the
  real world? A camera shutter closes. A hanger swings. A coffee spills and
  settles. A laptop lid opens. A vinyl record spins. A door slides.
- **Ritual** — what sequence does the subject perform? Power on -> patch -> tweak ->
  play. The page can replay that sequence as the user scrolls.

Start every motion decision by writing, in plain words, what the real object does.
Then ask what changes for the visitor and which representation preserves that change.
A laptop opening is subject-specific, but opening a small illustration and then tilting
it slightly need not change the experience. Subject naming is necessary, not sufficient.

## 3. The five-question drill

For a subject, answer these before writing any animation code:

1. What is the single most recognisable physical motion of this thing?
2. What does it do when it is being used, not when it is being sold?
3. What does it do when it is idle, or broken, or finished?
4. What would a child mime if asked to act like this thing?
5. Which action can help visitors inspect, choose, understand or navigate, and which
   assets/rendering would make its entry, transformation and resolution convincing?

Prototype the strongest useful answer to 5. Do not choose merely the cheapest effect.
If its required assets are unavailable, disclose the limitation and agree an alternate
direction instead of silently substituting a one-SVG sketch for photorealistic work.

## 4. Translation patterns (mechanics, not creative proof)

WebGL or physics is not mandatory, and neither is CSS-only rendering. These lightweight
mappings may preserve a stylized idea or support a larger scene. For camera/depth/optical
or articulated subjects, choose the model, layered media, shader or frame representation
that actually supports the promise. See `reference-translations.md`.

| Real motion | Browser version |
| --- | --- |
| A thing opens/closes | `clip-path` or `scaleY` from 0 to 1, transform-origin at the hinge |
| A thing rotates toward you | `rotateY` on hover/focus, with perspective on the parent |
| A thing spills or drains | SVG path morph or `scaleY` on a filled shape, scrubbed by scroll |
| A thing swings | `rotate` with a transform-origin at the top, slight overshoot |
| A thing clicks/snaps | `steps()` easing, a 60 ms transition, a tiny scale pulse |
| A thing lights up | opacity on a glow layer, colour shift on the subject |
| A thing prints/types | `width` or `clip-path` reveal on a line, char by char |
| A thing slides into place | `translateX/Y` with a mechanical ease |

If the subject motion is not on this list, invent the mapping yourself and write it
down. Do not reach for a stock effect because the list is short.

## 5. Subject-specific examples (study these, do not copy them)

- **Clothing shop.** Garments hang on a rail. On hover/focus the hanger turns and
  the garment faces the camera; the back view is a second image cross-faded. The
  rail itself is a horizontal scroll track. No product grid of squares.
- **Coffee shop.** A cup sits in the hero with coffee spilling over the rim. As you
  scroll down the page, the spill drains back into the cup; by the menu section the
  cup is full and still. The cup is the progress indicator.
- **Camera store.** The hero is a viewfinder. Scrolling "focuses" it: blur reduces,
  a frame line draws in, the shutter clicks (a 60 ms scale pulse) and the page
  freezes for a beat before continuing.
- **Bookshop.** Covers are stacked like a pile on a table. Scrolling lifts the top
  cover off and reveals the next; the pile shrinks as you go deeper into the
  catalogue.
- **Restaurant.** The menu is a receipt that prints itself as you scroll, line by
  line, with a blinking cursor. Prices tabulate.
- **Workshop.** A part is shown exploded. Scrolling reassembles it; each part
  slides into its seat with a mechanical snap.

These examples suggest subject verbs; they are not automatically showpieces. A blur
reduction, hanger hover or progress receipt alone still fails an expressive brief if
the same composition persists. Add a useful relationship/view transformation and prove
the result in an independent desktop/phone recording review. Do not pad the inventory.

## 6. What to ban

- An aperture/mask circle that opens, unless the subject is a camera or an eye and
  the concept says so.
- A hero that only fades in.
- Parallax on a stock photo.
- "Scroll to reveal" as the only motion on the page.
- Motion that could be described without naming the subject.

Add any new generic motion you catch yourself using to `tells.md`.

## 7. The invention checklist

- [ ] The signature motion is written as a subject verb phrase, not an effect name.
- [ ] It is derived from Object or Ritual in the inventory.
- [ ] It cannot be moved to another subject without sounding wrong.
- [ ] It has a reduced-motion fallback that shows the same content.
- [ ] The rendering and assets preserve the promised fidelity, not merely the easiest code.
- [ ] Entry, transformation and resolution visibly change useful subject/content relationships.
- [ ] An actual prototype recording was independently reviewed on desktop and phone.

If a flagship box is unchecked, the expressive experience is unaccepted. One convincing
useful action is sufficient; no supporting-motion quota can compensate for a weak one.
