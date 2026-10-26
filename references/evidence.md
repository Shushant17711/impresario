# Scene evidence protocol

Evidence completeness is objective. Cinematic quality, useful spectacle and truthful
fidelity require independent viewing. The scripts do **not** automate that judgment.

## 1. Files and command order

From the website project root, keep:

- `.impresario/prototype.md`: the proposed flagship, actual states, visitor benefit,
  assets, input/state mapping, phone/fallback compositions and review plan.
- `.impresario/scenes.json`: the scene manifest below.
- `.impresario/scenes/index.json`: source/asset/manifest-bound capture index.
- `.impresario/creative-review.json`: the independent visual verdict, when available.
- `.impresario/report.md`: correctness results, creative status and limitations.

```bash
node <skill>/scripts/scenes.mjs http://localhost:3000 --record
node <skill>/scripts/creative-check.mjs .
```

Capture the **prototype** first. Expand the surrounding site only after its independent
creative review succeeds. Re-capture and re-review the complete site after integration.
Source changes invalidate old captures even when a report's timestamp is newer.

## 2. Manifest v1

Example shape, not a ready-made proof: replace selectors, local source anchors, actual
scroll bounds, composition descriptions and assets with the implementation's values.

```json
{
  "version": 1,
  "mode": "expressive",
  "scenes": [{
    "id": "workstation-inspection",
    "role": "flagship",
    "selector": "#workstation-stage",
    "action": "Explode the workstation and inspect compatible components",
    "purpose": "Choose hardware for an actual workload",
    "source": [{
      "file": "src/workstation.js",
      "anchor": "createWorkstationTimeline"
    }],
    "assets": [{
      "file": "public/workstation.glb",
      "kind": "articulated 3D model",
      "fidelity": "authored studio render, movable side panel and component meshes",
      "provenance": "project-owned asset; creator and licence recorded in assets.md"
    }],
    "compositions": {
      "entry": "Closed tower occupies the workbench; workload controls are readable",
      "transformation": "Camera faces open chassis; separated components become labelled inspection targets",
      "resolution": "Chosen configuration occupies one side; compatibility and price evidence occupy the other"
    },
    "viewports": {
      "desktop": {
        "range": {"start": 500, "end": 1900},
        "checkpoints": [0, 0.25, 0.5, 0.75, 1]
      },
      "phone": {
        "steps": [
          {"label": "closed", "state": "entry"},
          {"label": "inspect components", "state": "transformation", "click": "#inspect-components"},
          {"label": "choose configuration", "state": "resolution", "click": "#choose-configuration"}
        ]
      },
      "reduced": {"steps": [{"label": "all components, choices and compatibility evidence in normal flow"}]},
      "reduced-phone": {"steps": [{"label": "static portrait inspection and configuration controls"}]}
    }
  }]
}
```

### Fields and limits

- `mode`: `expressive`, `composed` or `app`. Choose from the brief; do not switch a
  cinematic brief to `app` to bypass evidence. Composed/app work may have no scenes;
  its real task/interaction checks remain necessary.
- `id`: unique lowercase letters/digits/hyphens. `role`: `flagship` or `support`.
  Expressive work needs a flagship. There is no minimum number of motions or scenes.
  Giving one action multiple IDs does not make it multiple creative ideas.
- `selector`: exactly one live stage element, visible at its declared checkpoints.
- `source`: local file and exact anchor identifying the relevant implementation.
  The checker verifies existence only. A matching comment/symbol does not prove a
  mechanism; the builder and visual reviewer still inspect the real state mapping.
- `assets`: local files with kind, fidelity and provenance. Use an empty array for
  genuinely procedural/data/typographic scenes, with their implementation in `source`.
  Copy permitted media locally; the scripts cannot verify licences or realism. Never
  label placeholders as finished art or an unarticulated model as animated geometry.
- `compositions`: specific entry, transformation and resolution descriptions. The
  checker validates presence, not whether the views actually differ.
- `viewports`: desktop 1440×900, phone 390×844, reduced desktop, and reduced phone.
  All four are required for every declared expressive scene.

### Scroll ranges

