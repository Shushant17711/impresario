# Reference reels: the bar

Six sites the user picked as "this is what heavily animated means". I studied them
frame by frame (2–3 fps). Read this before storyboarding. Your site is judged against
these, not against generic "nice websites".

## What every one of them does (and the failed builds didn't)

| Trait | In the reels | In the failed builds |
| --- | --- | --- |
| **Scene density** | A new *composition* every ~0.5–1 s of scrolling, roughly every 60–120vh | One effect, re-shaped per section, behind static text panels |
| **Camera** | You travel *through* a world: dive, dolly, pan, zoom into a window | Camera never moves; sections stack |
| **An actor** | One object keeps *doing things*: the truck drives on, the bottle pours, the jacket lifts, the figure walks | Nothing acts; a background morphs |
| **Transitions are events** | Ink/torn-edge wipes, iris portals, zoom-throughs, shatters, a road that becomes the layout | Fades and masked line reveals only |
| **Content moves** | Project cards ride a 3D ribbon, then a ring, then fly in as a stack; giant type slides and wraps cylinders | Text boxes sit still beside the effect |
| **Imagery** | Illustrations, rendered objects, photos, 3D space | Particles and lines only |

The last row is the hard one without image generation. Close it with the asset
sources in §3, not by retreating to particles.

## 1. The six reels, scene by scene

### A. Nootturno Experience (graphic-novel scroll story)
Black/white engraving style with one red and a late cyan accent. Title over clouds →
clouds part, a hooded figure walks through layered planes → comic panels slide in as
framed inserts → a white sphere rolls through → red sun grows behind the figure →
*hard cut* to red wood grain with a hand reaching in → circular **iris portal** frames a
silhouette → **ink-drip wipe** to black → red temple of columns, camera dollies down
the aisle → extreme close-up **eyes strip** → bottles on a plinth, hand **pours** into a
martini glass → columns **shatter**, fragments fly → title reprise → torn-edge wipe to
"INDULGE NOW". **Grammar:** parallax planes, framing devices (panels, portals, strips),
material wipes, a recurring character, one object action per scene.

### B. ECHO portfolio
Black loader: "ECHO." with a **hand-drawn ring** circling it → hero "EXPLORE MY PORTFOLIO"
with a silhouette rising through the type → an engraved starry-night panorama is
revealed behind an "ABOUT ME" card that **zooms into a lit window** (light beam on a
figure) → dark section with **giant ghost type in horizontal parallax** and role
cards sliding across → featured projects on a **curved 3D ribbon** that scrolls
sideways → works on a **rotating hexagon ring** → project cards **fly in as a scattered
3D stack** and settle → services → big "LET'S TALK". **Grammar:** content itself moves
in 3D; each section uses a *different* spatial layout mechanic.

### C. Nike virtual store
A 3D white room. The camera **pans between walls** (shoe shelves, bag cubbies, cap wall,
framed posters) → returns to the clothing rail and **dollies in** → hover makes a garment
**swing forward off the rail** → select: the garment centres, the rest blur, and a product
panel slides in with sizes and add-to-cart. **Grammar:** navigation *is* moving a camera
through a space; selection is a physical action.

### D. Logistics (United Carriers style)
Glowing globe with routes → **dive through the atmosphere into clouds** → white page,
stats **scramble-count** → a crane **lifts a container onto a truck** → **the truck drives
across the next sections** while giant outlined text scrolls behind it → service icons
slide past → the road **curves and becomes the layout** (black road, page blocks as
ground) → top-down video of a container ship with its wake, text over it → **pull back
into clouds**. **Grammar:** one persistent actor crossing sections, the environment
as layout, scale jumps (globe ↔ truck ↔ ship).

### E. Noomo Labs / liquidGL
A 3D jellyfish drifts while **giant condensed type scrolls behind and in front of
it** → words wrap a **rotating cylinder** → liquid-glass UI cards refract a colourful
fluid background → a pill nav with refraction over a chrome ribbon. **Grammar:** a
3D creature with type *around* it, and optical materials on UI.

