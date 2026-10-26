# Veda Computers — director's sheet

## Absorb
- Subject: neighbourhood computer shop (laptop repair, CCTV installs, general IT).
- Audience: people with a broken laptop *right now*; small shops/offices/homes wanting cameras.
- One action: **bring it in / call or WhatsApp for a quote.**
- Stack: static HTML + CSS + JS, CDN GSAP/ScrollTrigger/SplitText/Lenis.

## Mine the subject
- Verb: repair, diagnose, revive, watch over.
- Material: cracked glass → copper PCB traces → clean, lit screen.
- Dimension: repair progress 0 → 100 %. Also layers of a laptop.
- Signature object: a laptop screen that's been dropped.
- Ritual: drop off → diagnose → fix → test → pick up.
- Medium: repair job card, POST/diagnostic boot text, CCTV monitor wall.

## 5 concepts (one generator each), scored Mem / Truth / Build / Use (1–5 each)
| # | Generator | The site where you… | M | T | B | U | Σ |
|---|---|---|---|---|---|---|---|
| A | Scroll is a dimension | …descend through a laptop layer by layer: lid, keys, board, chip, each one a service | 4 | 3 | 4 | 4 | 15 |
| B | The page is the object | …are looking at a laptop screen: the bezel never leaves and the site runs on its display | 2 | 2 | 4 | 3 | 11 |
| C | Process / transformation | **…scroll a shattered screen back to life: cracks get diagnosed, rewired into copper, and the display boots** | 5 | 4 | 4 | 4 | **17** |
| D | Medium parody | …sit in a CCTV control room: every section is a camera feed with a timestamp and REC dot | 4 | 4 | 4 | 3 | 15 |
| E | Persistent character | …are watched by a dome camera that follows your cursor and lights content with its view cone | 4 | 5 | 3 | 3 | 15 |

**Pick: C.** Highest total. The before/after *is* what the shop promises, so a competitor
in another trade can't use it. Borrowed device from runner-up D (it ties A and E on total and
memorability; I chose it because it carries the CCTV half of the business): the monitor wall,
used as the hand-off after the repair. The screen you just fixed turns out to be one of nine CCTV feeds.

**Twice as bold:** *the signature move takes over the whole viewport.* The visitor's
screen is the broken screen. The first thing on the page is the glass cracking edge to edge,
not a laptop drawn inside a box.

## Director's sheet
THE SITE WHERE YOU: scroll a shattered laptop screen back to life.
WORLD / MATERIAL: glass → copper. Cracks are the only lines in the world. Repairs turn them into PCB traces, then into clean light.
HERO SIGNATURE MOVE: full-viewport procedural crack (seeded SVG, radial + ring fractures) over a giant VEDA wordmark split into displaced shards (clip-path sectors). A broken-LCD shader bleeds underneath. Pinned scrub: scan → fault labels on cracks → cracks un-draw while copper traces draw → shards realign → screen boots clean.
CONTINUITY DEVICE: the REPAIR % meter in the nav (0 → 100 tied to page progress) and the crack line itself. It returns in the footer wordmark, which you can click to crack and watch heal.
SECTION JOURNEY: 1 broken (hero) → 2 diagnosed (faults = services + prices) → 3 rewired (copper traces) → 4 booted → 5 the screen zooms out into a 3×3 CCTV wall (CCTV packages) → 6 "everything else with a plug" (IT services, big type) → 7 job card (process + contact) → close.
OPENING RITUAL: POST lines type out ("VEDA DIAG … DISPLAY: FAIL"), impact, then the glass cracks out from the point with a shake. CLOSING MOMENT: the job card stamps "READY FOR PICKUP"; giant VEDA wordmark you can crack and heal.
TYPE: Unbounded 800 (display, 18–24vw, masked/split) + IBM Plex Sans (text) / IBM Plex Mono (diagnostic labels, same family).
PALETTE: dead-glass black #0c0d0c / bone #ece5d8 / copper #d97a34 accent; PCB green #10362a is used only during the rewire state. The shift runs black → PCB green → black → bone (job card).
PERSONALITY LAYER: cursor ring that reads "INSPECT" over the glass, magnetic CTAs, velocity-skewed brand marquee, ticking CCTV timestamps, a click-to-crack toy in the footer.
VISUAL SOURCE: fragment shader (broken LCD → clean), procedural SVG cracks and traces, SVG wireframe CCTV scenes, kinetic type.

## Journey beats (hand-offs in brackets)
OPEN    0–2 s: POST text → impact → cracks race out [crack network stays as the hero]
HERO    broken screen, VEDA in shards, "Dropped it? We'll bring it back." REPAIR 0 % in nav
BUILD   pin: DIAGNOSE: a scan line sweeps, cracks get fault tags with prices [the tags sit on the cracks]
        REWIRE: cracks un-draw while copper traces draw over the same area; bg shifts to PCB green [the lines become traces]
CLIMAX  BOOT: shards snap together, LCD bleed clears, the wordmark lights up clean (end of the longest pin)
        → the clean screen scales down to become CAM 05 in a 3×3 CCTV wall [same rectangle]
RELEASE "Everything else with a plug": big quiet type list + brand marquee
CLOSE   job card (drop off → diagnose → fix → pickup) stamps READY; giant VEDA you can crack and heal

## Assumptions / placeholders (all invented)
Name kept as given. Tagline, address, phone, WhatsApp, hours, every price, counts
("11,400 devices revived"), brand list and warranty terms are placeholders.