`range.start/end` are absolute document scroll positions in CSS pixels, taken from the
actual timeline/runtime **at that viewport after assets/fonts load**. For ScrollTrigger,
inspect the relevant instance's calculated `start` and `end`, not its textual config.
For sticky scenes, measure the spacer's actual scroll interval. End must exceed start
and both must be reachable. Do not reuse desktop bounds on mobile without measuring.

Checkpoints are increasing normalized values from 0 to 1, including an interior
transformation state. These are sampling requirements, **not creativity thresholds**.
Add extra values at the actual important instants: a camera flip, object handoff, ink
wipe, information reveal or release. A transient missed between samples still requires
recording and another checkpoint. If a pinned stage leaves the viewport at the exact
end, target the relevant visible release boundary and capture the following ordinary
section separately in the correctness/look pass.

### Non-scroll inputs and mobile alternatives

`steps` execute in order after loading the page and bringing the stage into view:

- `{ "label": "entry" }`: observe the state without input.
- `{ "label": "inspect", "click": "#inspect" }`: native mouse click or phone touch.
- `{ "label": "light response", "pointer": { "selector": "#material", "x": 0.8, "y": 0.3 } }`:
  native pointer move at normalized element coordinates. Not a substitute for touch.
- `{ "label": "keyboard choice", "key": "ArrowRight" }`: native key input. Supported
  keys: arrows, Enter, Tab, Escape and space. Include focus steps before keyboard use.

Use one action per step. Action targets must be unique, visible and unobscured; a
synthetic DOM `.click()` cannot substitute for testing usable controls. Arbitrary
JavaScript is not accepted in manifests. Drag paths and complex gestures are outside
v1: capture them separately with a browser recorder and document the limitation. Do
not claim a click sequence verifies a drag-only interaction.

Normal-motion **expressive** steps must explicitly cover `state: "entry"`,
`state: "transformation"` and `state: "resolution"` in that order. Additional focus,
inspection or exit steps may be unlabelled by state. This is composition coverage,
not three-motion credit: a single journey can need many evidence samples. Repeating
the same view with those labels still fails independent creative review. Reduced-motion
steps may show a single complete reading/inspection state; app/composed steps cover
their actual task without a compulsory cinematic triplet.

### Settling and declarative readiness

The default checkpoint settling delay is 400ms. It cannot establish that a long scrub,
asset swap or asynchronous choice has resolved. Declare the actual required delay
or a bounded DOM readiness signal in the viewport configuration or individual step:

```json
{
  "label": "configuration resolved",
  "state": "resolution",
  "click": "#choose-configuration",
  "settleMs": 600,
  "ready": {"selector": "#workstation-stage", "attribute": "data-state", "equals": "resolved"},
  "timeoutMs": 8000
}
```

`settleMs` is an integer 0–15000; `timeoutMs` is 100–20000 (default 8000).
Readiness requires exactly one matching element and exact attribute equality, with
no arbitrary JavaScript. Capture fails on timeout. Runtime state should describe the
actual resolved scene, not a flag set before the animation finishes. The independent
reviewer verifies what the images actually show; a ready flag is not quality evidence.

For scroll captures, an optional `waits` array aligns one wait object per checkpoint:
`"waits": [{}, {}, {"settleMs": 1800}]` for three checkpoints. Per-step/checkpoint values
override viewport defaults. Add a readiness signal at the final camera/asset/content
state where needed rather than cropping the recording before resolution. Recording
starts before navigation, so first-load motion is included as well as the local sweep.

Reduced-motion steps should show the complete static/instant equivalent and exercise
essential choices without travel. No forced autoplay, parallax or scrub there.
`checkpoints` and `waits` apply only to scroll `range` captures; they cannot accompany
interactive `steps`. Every declared recording and its nested frame artifacts are
validated, even when the composed/app brief does not require a recording.

## 3. Capture outputs

`scenes.mjs --record` captures actual browser screencast frames during the scene-local
scroll sweep or input steps, then writes:

