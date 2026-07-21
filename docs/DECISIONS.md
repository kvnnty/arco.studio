# Product And Technical Decisions

These decisions define Arco's product. Change them deliberately, not as a side
effect of implementing a feature.

## Category

| Decision | Locked choice |
|----------|---------------|
| Product | AI motion-design studio for product owners |
| Promise | Launch-ready motion asset packages through a guided, editable workflow |
| Primary input | Brief, URL, 3-10 real screens, brand assets, and references |
| Secondary input | Screen recording for guided product walkthroughs |
| Primary output | Editable Arco Project plus mastered video deliverables and handoff assets |
| Not the product | Prompt-only generative video, stock-footage ads, or a general video editor |
| Quality bar | Designed, legible, brand-faithful, and launch-ready |

## User And App Handoff

The user gives Arco:

- Objective, audience, channel, format, deadline, and call to action.
- Product URL, real screenshots or recording, and feature priorities.
- Logo, colors, typography, tone, approved copy, and legal constraints.
- Examples to emulate, examples to avoid, and feedback during review.
- Voice, music, caption, language, and delivery requirements.

Arco gives the user:

- A normalized creative brief and a list of missing inputs.
- Creative direction: message, tone, visual system, pace, and quality notes.
- Story beats with purpose, timing, copy, visual source, layout, and motion.
- A live draft that can be reviewed by scene and revised without regeneration.
- A quality report that blocks broken or generic work.
- Final MP4 variants, poster frame, subtitles, transcript, copy sheet, usage
  notes, source manifest, and editable project.

## AI

AI may:

- Analyze the product, audience, brand, references, and supplied screens.
- Propose the narrative, scene roles, copy, motion intent, and camera intent.
- Refine a selected scene or direction from explicit user feedback.
- Produce voice scripts and drive approved voice generation.

AI may not:

- Invent product UI or replace supplied screenshots with imaginary interfaces.
- Invent customers, metrics, integrations, certifications, screenshots, or
  product claims that are not supported by the supplied proof pack.
- Write arbitrary production HTML, CSS, or JavaScript.
- bypass schema validation, quality gates, or user-approved constraints.
- Decide that a render succeeded when media, fonts, or audio failed to load.

The model returns structured creative intent. Arco's compiler converts that
intent into tested motion systems.

## Rendering

| Concern | Choice |
|---------|--------|
| Composition engine | HyperFrames 0.7.64, pinned |
| Ownership | `@arco/video` owns composition and quality logic |
| Preview | Official `@hyperframes/player` custom element |
| Export | Strict HyperFrames preflight and high-quality MP4 render |
| Typography | Bundled Figtree variable font, never machine-dependent |
| Assets | Referenced local assets are staged beside each composition |
| Failure policy | No best-effort customer exports |
| Motion model | Curated scene systems plus bounded parameters |

Quality outranks developer convenience. Engine changes are justified only by a
measurable improvement in output, control, reliability, or iteration speed.

## Visual Direction

- Real product UI remains the visual evidence.
- One clear communication job per beat.
- Every claim must be supported by supplied product material or approved copy.
- Typography hierarchy is authored by the system, not improvised per prompt.
- Camera movement supports attention and depth; it is never constant decoration.
- Transitions connect ideas and preserve continuity.
- Presets are coherent art directions, not color swaps.
- Brand application must survive preview and export identically.

## Delivery Quality

- Customer exports must be named and organized by use case, such as hero, feed,
  story, square, poster, transcript, and source manifest.
- Each approved project should be rerenderable from deterministic source data.
- Handoff assets must include usage-rights notes for music, voice, fonts, logos,
  screenshots, and custom uploads.
- A failed, incomplete, or rights-unclear asset package is not a professional
  deliverable.

## Audio

- Voice and music are separate tracks.
- Music ducks under voice by default.
- Library music must have documented commercial rights.
- Custom uploads require the user to confirm usage rights.
- Missing audio must fail clearly rather than silently changing the deliverable.

## Scope

Current:

- SaaS, web-app, developer-tool, and mobile-product launch videos.
- Screenshot-first story films and recording-based walkthroughs.
- 16:9, 1:1, and 9:16 delivery.

Deferred:

- Freeform keyframes, a full nonlinear editor, avatar presenters, generative
  B-roll, collaboration seats, and physical-product advertising.

## Business

Arco sells completed outcomes, not cheap tokens. Pricing should map to
production value: approved projects, export formats, campaign packs, brand
systems, team review, and priority rendering. Internal AI and rendering cost
should be optimized only after quality is protected by evaluation and golden
renders. A lower-cost result that looks generic damages the core product.
