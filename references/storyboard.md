# Storyboard

The storyboard is the page as a sequence of beats. You write it before you write markup,
because a page's shape is a decision, and it is much easier to change in prose.

For expressive work, outline the argument and flagship first, then build its
**functional prototype before the surrounding page**. Expand the full beat list only
after independent review of the actual desktop and phone recording accepts the
flagship. A prose storyboard or motion inventory is not that proof.

A beat is: **purpose** (why it exists), **composition** (how it is arranged),
**content** (the real words and images), **move** (how it animates in), **interaction**
(what the visitor can do here), and **scene** (whether it belongs to an authored
scroll, pointer, tap or keyboard sequence).

---

## 1. The order of the argument

Sections are the order of the argument, not a stock sequence. Work out what the
visitor must believe, in order, and let the sections be the steps of that belief.

Common arguments and their shapes:

- **Convince** (a service or studio): what it is -> what it costs -> proof -> how it
  works -> the offer.
- **Orient** (a place or venue): where it is -> what happens there -> what it costs ->
  how to get there -> what it looks like inside.
- **Explain** (a course, a manual, a research project): the question -> the method ->
  the findings -> the sources -> who is behind it.
- **Invite** (an event, a residency, a call for entries): the theme -> the format ->
  the deadline -> the people -> how to apply.
- **Hire** (a person or a small studio): who -> what they do -> the work -> how to
  work with them -> contact.
- **Sell** (a product): what it is -> what it does -> proof -> price -> buy.

Whatever the argument, the **first screen** answers the visitor's first question in
large type. For a person: who they are and what they do. For a product: what it is and
what it costs. For a place: where it is and what happens there.

## 2. Composition families

Each beat borrows a *family*, not a template. Use this list to notice repetitive
marketing layouts; do not force variety where a consistent task surface is better.
These are optional composition choices, not a scene or motion quota.

| Family | Shape | Best for | Watch out for |
| --- | --- | --- | --- |
| **Full-bleed statement** | One line of type across the whole viewport | The one bold thing, a thesis, a section break | Must not be tall and empty; pair with a ground-colour field |
| **Split** | Text one side, image or object the other | The work, the person, a place | The classic AI layout; vary the ratio (not always 50/50) and alternate sides |
| **Stacked list** | Rows of items, each with a title and a short body | Services, menu, works, team | Repetition may aid comparison; avoid empty repeated furniture |
| **Index / table** | Dense rows, aligned columns, tabular figures | Price lists, spec tables, catalogues, schedules | Use real alignment and tabular numerals, not dashes |
| **Grid of pieces** | Images or objects aligned or offset | Portfolios, products, exhibitions | Sizes and asymmetry should follow content; uniformity can support browsing |
| **Long read** | One column, generous measure, long-form | Stories, essays, case studies | Only if the words are real |
| **Diptych** | Two panels of equal weight side by side | Before/after, two products, two places | Avoid unless the pairing is meaningful |
| **Sticky narrative** | A sticky visual with changing text beside it | Process, timeline, how it works | Provide a deliberate phone composition, release and escape |
| **Field of colour** | A full-width color or light field carrying an idea | Signposts, one fact, a section break | Repeated stripes can flatten the argument; justify rhythm/material |
| **Hero object** | A subject object on a deliberate stage | The product, the instrument, the dish | Use fidelity-appropriate assets; generic float is not a transformation |
| **Ledger / receipt** | Ruled, receipt logic with aligned figures | The archive family, the artefact family | Monospace may fit real technical content; avoid decoration disguised as data |
| **Spatial workbench** | Subject components, tools and inspection arranged in a place | Configuration, repair, craft, portfolios | Real controls, useful selections and native DOM fallback required |

## 3. The "different composition" test

Read the beat list's composition column. If repeated splits or card grids obscure the
argument, recompose or cut them. Repetition is legitimate in app screens and comparison
flows; novelty alone is not better design.

For the expressive flagship, compare its **entry, transformation and resolution**.
They must be visibly different useful compositions in the browser, not merely different
phase names. State what the visitor inspects, chooses, understands or navigates at each
state. One connected camera journey across chapters remains one action.

## 4. Content weight

Whole content or nothing. This is the most common reason a clean page loses to a busier
one.

- A menu with three items and no descriptions is thin.
- A price with no list of what is included is thin.
- A speaker list with no talks is thin.
- A testimonial with no name and no context is thin.
- Three feature cards with generic verbs are thin.

Rules:

- Every list gets a real second line for each item.
- If you have one good piece of content, make a whole section of it.
- If a section has nothing real to say, cut it. Cutting is a legitimate design move.
- Do not fill space with lorem ipsum, with "Feature One", or with a grey placeholder
  where a photograph belongs.

## 5. Scroll scenes

A **scroll scene** is a stage driven by scroll progress. Pinning and scrubbing are
options, not requirements. A tap-stepped inspection, keyboard catalogue or physical
material interaction may be more appropriate. Serious apps need no cinematic scene.

There is **no minimum scene, motion, entity or property count**. Add scenes only where
the argument and device budget justify them. Each should:

- carry **one idea from the inventory** (the artefact, the ritual, the fact);
- preserve orientation and provide a clear continuation/escape;
- allow a quiet reading beat when the argument needs one;
- work as a static image when the scroll is not happening — the composition must be
  complete without the animation.

If you cannot name the idea a scene carries, it is decoration; cut it.

Record the actual subject selector, action, source anchors and fidelity/provenance in
the scene manifest. Scroll ranges must be measured at runtime per viewport and remain
local to the scene; phone and reduced alternatives may use native interaction steps.
See [evidence.md](evidence.md) for the manifest/capture contract and
[reference-translations.md](reference-translations.md) for optional reference grammar.

If the required assets cannot support the planned compositions, choose the strongest
code-native representation yourself and note the gap in the handoff — do not stop to ask. A flat pointer tilt cannot silently replace a
requested spatial corridor, nor CSS rectangles a character-driven comic.

## 6. Section headings

Every section has a heading, and every heading is the *argument*, not a label. "What we
do" is a label. "Your synth comes back to life" is an argument.

For ordinary marketing headings, aim for concise wrapping before shrinking type.
Expressive poster or kinetic headings may wrap differently when readable at phone
width and in the reduced-motion/no-JS version. App region headings may be plain labels.

## 7. The storyboard sheet

Use `templates.md` §2 for the fill-in format. Minimum contents:

1. Beat list with purpose + composition family + one-line content summary.
2. Which beats belong to scenes, what useful action each carries and which chapters
   continue that same action.
3. The live thing's beat and its fallback.
4. The order of the argument in one sentence.
5. The one bold thing's beat.
6. Flagship prototype source/assets, three composition descriptions, phone/static
   alternatives, actual recording artifacts and independent review verdict.
