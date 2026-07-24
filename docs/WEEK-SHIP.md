# One-week ship plan (active)

**Window:** 19-26 July 2026 (7 days)
**Goal:** Soft-launch ready - AI motion designer loop works end to end: brief pack -> product truth -> direction -> animatic -> polish -> export in < 10 min, and 5 beta users can finish without developer help.
**North star:** [PRODUCT.md](./PRODUCT.md) and [DECISIONS.md](./DECISIONS.md). QA script: [TECHNICAL.md](./TECHNICAL.md#motion-pipeline-golden-path-manual)

**Agents and humans must follow this doc until M1-M4 are checked off.**
Anything that does not unblock the screenshot-first AI motion designer loop is **out of scope** for this week.

---

## Hard Rules

1. **Screenshots are the default product truth** - recording stays secondary; no CV / click detection.
2. **Golden path first** - if composer -> theater -> preview -> chat refine -> export breaks, fix that before anything else.
3. **Automate the designer loop, not random features** - no hybrid mode, free tier, Figma, persistent queue, duplicate project, OAuth polish, unless beta is blocked.
4. **Close M1 -> M2 -> M3 -> M4 in order** - do not start trust/landing polish until M1-M3 exit criteria pass on local stack.
5. **Update checkboxes here when done** - keep [STATUS.md](./STATUS.md) snapshot in sync at end of week.

---

## Definition Of Done

All must be true:

- [~] **M1 - Brief to animatic:** Composer create always runs real Analyze -> Draft -> Voice -> Layout; user sees theater then preview; failures show clear error + retry. *(22 Jul: production API startup, strict storyboard schema, duration preflight, failed-draft persistence, and exact errors fixed. Storyboard fallback verified; live VO and browser create -> theater -> preview still need approved provider QA.)*
- [x] **M2 - Motion polish:** Export passes [quality checklist](./TECHNICAL.md#template--screenshot-quality): device frame, varied transitions, timed duck, not slideshow; 16:9 + 9:16 spot-checked. *(22 Jul: H.264/AAC renders and hook/feature/CTA frames verified at 1280x720 and 720x1280.)*
- [ ] **M3 - Revision loop:** Chat ("Make headlines shorter" / "Stronger CTA") updates scene copy + re-TTS without full rebuild.
- [ ] **M4 - Trust:** Brand applied when URL present; errors toasted; UI/copy says AI motion designer for product owners; golden path < 10 min on staging.
- [ ] **Delivery package:** Format QA (9:16 / 1:1 / Studio 4K smoke); landing uses real Arco MP4 (or honest posters + note); staging env/auth/deploy checklist done.
- [ ] **Beta:** 5 users invited; track time-to-export + first-export success only.

---

## Day Plan

| Day | Date | Focus | Exit for the day |
|-----|------|-------|------------------|
| **0** | Sun 19 | Baseline - run golden path cold; list only blockers | Written blocker list (max 10) |
| **1** | Mon 20 | **M1** Pipeline UX gaps | Theater always runs from create; no empty editor jump |
| **2** | Tue 21 | **M1** finish + **M2** start | Create -> Ready reliable; start export quality pass |
| **3** | Wed 22 | **M2** Visual quality | Device frames, transitions, duck, BGM; export is not a slideshow |
| **4** | Thu 23 | **M3** Chat refine + re-TTS | One-scene / global copy edits re-TTS correctly |
| **5** | Fri 24 | **M4** Trust + format QA | Brand on URL path; errors; 9:16/1:1/4K smoke |
| **6** | Sat 25 | Landing MP4s + staging ops | Real demo assets; staging checklist green |
| **7** | Sun 26 | Soft launch | Golden path on staging < 10 min; 5 betas invited; docs synced |

If ahead of schedule: tighten export quality and landing demos.  
If behind: cut landing polish and Studio 4K; keep 16:9 + 9:16 screenshot path green.

---

## Milestone Exit Criteria

### M1 - Brief To Animatic

| Check | Pass |
|-------|------|
| Create (URL + brief + >=3 screenshots + voice + BGM) -> editor | Pipeline starts automatically |
| Steps visible | Analyze -> Draft -> Voice -> Layout -> Polish -> Ready |
| Each step does real work | Not cosmetic delays only |
| Failure | Error message + retry; project not stuck silently |

**Code anchors:** `run-screenshot-pipeline.ts`, `chat-panel.tsx`, `create-screenshot-project.ts`, `pipeline-panel.tsx`

### M2 - Motion Polish

| Check | Pass |
|-------|------|
| Device frame | Browser or phone visible in preview + export |
| Transitions | Not fade-only across all scenes |
| Timed duck | Music lowers on VO scenes |
| BGM | Distinct library tracks ([AUDIO.md](./AUDIO.md)) |
| Taste test | Beats CapCut static slideshow in 5s side-by-side |

**Verified 22 Jul:** device frames remain legible in landscape and portrait;
heuristic storyboards vary `scale`, `slide`, and `push`; music is split by scene
and ducks only where VO is present; the six-track BGM library stages into export;
both format renders passed codec, duration, and visual frame inspection.

**Code anchors:** `packages/hyperframes/src/compile.ts`, `quality.ts`, and `render-file.ts`

### M3 - Revision Loop

| Check | Pass |
|-------|------|
| "Make headlines shorter" | Scene headlines update; no full storyboard rebuild |
| "Stronger CTA" on last scene | Last scene copy + VO updated |
| Re-TTS | New `voAudioSrc` when `voScript` changes |

**Code anchors:** `editor-shell.tsx` (`maybeRettsScenes`), `apply-chat-action.ts`, AI refine/chat tools

### M4 - Trust

| Check | Pass |
|-------|------|
| Brand | URL analyze merges colors/logo into project on screenshot create |
| Errors | Upload / pipeline / render failures toast |
| Messaging | Dashboard + marketing says screenshots/URL first, recording advanced |
| Time | Cold golden path < 10 minutes |

---

## Explicitly Deferred

- CV / click / vision on recordings
- Hybrid recording + screenshot B-roll
- Free tier, Product Hunt kit
- Persistent render queue unless staging loses jobs and blocks beta
- Duplicate project, real assets library, OAuth production pass
- Workspace brand kit, intro/outro cards, split/merge scenes

See [ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets).

---

## Daily Ritual

1. Run or re-run the [Motion pipeline golden path](./TECHNICAL.md#motion-pipeline-golden-path-manual).
2. Fix only what failed.
3. Check off items in this file.
4. Do not expand scope.

---

## Sync Targets When Week Completes

- [STATUS.md](./STATUS.md) - snapshot, known gaps, next work
- [ROADMAP.md](./ROADMAP.md#part-1--polish-plan-active) - mark M1-M4; refresh partial inventory
- This file - all definition-of-done boxes checked or explicitly cut with reason

---

*Created: 19 July 2026 - one-week finish push.*