- named checkpoint PNGs and a filmstrip in collision-safe scene/viewport paths;
- normal-motion recording PNGs, a timestamped recording JSON and a replay HTML;
- `index.json`, with SHA-256 hashes of current source/media inputs, manifest and artifacts;
- `run.json`, binding the latest capture attempt to its completed index. Failed or
  interrupted attempts cannot fall back to an older successful index.

The replay is **sampled browser evidence**, not a smooth encoded video, an FPS benchmark,
or certification of hardware WebGL/WebGPU behavior. It is not a tween synthesized from
two screenshots. Open it from a local file/server and click Replay. Review the actual
checkpoint PNGs at full size too. A frame stream may miss brief events; use denser
checkpoints or a real browser video recording for those events.

Image/data inputs are hashed, including local JSON, YAML, CSV, TSV and TXT. Explicitly
include unusual rendering dependencies in `source` or `assets`; remote data, live server
state and environment changes cannot be fingerprinted by this local scan and must be
recorded in the report and re-reviewed. All declared replay files are hash-validated.

`--frames N` changes recording sweep density, not acceptance inventory. `--scenes`
selects viewport subsets for diagnosis; a partial index cannot pass full expressive
evidence validation. `--out` and `--manifest` permit diagnostic locations, but the
checker reads the canonical `.impresario/scenes.json` and `.impresario/scenes/index.json`.
For acceptance, run with those defaults. Failed capture never creates a new accepted
index; old artifacts are historical, not fallback proof.

The browser navigates the supplied URL and may load its resources. No packages are
installed. The capture does not globally disable GPU rendering; headless/software
differences still require real-device testing for demanding optical/spatial scenes.

## 4. Independent creative review

Give a human or a separate agent the brief, reference grammar, actual checkpoint PNGs
and desktop/phone replay. Do not give your success verdict as evidence. The reviewer
must actually view the artifacts; reading source or your report is insufficient.

Evaluate **all** of:

1. **Composition transformation:** distinct entry, transformation and resolution,
   not the same picture slightly tilted; larger but meaningless motion also fails.
2. **Visitor benefit:** concrete inspection, choice, explanation, navigation or
   narrative consequence integrated with the subject action.
3. **Reference-level invention:** convincing camera/depth/material/continuity/input
   appropriate to the chosen grammar—not every reference effect on one page.
4. **Asset honesty:** demonstrated detail, articulation, perspective and optical
   behavior match the claim. A stylized SVG can succeed as stylized illustration.
5. **Mobile and escape:** intentional touch composition, readable content, keyboard
   equivalent, reduced states and normal-flow escape.

There is no summed score where strong contrast offsets failed spectacle. Every
dimension matters. State **accepted**, **rejected** or **pending**, with artifact-specific
reasons, most important revisions and limitations. Missing viewing capability means
pending; unsuccessful revisions after three rounds mean blocked/rejected, not accepted.

Optional machine-readable review record:

```json
{
  "verdict": "rejected",
  "reviewer": {"kind": "independent-agent", "name": "separate visual-review session ID"},
  "captureHash": "SHA-256 of the exact current scenes/index.json bytes",
  "evidence": "workstation-inspection-desktop-001.png still has the entry layout; phone replay shows useful inspection but no distinct resolution. Reviewer actually watched both recordings.",
  "limitations": "Headless capture reviewed; physical phone/GPU behavior not yet tested."
}
```

Reviewer kind is `human` or `independent-agent`, never `builder`. Provide an actual
identity/session and disclose inability to view media. The checker can validate shape
and hash binding, **not** identity, independence, truthfulness or visual merit. It always
prints `Creative acceptance: NOT EVALUATED`, even if a valid review records acceptance.
The agent/user must evaluate the recorded verdict separately; a rejected review remains
a blocked creative gate even when the evidence-consistency command exits zero.

## 5. What regression tests prove

`node --test tests/*.test.mjs` checks missing projects, keyword spoofing, stale source,
missing mobile/recording artifacts, current hashes, bad ranges/options, contextual
styles and a real local-browser mechanics fixture. The fixture's boxes are intentionally
**not** a cinematic example. Tests prove tool behavior, not that future generated sites
meet the creative brief. Pressure evaluations likewise test instruction compliance;
judge resulting websites with the independent visual gate before claiming improvement.
