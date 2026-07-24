# Status

Updated: 22 July 2026.

## Product Direction

Arco is now defined as an AI motion-design workflow for product owners, not a
one-shot video generator. The target interaction is:

```text
complete brief -> approve direction -> review storyboard -> refine draft
               -> pass craft checks -> receive delivery package
```

Screenshots and real product media remain primary. Recording is supported as a
secondary walkthrough path.

## Active Week Milestones

| Milestone | Status |
|-----------|--------|
| M1 - Brief to animatic | Partial: production API startup and strict storyboard output are fixed; failure persistence, duration preflight, and exact retry errors are implemented. Heuristic storyboard stages pass. Live VO plus browser create -> theater -> preview still require approved provider QA. |
| M2 - Motion polish | Complete: device frames, varied transitions, per-scene VO ducking, BGM staging, and reviewed 16:9 / 9:16 H.264/AAC exports pass. |
| M3 - Revision loop | Open |
| M4 - Trust | Open |

## Implemented

| Area | Current state |
|------|---------------|
| Shared contract | Zod schema for project, brief, creative direction, scenes, motion intent, layout, camera, depth, brand, and audio |
| AI storyboard | Structured creative direction and scene metadata with a heuristic fallback |
| Video compiler | Arco-owned HTML composition compiler in `@arco/video` |
| Scene systems | Hook, product focus, left/right split, proof, and CTA layouts |
| Motion | Intentional camera moves, depth, transitions, marker zoom, ripple, title, and callout systems |
| Typography | Bundled Figtree variable font with deterministic preview/export loading |
| Preview | Official HyperFrames player in the web editor |
| Export | HyperFrames MP4 render from the API worker |
| Asset handling | Local logo, image, recording, voice, music, and font staging |
| Quality gate | Missing inputs/assets, generic copy, long type, duplicate copy, and visual monotony checks |
| Render preflight | Strict HyperFrames lint, no warnings, no best-effort media failures |
| Golden output | 9-second 1280x720 and 720x1280 H.264/AAC samples rendered and visually inspected |
| Old engine | Removed from source, app dependencies, and runtime paths |

## Verified This Migration

- `@arco/video` TypeScript check passes.
- `@arco/video` compiler tests pass.
- Web TypeScript check passes.
- Web ESLint passes with no warnings or errors.
- Next.js production build completes successfully.
- API production-source TypeScript check passes.
- HyperFrames lint reports 0 errors and 0 warnings.
- Golden export contains H.264 video, AAC audio, 1280x720 at 30 fps.
- Portrait export contains H.264 video, AAC audio, 720x1280 at 30 fps.
- Timed ducking is compiled per scene: full BGM level on silent scenes and a
  lower level only on VO scenes.
- Hook, feature, and CTA frames were inspected for font loading, media loading,
  legibility, hierarchy, and framing.

## Open Engineering Risks

| Risk | Next action |
|------|-------------|
| No automated pixel regression | Save approved frames and compare them in CI |
| Full live M1 run is not closed | Restore OpenAI quota, approve the configured VO-provider QA call, then run browser create -> theater -> preview |
| Remote signed media not covered by golden sample | Run an API export with real uploaded screenshot, VO, and music URLs |
| Visual range is still bounded | Build more authored scene families and continuity-aware transitions |
| Quality scoring is mostly structural | Add rendered-frame checks and human benchmark scoring |
| Music rights need operational proof | Complete the provenance table in `AUDIO.md` |

## Immediate Priority

1. Build professional intake and reference collection.
2. Present multiple real creative directions for approval.
3. Add scene/timestamp review with scoped revisions and locks.
4. Create screenshot-based visual regression and craft checks.
5. Expand the authored motion-system library, including selective 3D stages.
6. Deliver format variants, captions, poster, transcript, and project manifest.

The detailed order and exit criteria live in [ROADMAP.md](./ROADMAP.md).
