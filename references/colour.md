# Colour and type: get out of the default

Read this before writing the PALETTE and TYPE lines of the director's sheet.

## Why sites converge

If you're told to be "restrained" and given a `bg / ink / accent` slot, your safest
answer is the same every time: a warm off-white "paper" ground, near-black "ink", and one
vermilion, orange or amber accent. Serif display, grotesk text and mono labels go with it.
Earlier runs of this skill produced:

| Build | Ground | Ink | Accent | Rendered neutral share |
| --- | --- | --- | --- | --- |
| Portfolio (QEC researcher) | `#ECEAE3` paper | `#121212` | `#FF4D1F` | 99% |
| Veda (repair shop) | `#f7f2e8` cream | near-black | `#ff6a3d` | 90% |
| A second user's portfolio | cream | black | orange | — |
| Holloway (honey farm) | `#F3EAD3` cream | `#1F130A` | `#E8A02C` | 19% (honey fills the screen) |

None of the subjects (a decoder lattice, a broken laptop, a person) is cream and
orange. That palette came from the model, not the subject. Holloway is the only one
that holds up, because the honey *is* the colour and it takes over the viewport.

## Banned without a written subject reason

- **Paper + ink + ember:** off-white/cream/bone/sand ground, `#0–#2` black text, one
  red-orange-amber accent. Using the words "paper", "ink", "bone", "signal" or
  "syndrome orange" in your palette is a warning sign.
- **Graphite + ember/neon:** near-black ground with one orange, lime or mint accent
  (the "dev tool" or "terminal" look).
- **Violet/indigo wash**, and purple-to-blue gradients.
- **Wellness beige:** sand + sage + terracotta.
- **Neutral + one accent** as a structure. When 85%+ of the rendered pixels are grey,
  cream or black, the subject's colour is just decoration.

A real exception names the subject's own object, for example: "this archive's index
cards are literally buff stock printed in black and red". If you have one, write
`PALETTE EXCEPTION: <reason>` in `.impresario/direction.md`. The reviewer judges
whether it's real. "It feels editorial" or "it's tasteful" doesn't count.

## The procedure

### 1. Sample the subject's world (8 colours, named, no hex yet)
Picture a photograph of where the subject actually lives, at a specific time of day.
Name 8 colours you would see and where each one comes from:
`PCB solder-mask green`, `bench-lamp tungsten`, `bruised screen-backlight blue`,
`oxidised copper trace`, `anti-static bag silver-pink`. For abstract subjects (a person,
a research field, software), use the field's real instruments and places: the
cryostat's gold plating, the oscilloscope's phosphor, a lab's safety-yellow tape, the
blueprint cyan of a schematic. Neutrals count only if they're the subject's real material.

### 2. Choose a structure (not "neutral + accent" by habit)
Choose the one the subject implies and write one line on why:

| Structure | What the page looks like | Fits |
| --- | --- | --- |
| **Saturated ground** | The page *is* the subject's colour; text is a deep shade of the same hue | food, materials, brands with a colour |
| **Tonal world** | One non-neutral hue over 6–9 lightness steps; colour comes from light and depth | sea, night, lab, forest, cold metal |
| **Two-ink print** | Two strong inks overprinting (riso, screenprint, blueprint, cyanotype) | makers, music, posters, research |
| **Chapter light** | Each section is a different lit state of one place (dawn → noon → sodium night) | journeys, time, process |
| **Full-colour illustration** | Authored scene with 5–7 hues in balance | stories, kids, games, food |
| **Lit dark** | Darkness with light from the subject's own source (screen glow, embers, stage light), which is never one neon accent | night, cinema, space, hardware |
| **Neutral + accent** | Only with a PALETTE EXCEPTION | rare |

### 3. Build it in OKLCH
- Make every surface come from the step-1 hues. Tint the "black" toward the subject's
  hue (deep PCB green `oklch(0.22 0.05 165)`, not `#111`) and do the same for the light tone.
- Give it at least **two palette states** along the journey (the colour changes as the
  world does). One flat theme flip from light to dark isn't enough on its own.
- Keep contrast non-negotiable: body text 4.5:1, large text 3:1. On a saturated ground,
  use a deep or pale shade of the same hue before you reach for black or white.

### 3b. Harmony: subject-derived is necessary, not sufficient
Sampling the subject literally can give you a *list* (ten chart colours, every paint
on the shelf) instead of a *palette*. The v2 portfolio painted ten full-screen chapters
in matplotlib's tab10 (blue, orange, green, red, purple, brown, pink, grey, olive,
cyan). Every colour was "real", and the result read as a rainbow: reviewer 6.7/10.

- **At most 3 full-bleed grounds per page**, plus tints and shades of them. Other
  sampled colours go into small marks: data, links, a single object, a highlight.
- **One governing hue family carries ≥ 60% of the chromatic area.** Everything else
  is a deliberate relationship to it: analogous, a single complement, or the same
  hue at another lightness.
- **Re-tune what you sample.** Treat source colours as raw stock, not final values.
  Pull them onto a shared lightness and chroma rhythm in OKLCH (for example, all
  grounds at L 0.30 or all at L 0.92, with chroma within ±0.04 of each other) so they
  feel like one ink set. Out of the box, tab10/Material/Tailwind default colours
  are palettes for *data*, not for a *place*.
- **Squint test** on the desktop contact sheet: blur your eyes. You should be able to
  name the page's colour world in two words ("deep teal and brass"). If you need a
  list, cut it down.

### 4. Swap test
Put your palette on a law firm, a coffee brand and a SaaS dashboard. If it fits all
three, it isn't derived from the subject. Go back to step 1.

### 5. Measure what renders
After `shoot.mjs`:

```bash
node <skill>/scripts/palette-check.mjs .impresario/shots r1
```

It measures the screenshots, not the CSS. Exit 1 means you hit a default family. Fix it
and re-shoot. A pass is not a taste verdict; the reviewer still judges whether the
colour belongs to the subject.

## Type gets the same treatment

The current model defaults are **Instrument Serif, Geist / Geist Mono, Inter, Space
Grotesk, IBM Plex, JetBrains Mono, Fraunces, Playfair, DM Sans, Unbounded, Syne,
Clash Display, Satoshi, General Sans, Switzer and Gambarino**. Don't use any of them
without a written reason tied to the subject.

- Find the type in the subject's world: workshop stencils, enamel signage, railway
  timetables, equipment manuals, seed packets, dot-matrix receipts, hand lettering,
  record sleeves. Then find a face (Google Fonts / Fontshare / Velvetyne /
  Collletttivo / open-source foundries) with that character.
- Using "serif display + grotesk body + mono for labels" on every page is a house
  style, not a decision. Use mono labels only when the subject really prints data.
- **Chosen-ness check.** A face can be "from the subject" and still look like no
  choice was made: DejaVu, Arial, Helvetica, Times, Computer Modern and system-ui read
  as fallbacks. Use the subject's lettering as a *brief*, then pick a face with the
  same skeleton *and* evident character (contrast, width, terminals, a distinctive
  italic). Exception: a deliberately raw style done with conviction, e.g. a page
  that is literally a terminal.
- Write the reason on the TYPE line: `Display: X, because the shop's job cards are
  stamped in it`.
