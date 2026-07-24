# Quality-Moat Roadmap

## Objective

Build Arco into a professional SaaS for product teams that need launch-ready
motion assets from real product material.

Arco is not a generic AI video generator. It is an automated product-motion
studio: it collects the same evidence a motion designer would request, makes
structured creative decisions, lets the customer direct revisions, and delivers
a complete asset package that can be posted, handed to marketing, or archived
for rerenders.

```text
intake -> product truth -> creative direction -> animatic -> review
       -> craft QA -> delivery package -> reuse loop
```

The moat is repeatable taste, evidence-backed product storytelling, deterministic
rendering, and a workflow that saves real launch production time.

## Product Principles

- Sell finished outcomes, not AI novelty.
- Use real product screens, recordings, copy, brand, and references as evidence.
- Make the creative process visible: brief, rationale, beats, scenes, revisions,
  quality checks, and delivery assets.
- Block low-quality or unsupported output before export.
- Prefer fewer excellent workflows over broad, shallow generation.
- Optimize cost only after output quality, render reliability, and buyer value
  are protected.

## Phase 0: Foundation Already In Place

Status: implemented, verification in progress.

- [x] Replace the previous rendering engine completely.
- [x] Create `@arco/video` as the single composition owner.
- [x] Use HyperFrames for live preview and server export.
- [x] Add creative-direction, scene-role, layout, camera, depth, brand, and audio
  fields.
- [x] Embed a real variable font in preview and export.
- [x] Stage local images, logos, voice, music, and fonts into render bundles.
- [x] Add project-level creative quality checks.
- [x] Require strict HyperFrames lint and capture readiness.
- [x] Render and visually inspect a golden MP4.
- [ ] Add the golden render to continuous visual regression testing.

Exit: one schema drives identical preview and export with no fallback engine.

## Phase 1: Professional Intake And Proof Pack

Goal: make generation impossible until Arco has enough truth to create something
specific and valuable.

- [ ] Replace the generic create form with a guided launch brief.
- [ ] Require outcome, audience, channel, format, duration, CTA, launch deadline,
  and success signal.
- [ ] Accept URL, ordered screenshots, recordings, logo, brand colors, fonts,
  product copy, proof points, and references.
- [ ] Add reference handling with `use this`, `avoid this`, and `why` notes.
- [ ] Ask product-truth questions: what changed, what screen proves it, what
  customer pain matters, what claim cannot be made.
- [ ] Produce an input-completeness report before AI spend.
- [ ] Preserve user constraints as locked fields through later revisions.

Exit: Arco can tell the user what is missing, why it matters, and what quality
risk remains before it creates a draft.

## Phase 2: Creative Direction As A Paid Differentiator

Goal: turn the brief into an opinionated concept before animation starts.

- [ ] Generate 2-3 materially different directions, not cosmetic variants.
- [ ] Give each direction a core message, target viewer, visual logic, pacing,
  sound approach, and channel fit.
- [ ] Rank screens by narrative value, legibility, and claim support.
- [ ] Build beats with explicit jobs: hook, problem, proof, feature, benefit,
  objection, and CTA.
- [ ] Map every claim to supplied evidence or mark it as unsupported.
- [ ] Let users approve a direction and lock the decisions that should survive
  revisions.
- [ ] Track rationale so the system can explain why a scene exists.

Exit: users approve a coherent direction rather than accepting an opaque AI
output.

## Phase 3: Signature Motion System

Goal: make Arco output recognizably designed, not template-randomized.

- [ ] Build tested scene families for product focus, kinetic type, split stories,
  proof moments, comparison beats, feature callouts, walkthrough steps, and CTA
  lockups.
- [ ] Add continuity-aware transitions between compatible scene families.
- [ ] Create pace profiles for launch film, feature drop, walkthrough, founder
  update, and paid social ad.
- [ ] Add responsive typography fitting with safe zones, widows, line limits, and
  contrast checks.
- [ ] Add reusable 3D product stages only where depth improves comprehension.
- [ ] Add art-directed backgrounds tied to brand systems without hiding the UI.
- [ ] Define deterministic motion curves, camera grammar, and audio behavior per
  direction.

Exit: two projects with different briefs produce visibly different composition,
camera, typography, pacing, and sound while both remain controlled and premium.