### F. Corridor ("BORING")
A photoreal 3D hallway; the camera turns with the mouse (look-around), and huge type sits
in the space. **Grammar:** the visitor is *in* a place from the first frame.

## 2. Storyboard rules derived from the reels

1. **Scene budget:** roughly one new composition per 100vh of scroll, and ≥ 8 scenes for
   a full site. A scene is a different arrangement, camera position or framing, not
   the same layout with new text.
2. **Actors:** one site-wide actor only when the subject is one thing (the truck, the bottle). For a person or a multi-product brand, each item gets its own actor, plus a hero motif from the real field (see SKILL.md, "Actors that tell the truth"). Either way, each actor appears in its scenes and does a different
   verb in each (lift, drive, pour, unfold, break, land).
3. **≥ 4 different transition types** per site from: iris/portal, material wipe (ink,
   torn paper, liquid, smoke), zoom-through (into a window, screen or eye), whip pan,
   shatter/fragment, environment-becomes-layout, scale jump, pull-back reveal.
4. **≥ 2 content mechanics in 3D space:** ribbon, ring, stack, room wall, cylinder text,
   cards on a path.
5. **Framing devices** create variety cheaply: panels, portals, strips, windows, screens.
6. **Hard cuts are allowed.** The reels cut on beats (red wood after white clouds).
   Ground stability (`colour.md` §3c) governs *slideshow repainting*; a scene cut
   inside one art direction (same palette, same style) is cinema, not churn.

## 3. Imagery without image generation (no cost)

Image generation is off the table (cost). Use, in this order:

1. **The subject's own real media, captured properly.** Real screenshots, figures,
   photos and product shots beat anything you draw. The owner judged designed cards with
   SVG mini-diagrams "much worse than the screenshots": abstract diagrams read as
   generic, while real work reads as proof. What failed earlier was *bad* screenshots, not
   screenshots as such:
   - **Source the best image, not the repo page.** In order: images embedded in the
     README/docs/results folders (download the originals from raw.githubusercontent.com);
     the live demo/app; then a capture of the most visual part. Never use a file
     listing, a wall of code or a whole README page.
   - **Capture at 2× density** (`setViewport(..., dsf = 2)`) and export at ≥ 2× the
     displayed size (webp ~85). Crop tight to the meaningful region.
   - **Legibility check:** any text inside the screenshot must be readable at the card's
     displayed size in the desktop capture. If it isn't, crop tighter or pick another image.
   - **Frame it:** the screenshot takes ≥ 60% of the card, with a thin border and soft
     shadow (window chrome for UI shots), plus name, one line and the strongest real number.
   - Use SVG mini-diagrams only for items that have no visual at all.
2. **Authored SVG illustration in a confident flat or engraved-line style.** An LLM
   can draw a convincing truck, crane, jar, drone, temple column, window or figure
   silhouette as layered SVG (shapes + hatching patterns for an engraving feel). Build
   each scene as 3–5 depth planes for parallax. Poster/screenprint style is a
   legitimate award-level look; vague clip art isn't.
3. **CC0 3D and textures:** Kenney.nl, Poly Pizza (CC0 filter) and Poly Haven
   (models, HDRIs, textures). Record the source and licence in `.impresario/assets.md`.
   Use `GLTFLoader`. Download only CC0/CC-BY, and credit CC-BY.
4. **Procedural Three.js:** rooms, corridors, columns (lathe), creatures (jellyfish:
   a deformed hemisphere plus tentacle lines in a vertex shader), terrain, globes, ships
   from boxes plus instancing. Pair them with real lighting (`RoomEnvironment`) and soft shadows.
5. **Kinetic typography** as scenery: giant ghost type, cylinder text, type walls in 3D.

Never ship the "particles behind text" pattern as the main experience again.
