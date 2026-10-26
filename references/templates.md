# Templates

Fill-in sheets. Copy them into `.impresario/` in the project. For expressive work,
complete the direction and flagship prototype sheet first, implement and independently
review that functional prototype, then expand the surrounding page storyboard and copy.
Unresolved asset or fidelity questions are blockers, not blanks to disguise with polish.
For composed/app work, mark cinematic-only fields not applicable and document the
actual task behavior instead; do not invent a flagship to satisfy a sheet.

---

## 1. Direction sheet

Copy to `.impresario/direction.md`.

```markdown
# Direction — <subject>

## Concept
Idea sentence:  On this page, ____________________ becomes ____________________.
Mode:          expressive / composed / app (why: ____________________)
Competitor:     The nearest real competitor is ____________________.
                (The sentence breaks for them because ____________________.)
Live thing:     ________________________________ (picker / reader / viewer / generator / instrument)
Fallback:       With no JS, the visitor still sees ____________________.
Flagship:      ____________________ (expressive mode; useful visitor action: ____)
Reference status: observed artifact ____ / user-described only ____ / proposed ____

## Mood
Adjectives:     ____ , ____ , ____
Reference world: ________________________________

## Palette
| Role   | Hex     | Share | Notes |
|--------|---------|-------|-------|
| Ground | #_______ |  ____ |       |
| Ink    | #_______ |  ____ |       |
| Accent | #_______ |  ____ |       |
| Field  | #_______ |  ____ |       |
| Support| #_______ |  ____ |       |

Derived from the subject by: ____________________
Contrast check: body ____:1 · large ____:1 · UI ____:1

## Type
Display: ______ (role: ______ ; may: ______ ; may not: ______)
Text:    ______
Data:    text face, tabular numerals
Scale (ratio ____): __ / __ / __ / __ / __ / __
Measure: ____ch   Leading: body ____ · display ____
Weights: ____   Case: ____

## Surface
Treatment / material rule: ____________________
Applied to: ____________________
Why this shadow / glass / gradient / mesh / grid belongs here: ____________________

## Motion
Register: ____ (curves ____ , durations ____ )
Signature move: ____________________

## The one bold thing
________________________________

## Checks
[ ] A similar prompt would not produce this direction. If it would, I changed: ____
[ ] Potential tells are either removed or subject-justified: ____
[ ] The palette is derived from the subject, not from a default. ____
[ ] Required assets, provenance and promised fidelity are available; gaps: ____
[ ] Missing assets: stop / ask / approved feasibility prototype (decision: ____)
```

## 2. Storyboard sheet

Copy to `.impresario/storyboard.md`.

```markdown
# Storyboard — <subject>

Argument (one sentence): ____________________
First screen answers: ____________________

| # | Beat | Purpose | Family | Content (complete) | Move | Interaction | Scene |
|---|------|---------|--------|--------------------|------|-------------|-------|
| 1 |      |         |        |                    |      |             |       |
| 2 |      |         |        |                    |      |             |       |
| 3 |      |         |        |                    |      |             |       |

## Scenes (only where the argument needs them; no count target)
1. Flagship at beat __ — visitor action: ____________________
   Entry composition ____ / Transformation ____ / Resolution ____ / Escape ____
   Useful content or decision: ____ / Prototype review artifacts: ____
2. ...

## The live thing
Beat #: ____   Archetype: ____
Controls: ____
Fallback: ____

## The one bold thing
Beat #: ____   What it is: ____________________

## Checks
[ ] Composition changes follow the argument; repetition is useful rather than default.
[ ] Every section has a heading.
[ ] Every section has complete content, not placeholders.
[ ] No unexplained dead stretch or inaccessible hidden content.
[ ] The order is the order of the argument.
[ ] One action spanning chapters is not presented as several distinct motions.
```

## 3. Copy deck

Copy to `.impresario/copy.md`. Write the page's complete copy before surrounding-page
markup. The earlier flagship prototype uses representative real content and controls;
do not delay proving that scene until a full-site copy/layout is finished.

```markdown
# Copy — <subject>

## Nav
- ___
- ___
- [ action: ___ ]

## Beat 1 — <name>
H1: ___
Sub: ___   (one sentence, or a real sentence as a paragraph)
[buttons] ___ | ___

## Beat 2 — <name>
H2: ___
Body: ___
Body: ___

...

## Footer
Address: ___
Contact: ___
Legal: ___
Image credits: ___
```

## 4. Functional flagship prototype and choreography