## Phase 4: Review Loop That Saves Production Time

Goal: reproduce the useful part of working with a designer: precise feedback
without destroying approved work.

- [ ] Comment on a scene, timestamp, text layer, product region, CTA, voice, or
  music moment.
- [ ] Convert feedback into scoped patches instead of full storyboard rebuilds.
- [ ] Show before/after for proposed revisions.
- [ ] Support `keep this` locks for copy, timing, layout, camera, brand, claims,
  and sound.
- [ ] Maintain revision history and restore approved versions.
- [ ] Re-run only affected voice, composition, QA, and render work.
- [ ] Track the number of revisions to approval as a product metric.

Exit: a user can complete three revision rounds without losing approved
decisions or paying for unnecessary regeneration.

## Phase 5: Automated Craft QA

Goal: reject work a strong creative director would send back.

- [ ] Add screenshot-based checks for clipping, overlap, empty media, contrast,
  safe zones, and unreadable UI.
- [ ] Score typography hierarchy, density, line length, and focal clarity.
- [ ] Detect repeated layouts, transitions, camera moves, generic copy, and
  unsupported claims.
- [ ] Validate voice pace, music level, ducking, beat alignment, and loudness.
- [ ] Compare preview frames with rendered frames.
- [ ] Build a human-rated benchmark set against CapCut, Screen Studio, and a
  freelance first draft.
- [ ] Prevent release builds from regressing the benchmark without explicit
  override.

Exit: broken, generic, or unsupported videos cannot be shipped as customer-ready
deliverables.

## Phase 6: Professional Delivery Desk

Goal: hand back everything a customer expects from a production vendor, not just
one MP4.

- [ ] Master 1080p and 4K exports.
- [ ] Generate 16:9, 1:1, and 9:16 adaptations with reviewed reframing.
- [ ] Deliver poster frame, subtitles, transcript, copy sheet, version notes, and
  usage-rights summary.
- [ ] Include an editable Arco Project and source-asset manifest.
- [ ] Record font, music, voice, screen, logo, and reference provenance.
- [ ] Provide deterministic rerenders from an approved project version.
- [ ] Package assets with clear names for website hero, social feed, social
  story, Product Hunt, sales email, and launch announcement use cases.

Exit: customers receive an organized launch asset package that replaces a small
freelancer handoff.

## Phase 7: Revenue Loops And Expansion

Goal: turn one successful launch video into repeat usage and higher-value plans.

- [ ] Add project cloning for feature drops and launch variants.
- [ ] Add reusable brand/project memory for approved voice, claims, pacing, and
  visual constraints.
- [ ] Add campaign packs: hero video, social cutdowns, GIF snippets, poster, and
  copy variants.
- [ ] Add team review only after single-player review is working.
- [ ] Add agency workflows only after repeatable self-serve quality is proven.
- [ ] Package higher tiers around production value: formats, 4K, campaign packs,
  brand systems, seats, and volume.

Exit: retention is driven by recurring product launches, feature releases, and
campaign repurposing, not curiosity about AI.

## Quality Metrics

Track:

- First export success rate.
- Time from proof pack complete to approved export.
- Human preference against current output, CapCut, Screen Studio, and freelance
  first draft.
- Percentage of first drafts accepted for revision instead of discarded.
- Revision rounds to approval.
- Scene-level quality-gate failure rate.
- Preview/export visual parity.
- Render success rate and median render time.
- Generic-copy, repeated-layout, clipping, unsupported-claim, and missing-media
  regressions.
- Cost per approved deliverable, only after quality metrics hold.
- Second project within 60 days.

## Commercial Gates

Do not scale acquisition until:

- A cold user can finish a screenshot-first export in under 10 minutes.
- At least 5 beta users export videos they would publicly post.
- The golden path succeeds on staging without developer help.
- The quality benchmark beats CapCut static assembly in a 5-second comparison.
- Pricing is attached to delivered value: approved projects, delivery packages,
  formats, brand systems, and campaign reuse.

## Not Now

- Prompt-only generative video.
- Fake UI, hallucinated dashboards, generated metrics, or invented customers.
- Cheap AI-minute pricing.
- General video editing for creators.
- Marketplace, teams, or agency administration before single-player quality is
  proven.
- Full After Effects replacement.
- Computer-vision click detection as a standalone feature.
