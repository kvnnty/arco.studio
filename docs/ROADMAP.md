# Quality-Moat Roadmap

## Objective

Automate the complete motion-designer engagement for product owners:

```text
intake -> creative brief -> direction -> storyboard -> designed draft
       -> review -> revision -> quality control -> delivery
```

The moat is repeatable taste and control. Arco should make premium decisions
from real product material, expose those decisions for review, and compile them
through a deterministic production system.

## Phase 0: Rendering Foundation

Status: implemented, verification in progress.

- [x] Replace the previous rendering engine completely.
- [x] Create `@arco/video` as the single composition owner.
- [x] Use HyperFrames for live preview and server export.
- [x] Add creative-direction, scene-role, layout, camera, and depth fields.
- [x] Embed a real variable font in preview and export.
- [x] Stage local images, logos, voice, and music into render bundles.
- [x] Add project-level creative quality checks.
- [x] Require strict HyperFrames lint and capture readiness.
- [x] Render and visually inspect a golden MP4.
- [ ] Add the golden render to continuous visual regression testing.

Exit: one schema drives identical preview and export with no fallback engine.

## Phase 1: Professional Intake

Goal: collect what a senior designer would request before opening design tools.

- [ ] Replace the generic create form with a structured motion brief.
- [ ] Require objective, audience, channel, CTA, duration, and deadline.
- [ ] Accept URL, ordered screenshots, recording, logo, fonts, and brand tokens.
- [ ] Capture reference links with "use this" and "avoid this" annotations.
- [ ] Ask feature priority and product-truth questions, not only tone adjectives.
- [ ] Show an input-completeness report before generation.
- [ ] Preserve user constraints as locked fields through every revision.

Exit: Arco can explain what is missing and why it matters before spending AI or
rendering budget.

## Phase 2: Creative Director

Goal: turn the brief into a deliberate concept before animating.

- [ ] Produce 2-3 materially different directions, not cosmetic variants.
- [ ] Give each direction a core message, visual logic, pace, and sound approach.
- [ ] Rank product screens by narrative value and legibility.
- [ ] Build beats with explicit jobs: hook, problem, proof, feature, benefit, CTA.
- [ ] Map every claim to supplied evidence.
- [ ] Let the user approve a direction and lock selected decisions.
- [ ] Track rationale so later refinement does not erase the concept.

Exit: users choose a coherent direction rather than accepting one opaque result.

## Phase 3: Motion System Depth

Goal: expand visual range without giving the model unsafe production freedom.

- [ ] Build tested families for kinetic type, product focus, split stories,
  proof moments, comparisons, feature callouts, and CTA lockups.
- [ ] Add reusable 3D product stages using Three.js/WebGL where depth adds value.
- [ ] Introduce continuity-aware transitions between compatible scene families.
- [ ] Add responsive typography fitting with widows, safe zones, and line limits.
- [ ] Add art-directed backgrounds and illustration slots tied to brand systems.
- [ ] Create pace profiles for launch film, feature drop, walkthrough, and ad.
- [ ] Add deterministic motion curves and camera grammar per direction.

Exit: two projects with different directions have visibly different composition,
camera, typography, and pacing, while both remain art-directed.

## Phase 4: Review And Revision

Goal: reproduce the useful feedback loop between client and designer.

- [ ] Comment on a scene, timestamp, text layer, product region, or audio moment.
- [ ] Convert feedback into a scoped patch, never an automatic full rebuild.
- [ ] Show before/after for each proposed revision.
- [ ] Support "keep this" locks for copy, timing, layout, camera, and sound.
- [ ] Maintain revision history and restore approved versions.
- [ ] Re-run only affected voice, composition, and render work.

Exit: a user can direct the work through three revision rounds without losing
approved decisions or paying for unnecessary regeneration.

## Phase 5: Automated Craft Review

Goal: reject work a strong creative director would send back.

- [ ] Add screenshot-based checks for clipping, overlap, empty media, and contrast.
- [ ] Score typography hierarchy, line length, density, and safe-zone compliance.
- [ ] Detect repeated layouts, transitions, camera moves, and generic phrasing.
- [ ] Check claim-to-screen relevance and product-screen readability.
- [ ] Validate VO pace, music level, beat alignment, and loudness.
- [ ] Compare preview frames with rendered frames.
- [ ] Build a human-rated benchmark set and track quality by release.

Exit: release builds cannot regress the benchmark without an explicit override.

## Phase 6: Delivery Desk

Goal: hand back everything a customer would expect from a professional project.

- [ ] Master 1080p and 4K exports.
- [ ] Generate 16:9, 1:1, and 9:16 adaptations with reviewed reframing.
- [ ] Deliver poster frame, subtitles, transcript, copy sheet, and version notes.
- [ ] Include an editable Arco Project and a source-asset manifest.
- [ ] Record font, music, voice, and usage-rights provenance.
- [ ] Provide deterministic rerenders from an approved project version.

Exit: the customer receives a complete, organized delivery package rather than
an isolated MP4.

## Quality Metrics

Track:

- Human preference against current output and named competitors.
- Percentage of first drafts accepted for revision instead of discarded.
- Revision rounds to approval.
- Scene-level quality-gate failure rate.
- Preview/export visual parity.
- Render success rate and median render time.
- Generic-copy, repeated-layout, clipping, and missing-media regressions.
- Cost per approved deliverable, only after the quality metrics hold.

## Not Now

- Computer-vision click detection as a standalone feature.
- Prompt-only generative product UI.
- A full After Effects replacement.
- Marketplace, teams, or enterprise administration.
- Optimizing model spend before the benchmark and quality gates exist.
