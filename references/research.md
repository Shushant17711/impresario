# Research ledger

This is a practical map, not a claim that every UI resource on the internet has been
catalogued. Re-check versions, licences, and APIs before adding a dependency.

## Design intelligence and critique

| Resource | Use in the workflow | Boundary |
| --- | --- | --- |
| [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | system-first tokens, style/industry matching, typography and UX heuristics | strong catalogue; can still produce a polished template without a subject concept |
| [Impeccable](https://impeccable.style) / polish | audit, critique, distill, typography, spacing and anti-slop checks | polish is not art direction or motion choreography |
| [TasteSkill](https://www.tasteskill.dev/) | anti-generic taste prompts and redesign dials | taste rules need a concrete brief and visual QA |
| Claude marketplace Impeccable polish | reusable command vocabulary for an agent | inspect the installed version and licence before copying |
| Aura design systems | tokens, component contracts, consistency | a design system is not a creative direction |
| Vercel, Linear, Refactoring UI guidance | hierarchy, density, interaction clarity, system thinking | optimize for product clarity, not every marketing page |
| Karpathy-style engineering heuristics | small loops, grounded decisions, feedback and simple primitives | not a maintained UI library; do not imply an official “Karpathy UI skill” |

## Component and interaction references

| Resource | Best contribution | Watch for |
| --- | --- | --- |
| [React Bits](https://reactbits.dev/) | copyable React mechanisms: galleries, text, cursor, tilt, counters | restyle and recompose; inspect mobile and keyboard behaviour |
| [Dome Gallery](https://reactbits.dev/components/dome-gallery) | spatial image browsing and a strong example of a prop becoming a scene | 3D interaction needs a normal list/lightbox fallback |
| [Aceternity UI](https://ui.aceternity.com/) | beams, spotlights, grids and striking React/Tailwind mechanisms | dark neon defaults and demo composition are easy tells |
| [Skiper UI](https://skiper-ui.com/) | creative React/Tailwind sections and interaction references | verify source, dependencies, licence and accessibility per component |
| shadcn/ui + Radix | accessible behaviour primitives copied into project ownership | do not mistake primitive defaults for a visual identity |
| Lucide / Phosphor | consistent icon language | icons do not substitute for imagery or a concept |

## Motion and rendering

| Resource | Use | Rule |
| --- | --- | --- |
| [GSAP](https://gsap.com/) + ScrollTrigger | pinned scenes, timelines, SVG and scrub choreography | one owner per property; gate reduced motion and refresh on resize |
| [Motion](https://motion.dev/) | React state, layout, gesture, enter/exit | prefer over GSAP when there is no scroll timeline |
| [Lenis](https://github.com/darkroomengineering/lenis) | optional interpolation for a scroll-led page | never hijack wheel input; disable for reduced motion |
| CSS / Web Animations API | defaults, feedback, entrances and small bundles | default choice before a library |
| Three.js / OGL | meaningful spatial scenes, product viewers, generative worlds | GPU budget, keyboard fallback, poster/DOM equivalent |
| tsParticles | a subject-justified field | cap particle count and preserve text contrast |
| Lottie / Rive | authored vector characters, icons, and product states | keep semantic content outside the canvas/SVG |
| Anime.js | lightweight vanilla timelines | use when GSAP's orchestration is unnecessary |
| Theatre.js | visual timeline authoring for bespoke scenes | authoring convenience does not solve accessibility |
| Barba.js | page-to-page transitions | preserve URLs, focus, back button and non-animated navigation |

## Inspiration and motion grammar

| Resource | Inspect for | Do not do |
| --- | --- | --- |
| [Awwwards](https://www.awwwards.com/) | pacing, composition, unusual navigation, art direction | copy a winning layout as a template |
| [Landing Love](https://www.landing.love/) | landing-page sequencing and visual density | assume a gallery example is usable on mobile |
| [Prompt Motion](https://prompt-motion.com/) | camera movement, choreography, timing and promptable grammar | reproduce creator-owned imagery or brand work |
| [AnimMasterLib](https://animmasterlib.dev/) | animation recipes and implementation vocabulary | add effects without a narrative job |
| [Emil Kowalski](https://emilkowal.ski/) | micro-interaction principles, easing, feedback and restraint | use tiny interactions as a substitute for a signature scene |
| [Vengence UI](https://www.vengenceui.com/) | expressive UI patterns and visual references | verify code quality and licence before shipping |
| [Aura](https://www.aura.build/design-systems) | system and token inspiration | avoid importing its visual identity wholesale |

## Research synthesis

The strongest creative-web demonstrations repeatedly use a small set of transferable
ideas: scroll becomes a timeline; scenes gain intentional 2.5D depth; browsing becomes
a spatial instrument; a screen or interface is staged inside a physical world; material
has responsive behaviour; an ordinary scene becomes uncanny; and a visitor controls a
legible reveal. These ideas are now encoded as four paradigms and scene recipes in
`creative-system.md` rather than as copied examples or URL-specific rules.

When a user supplies a video or reel, an authorized retrieval tool may be used during
research to observe its motion grammar. Do not make that tool a runtime dependency of
the website, do not store source media in the skill, and do not copy protected artwork,
branding, or exact choreography. Convert the observation into one of the paradigms or
scene recipes, then re-invent the prop, content, timing, and interaction for the current
brief. If access fails, say so and continue from the available description.

## Research conclusion

The strongest combined workflow is:

1. ui-ux-pro-max or a token system for completeness;
2. Impeccable/TasteSkill-style critique for anti-slop checks;
3. this skill's subject metaphor and storyboard for originality;
4. CSS plus Motion or GSAP for implementation;
5. React Bits, Aceternity, Skiper, Rive, Three.js, or particles only as selective
   mechanics;
6. browser screenshots, reduced-motion, keyboard, mobile and performance gates.

No existing resource reliably performs all six steps. That missing synthesis is why this
skill requires a creative preflight and a pattern-selection step rather than merely
listing more components.