Copy to `.impresario/prototype.md` before building the expressive flagship. Reuse for
supporting scenes only when useful. Describe compositions and working behavior, not a
canned list of transforms. The versioned capture manifest belongs in
`.impresario/scenes.json`; use [evidence.md](evidence.md) for its schema and commands.

```markdown
# Functional prototype — <name>

Scene id / role / selector: ____________________
Action (one action remains one across chapters): ____________________
Visitor job: inspect / choose / understand / navigate ____________________
Purpose in the argument: ____________________
Reference grammar, not copied artwork: ____________________
Reference observation status and artifact: ____________________
Optional lens(es) and subject reason: ____________________

Entry composition: ____________________
Transformation composition: ____________________
Resolution composition: ____________________
What visibly changes and why it helps the visitor: ____________________
Working controls and real content/result: ____________________
Continuation / native navigation / skip or escape: ____________________

Assets (file / kind / fidelity / provenance): ____________________
Missing assets or renderer capability: ____________________
Blocked / user-approved feasibility prototype: ____________________
Source file and anchor for the actual mechanism: ____________________

Desktop input and composition: ____________________
Phone composition and native click/pointer/key steps: ____________________
Reduced desktop / reduced phone complete state: ____________________
No-JS content and controls: ____________________
Slow-device fallback and honest fidelity label: ____________________

Capture plan: scene-local runtime bounds per viewport OR native interaction steps.
Measured scroll start/end in actual pixels (if applicable): ____________________
No global page sampling, no arbitrary-JS capture steps.
Current index / checkpoint / filmstrip / recording / replay artifacts: __________
Independent reviewer watched desktop and phone: ____________________
Critique citing those artifacts: ____________________
Verdict: pending / accepted / rejected / blocked (limitations: ____________________)
Page expansion may begin only after independent flagship acceptance.
```

## 5. Gate report

Copy to `.impresario/report.md`. Use the format in `references/quality.md` §5.

```markdown
# Gate report — <subject> — <date>

CONCEPT
  Idea sentence: ____
  Live thing: ____ (archetype: ____)
  Argument: ____

DIRECTION
  Mood: ____
  Palette: ____
  Type: ____
  Surface: ____
  Motion: ____
  Bold: ____

BEATS
  ____

SIGNATURE MOVE
  ____

PROTOTYPE
  Mode / flagship / useful action: ____
  Entry / transformation / resolution compositions: ____
  Asset gaps / approved fidelity: ____
  Source anchors / manifest: ____
  Independent prototype verdict and artifact-specific critique: ____

GATE RESULTS
  lint.mjs     FAIL ____ · WARN ____
  inspect.mjs  1440 FAIL ____ · 768 FAIL ____ · 390 FAIL ____
  scenes.mjs   manifest: ____ ; scene-local modes captured: ____ ; issues: ____
  Current index / recording / replay paths: ____
  creative-check.mjs completeness / freshness: ____
  Creative acceptance: NOT EVALUATED by checker
  Look pass 1 top three: 1. ____  2. ____  3. ____
  Look pass 2: ____
  Look pass 3: ____
  Independent final reviewer / desktop and phone artifacts watched: ____
  Verdict / evidence / limitations: ____
  After three unsuccessful iterations: rejected / blocked; next decision: ____

CONTENT AND CREDITS
  Images: ____
  Placeholders for photography: ____
  Sample content to replace: ____
  Assumptions: ____
```

## 6. One-line brief

The shortest possible brief. If you cannot write this, the brief is not understood.

```
<Subject> for <one person> — the page must make them <one verb>.
```

## 7. Independent visual review

Copy into the report for prototype and final review. The reviewer must see the actual
browser recording at desktop and phone, not merely source, phase names or the builder's
summary. The optional `.impresario/creative-review.json` record and index hash binding
are documented in [evidence.md](evidence.md); shape validation cannot establish the
reviewer's independence, honesty or visual judgment.

```markdown
# Independent review — <scene or page>

Reviewer kind: human / independent-agent
Reviewer name: ____ (not the builder)
Current capture index and hash: ____
Desktop recording / replay watched: ____
Phone recording / replay watched: ____
Checkpoint or filmstrip artifacts supporting the critique: ____
Entry -> transformation -> resolution: visible composition and useful action ____
Promised fidelity vs observed assets/material/depth: ____
Phone, reduced-motion, no-JS and escape limitations: ____
Verdict: accepted / rejected / pending
Artifact-specific critique: ____
Limitations / blocked decision / next revision: ____
```
