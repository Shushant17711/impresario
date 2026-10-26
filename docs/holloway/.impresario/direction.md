# Holloway Honey Farm — director's sheet

## Absorb
Subject: small family honey farm. Audience: locals + gift buyers who'd post-order.
One action: reserve/order jars (collect at the honesty stand or post). Visit is secondary.
Invented (placeholders): Holloway Honey Farm, Holloway Lane, Herefordshire; 41 hives;
Ruth, Dev, Ivy (11), Grandad Len (est. 1987); 3 jars + prices; address; email.

## Mine the subject
- Verb: forage / gather / pour.   - Material: honey — viscous, translucent, slow.
- Dimension: the season. Honey literally darkens through the year (spring blossom is pale,
  heather/ivy are near-black) and beekeepers grade colour on the **Pfund scale (mm)**.
- Signature object: the jar.   - Ritual: bloom → forage → harvest (lift frames) → pour → jar.
- Medium: hand-written jar label, the honesty-box stand at the farm gate.

## 5 concepts (5 generators)            Mem / Truth / Build / Useful = total
1. Scroll is a dimension — scroll through one year; the honey filling the page rises and
   darkens month by month, each flow is a jar you can buy.            5/5/4/5 = 19
2. The page is the object — the viewport is a jar seen side-on; scrolling fills it. 4/3/4/3 = 14
3. Process — you lift a frame, uncap it, spin the extractor, pour.   4/5/3/3 = 15
4. Medium parody — the site is the family's hive-log notebook / jar label. 3/4/5/4 = 16
5. Persistent character — one bee forages your scroll path, flowers bloom where it lands. 4/3/3/3 = 13

PICK: #1. Borrowed one device from #3: the harvest pour (honey fills the screen then drains into jars).
TWICE AS BOLD: the honey is not an illustration on the page — it is a live liquid filling the
*viewport itself*, persistent from the first drop to the footer, with a Pfund colour gauge
reading it like an instrument.

## Sheet
THE SITE WHERE YOU: scroll through a beekeeping year and watch the honey rise and darken,
  then see it pour into the three jars you can buy.
WORLD / MATERIAL: honey. Everything that moves is slow, viscous, lagging (lerp .06), glossy.
HERO SIGNATURE MOVE: fixed full-screen WebGL honey surface (level + colour uniforms), driven by
  scroll keyframes; meniscus highlight, rising bubbles, waves react to scroll velocity, pulls
  toward the cursor, ripples on drops.
CONTINUITY DEVICE: the honey level/colour + the Pfund gauge needle; body background is part of
  the same interpolated world state.
SECTION JOURNEY: drop → hero (puddle) → THE YEAR pinned: April blossom → June bramble & clover →
  August heather → October ivy (level 20%→50%, pale→dark) → HARVEST pinned: honey floods the
  screen, comb cells appear, drains into 3 jars (shop) → forage marquee → promise (cream, quiet)
  → family → honesty stand map → close on dark propolis with bright honey + dripping wordmark.
OPENING RITUAL: a single drop stretches from the top edge, falls, splashes — the pool appears.
CLOSING MOMENT: giant dripping "Holloway"; click to drop honey into the pool (toy) + order.
TYPE: Gambarino (Fontshare, soft curvy display serif) + Switzer (text). Display 16–20vw.
PALETTE: wax cream #F3EAD3 / propolis ink #1F130A / accent = the honey itself
  (#F4DF9E → #E7B347 → #C2741D → #5A2A0D), dark close #1F130A + #E8A02C.
PERSONALITY: hexagon cursor with labels, magnetic CTAs, velocity marquee, a bee in the year.
VISUAL SOURCE: fragment shader + hand-authored SVG flowers/jars + kinetic type.

## Beat sheet (hand-off in brackets)
OPEN   (0–2s) drop stretches from the top edge, falls, splashes [the splash becomes the pool].
HERO   "Holloway" wordmark rises from masks; honey pool sits at 20% and leans toward the cursor.
BUILD  THE YEAR (pin 400%): April → June → August → October; month word rolls, flower SVG
       re-grows, a bee flies to each flower, honey rises + darkens, Pfund needle tracks it
       [the level keeps rising past the pin].
CLIMAX HARVEST (pin 250%): honey floods the whole screen, comb cells appear, "Harvest.";
       then it drains and the three jars fill in the same colours [the honey is now in jars = the shop].
RELEASE marquee of forage flowers (velocity) → "We take only what the bees can spare." → family → stand.
CLOSE  background darkens to propolis, bright honey rises again, dripping wordmark, basket/order,
       click to drop honey.
