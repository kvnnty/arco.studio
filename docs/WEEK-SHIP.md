# One-week ship plan (active)

**Window:** 19–26 July 2026 (7 days)  
**Goal:** Soft-launch ready — screenshot golden path &lt; 10 min, export quality ≠ slideshow, 5 beta users can finish without developer help.  
**North star:** [DECISIONS.md](./DECISIONS.md) · QA script: [TECHNICAL.md](./TECHNICAL.md#motion-pipeline-golden-path-manual)

**Agents and humans must follow this doc until M1–M4 are checked off.**  
Anything that does not unblock the screenshot golden path is **out of scope** for this week.

---

## Hard rules

1. **Screenshot path only** — recording stays secondary; no CV / click detection.
2. **Golden path first** — if create → theater → preview → chat refine → export breaks, fix that before anything else.
3. **No new features** — no hybrid mode, free tier, Figma, persistent queue, duplicate project, OAuth polish, unless beta is blocked.
4. **Close M1 → M2 → M3 → M4 in order** — do not start trust/landing polish until M1–M3 exit criteria pass on local stack.
5. **Update checkboxes here when done** — keep [STATUS.md](./STATUS.md) snapshot in sync at end of week.

---

## Definition of done (week end)

All must be true:

- [~] **M1** — Screenshot create always runs real Analyze→Draft→Voice→Layout; user sees theater then preview; failures show clear error + retry *(19 Jul: auth wait + retry UI + failed sync; still need golden-path QA)*
- [ ] **M2** — Export passes [quality checklist](./TECHNICAL.md#template--screenshot-quality) (device frame, varied transitions, timed duck, not slideshow); 16:9 + 9:16 spot-checked
- [ ] **M3** — Chat (“Make headlines shorter” / “Stronger CTA”) updates scene copy + re-TTS without full rebuild
- [ ] **M4** — Brand applied when URL present; errors toasted; UI/copy screenshot-first; golden path &lt; 10 min on staging
- [ ] **Trust layer** — format QA (9:16 / 1:1 / Studio 4K smoke); landing uses real Arco MP4 (or honest posters + note); staging env/auth/deploy checklist done
- [ ] **Beta** — 5 users invited; track time-to-export + first-export success only

---

## Day plan

| Day | Date | Focus | Exit for the day |
|-----|------|--------|------------------|
| **0** | Sun 19 | Baseline — run golden path cold; list only blockers | Written blocker list (max 10) |
| **1** | Mon 20 | **M1** Pipeline UX gaps | Theater always runs from create; no empty editor jump |
| **2** | Tue 21 | **M1** finish + **M2** start | Create→Ready reliable; start export quality pass |
| **3** | Wed 22 | **M2** Visual quality | Device frames, transitions, duck, BGM; export ≠ slideshow |
| **4** | Thu 23 | **M3** Chat refine + re-TTS | One-scene / global copy edits re-TTS correctly |
| **5** | Fri 24 | **M4** Trust + format QA | Brand on URL path; errors; 9:16/1:1/4K smoke |
| **6** | Sat 25 | Landing MP4s + staging ops | Real demo assets; staging checklist green |
| **7** | Sun 26 | Soft launch | Golden path on staging &lt; 10 min; 5 betas invited; docs synced |

If ahead of schedule: tighten export quality and landing demos.  
If behind: cut landing polish and Studio 4K; keep 16:9 + 9:16 screenshot path green.

---

## Milestone exit criteria (detail)

### M1 — Pipeline UX

| Check | Pass |
|-------|------|
| Create (URL + brief + ≥3 screenshots + voice + BGM) → editor | Pipeline starts automatically |
| Steps visible | Analyze → Draft → Voice → Layout → Ready |
| Each step does real work | Not cosmetic delays only |
| Failure | Error message + retry; project not stuck silently |

**Code anchors:** `run-screenshot-pipeline.ts`, `chat-panel.tsx`, `create-screenshot-project.ts`, `pipeline-panel.tsx`

### M2 — Visual quality

| Check | Pass |
|-------|------|
| Device frame | Browser or phone visible in preview + export |
| Transitions | Not fade-only across all scenes |
| Timed duck | Music lowers on VO scenes |
| BGM | Distinct library tracks ([AUDIO.md](./AUDIO.md)) |
| Taste test | Beats CapCut static slideshow in 5s side-by-side |

**Code anchors:** `DeviceFrame.tsx`, `ScreenshotStoryboard.tsx`, `VoiceTrack.tsx` / `MusicBed.tsx`

### M3 — Chat refine

| Check | Pass |
|-------|------|
| “Make headlines shorter” | Scene headlines update; no full storyboard rebuild |
| “Stronger CTA” on last scene | Last scene copy + VO updated |
| Re-TTS | New `voAudioSrc` when `voScript` changes |

**Code anchors:** `editor-shell.tsx` (`maybeRettsScenes`), `apply-chat-action.ts`, AI refine/chat tools

### M4 — Trust

| Check | Pass |
|-------|------|
| Brand | URL analyze merges colors/logo into project on screenshot create |
| Errors | Upload / pipeline / render failures toast |
| Messaging | Dashboard + marketing screenshot-first (recording advanced) |
| Time | Cold golden path &lt; 10 minutes |

---

## After M1–M3 green (same week)

1. **Format QA** — preview framing matches export for 9:16, 1:1; Studio 4K smoke (or hide if broken)
2. **Landing** — replace poster stand-ins with real Arco screenshot exports where possible
3. **Staging** — env vars, auth, Postgres, S3, FFmpeg, Polar test products; deploy checklist in [TECHNICAL.md](./TECHNICAL.md#deploy)

---

## Explicitly deferred (after 26 July)

- CV / click / vision on recordings  
- Hybrid recording + screenshot B-roll  
- Free tier, Product Hunt kit  
- Persistent render queue (unless staging loses jobs and blocks beta)  
- Duplicate project, real assets library, OAuth production pass  
- Workspace brand kit, intro/outro cards, split/merge scenes  

See [ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets).

---

## Daily ritual

1. Run (or re-run) the [Motion pipeline golden path](./TECHNICAL.md#motion-pipeline-golden-path-manual).
2. Fix only what failed.
3. Check off items in this file.
4. Do not expand scope.

---

## Sync targets when week completes

- [STATUS.md](./STATUS.md) — snapshot, known gaps, “next work”
- [ROADMAP.md](./ROADMAP.md#part-1--polish-plan-active) — mark M1–M4; refresh partial inventory
- This file — all definition-of-done boxes checked or explicitly cut with reason

---

*Created: 19 July 2026 — one-week finish push.*
