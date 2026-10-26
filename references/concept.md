# Concept

The concept is what the page is *about*. It is decided before colour, type or layout,
because it is the thing that decides them.

Most generic pages have no concept. They have a topic. A topic is a noun ("a coffee
shop"); a concept is a sentence with an opinion in it ("the seven doors of this street
become a map of a morning walk").

---

## 1. The subject inventory

Fill every slot with real, checkable material. If a slot is empty, keep asking
questions — each one narrows the design space.

| Slot | Question | Example (subject: a workshop restoring 1970s Japanese synthesizers) |
| --- | --- | --- |
| **Output** | What does it produce? Can the real output appear on the page? | A restored instrument, playable, with a photo of the actual board |
| **Object / shape** | What does it look like in silhouette or cross-section? | A wooden case, a row of sliders, a pitch-bend lever, a patch cable |
| **Name** | How could the letters behave? | The name in condensed type, or the letters set as a frequency readout |
| **Place** | Which view is worth being there for? | The bench at dusk, the shopfront on a rainy street |
| **Ritual** | What sequence does it perform? | Power on -> patch -> tweak -> play -> record -> switch off |
| **Artefact** | What printed object already exists in this world? | A service manual, a patch sheet, a price tag, a flight case label |
| **Opposite** | Which category owns the feeling this one lacks? | Not a sleek SaaS dashboard; a workbench, a lab, an archive |
| **One real fact** | A number, a date, a place, a material, a rule | Cells are tested at 1.1x rated voltage; the shop has been on this corner since 1974 |

Rules for filling the inventory:

- **Concrete beats abstract.** "Hand-thrown stoneware, fired at 1280C, unglazed foot so
  it rings on a table" beats "earthy and organic" every time.
- **One real fact is enough.** It is the detail a visitor could not have guessed, and it
  is usually the most quotable line on the page.
- **The opposite is a design constraint.** "Not a dashboard" rules out metric cards,
  gauge tiles and a sidebar before you write any code.
- **If you cannot fill two slots, you do not know the subject yet.** Research the
  category or invent a specific, plausible subject and state the assumption — do not ask.

---

## 2. From inventory to idea

### The idea sentence

> On this page, **[material from the subject]** becomes **[the device]**.

- **Material**: one of the inventory slots, made specific.
- **Device**: the thing that carries it — a map, an instrument, an index, a timeline, a
  specimen sheet, a working tool, a single long take, a printed artefact, a table.

Examples:

- "The seven shopfronts on this street become a scrollable map of a shopping morning."
- "The service manual's diagram becomes a working patch panel."
- "The flight case label becomes the frame around every photograph."
- "The pitch-bend lever becomes the scrubber for the whole page."

### The competitor test

Name the nearest real competitor — not the category leader, the one down the road. Put
it in the sentence. If the sentence still reads true for them, the idea is a category
idea, not yours. Iterate until the competitor breaks it.

Weak: "On this page, the coffee becomes a warm minimal landing page." (True of every
coffee shop on earth.)
Strong: "On this page, the seven doors of this street become a map of a morning walk."
(Only true of this one, because of the seven doors.)

### Four ways an idea usually hides

1. **In the constraint.** "Only one room, one camera, one hour" -> the page is one long
   take; there is nothing else to show, so you do not fake a section.
2. **In the artefact.** Real-world printed objects are already designed; copying their
   logic beats inventing a look.
3. **In the name.** A name can be split, stacked, drawn, or set in the shape of the
   thing. Explore 3-5 wordmark treatments before choosing.
4. **In the fact.** One specific number, date or material can be the organising
   principle — a timeline built from dates, a chart built from real measurements, a
   counter that counts the real thing.

### Three ways to escape the average idea

- **Substitution** — swap the obvious device for a physical one. Not a "timeline widget",
  a strip of punched holes. Not a "stat card", a receipt line.
- **Exaggeration** — take one honest property of the subject and make it the whole
  visual system. The workshop is *restoration*: everything is shown repaired, patched,
  annotated.
- **Inversion** — flip the expectation. The gallery page is the studio's *storeroom*.
  The law firm's site is the *case files*. The restaurant site is the *receipt*.

---

## 3. The live thing

One thing on the page that is alive: the visitor acts, or the page changes by itself.
It is the difference between a poster and a room.

**Five archetypes** — pick one:

| Archetype | What the visitor does | Example |
| --- | --- | --- |
| **Picker** | Chooses one option and sees it applied | Choose a wood, see the chair in it |
| **Reader** | Types something and sees it set/measured | Type your name, see it in the foundry's letters |
| **Viewer** | Sees something real change | Is the stove lit now? Time to the last ferry |
| **Generator** | Produces an artefact they keep | Build a pattern, get a printable file |
| **Instrument** | Plays with a continuous input | Scrub the tape, hear the loop |

**Requirements:**

- Built from the subject's real content, not filler.
- Works with a thumb on a phone, in the first 320 px of width.
- Has a plain fallback: with JavaScript off or slow, the page still works and still
  shows the result of a sensible default.
- Never blocks reading or the primary task. Integrate controls and content with the
  scene when that makes inspection, choice or navigation more useful.
- Choose a coherent visitor job, not an interaction quota. Related controls can be
  chapters of the same experience; isolated widgets are not automatically creative.

**Where it goes:** where the visitor's task and scene composition need it. For expressive
work, expose the primary action in the entry scene rather than hiding the useful
experience after a static page. There is no mandatory standalone section or late placement.

---

## 4. Concept families

These are archetypes of *page concept*, not templates of layout. Pick one and make it
yours; if two apply, pick the more unusual one.

1. **The instrument** — the page is a working tool. Everything else is a manual.
2. **The archive** — a catalogue, a ledger, a card index. Order and metadata are the design.
3. **The map** — the page is a place; sections are coordinates.
4. **The manual** — the page explains how to do or make something; diagrams carry it.
5. **The field note** — first-person observations, dated, annotated, unpolished.
6. **The stage** — the page is a performance; one act at a time, a curtain between.
7. **The dispatch** — newsroom, bulletin, issue, dated edition.
8. **The specimen** — one subject, examined from several sides, pinned and labelled.

Do not default to "archive" for every shop or "map" for every place. The concept
family must come from the inventory.
