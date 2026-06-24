# Arco build checklist

**North star:** Upload screen recording → AI-assisted draft → edit markers → export 1080p MP4 in under 20 minutes.

**How to use:** Work phases in order. Check items as you ship. Do not start Phase 4 until Phase 3 exit criteria pass.

**Related:** [MVP-BUILD.md](./MVP-BUILD.md) · [PROJECT-SCHEMA.md](./PROJECT-SCHEMA.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Already done

- [x] `@arco/project-schema` — Zod types, markers, effects, style presets
- [x] `@arco/remotion` — composition, zoom, ripple, title-card, golden sample
- [x] Remotion Studio — `pnpm --filter @arco/remotion dev`
- [x] Landing page + waitlist
- [x] Editor UI at `/editor` — upload, mock analysis, draft, workspace
- [x] `@remotion/player` preview in editor
- [x] Scene list, inspector, style presets, camera focus overlay
- [x] NestJS API scaffold — auth, projects, uploads (S3), render jobs
- [x] Dashboard shell — home, projects, settings, billing (mock), etc.
- [x] NextAuth (web) + JWT auth (API)

---

## Phase 1 — Connect the stack

**Goal:** One backend, one project store, real uploads. No more split between `.data/` and Postgres.

**Exit criteria:** Create project in dashboard → upload → edit → refresh page → project and recording still load.

### API & database

- [ ] Postgres running locally (`apps/api/docker-compose.yml` or hosted)
- [ ] Prisma migrations applied; `Project.projectData` stores full `ArcoProject` JSON
- [ ] Unify auth — web login creates/fetches user in API DB (or shared user ID mapping)
- [ ] API env documented — `DATABASE_URL`, S3 vars, `JWT_SECRET`

### Web → API wiring

- [ ] Add API client helper in `apps/web` (base URL, JWT from session)
- [ ] Replace `apps/web/src/lib/projects/store.ts` file store with API calls
- [ ] `syncProjectSummary` → full project upsert (`projectData` + metadata)
- [ ] Load project in editor from API by ID (not only localStorage)
- [ ] Dashboard project list reads from API only (remove mock merge for real projects)

### Uploads

- [ ] Editor upload → `POST /uploads/recording` (multipart) instead of blob URL
- [ ] Save `recordingSrc` on project record
- [ ] Preview uses S3/proxy URL Remotion can read server-side
- [ ] Handle upload progress and errors in UI

### Flow unification

- [ ] Dashboard **New project** → creates API project → redirects to `/editor?id=…`
- [ ] Remove or redirect dead wizard at `dashboard/projects/new` (or wire it to same flow)
- [ ] Project detail **Open in editor** loads correct project session
- [ ] Editor **New project** creates API project before upload step

### Cleanup

- [ ] Deprecate `.data/projects.json` for production path
- [ ] Update [CURRENT-STATE.md](./CURRENT-STATE.md) when Phase 1 ships

---

## Phase 2 — Real AI draft

**Goal:** User describes what they need; AI generates tailored markers, copy, and style — not hardcoded mocks.

**Exit criteria:** Brief + optional URL → analysis step returns LLM-generated draft that reflects user intent and brand tone.

### Schema & session

- [ ] Add `ProjectBrief` to session/project — `intent`, `productUrl`, `audience`, `tone`, `targetLength`
- [ ] Persist brief in `projectData` or dedicated API fields

### Create flow

- [ ] Add **product URL** field to `create-project-screen.tsx`
- [ ] Add **brief textarea** — “What is this video for?”
- [ ] Pass brief + URL through upload → analysis steps

### AI service

- [ ] Create `apps/api/src/ai/` module (or `apps/web/src/app/api/ai/` if starting simpler)
- [ ] `POST /ai/generate-draft` — input: brief, url, durationMs, platform, brand hints
- [ ] Output validated against `ArcoProject` marker schema (Zod)
- [ ] LLM provider configured — `OPENAI_API_KEY` or equivalent in env
- [ ] System prompt based on [PROMPTS-AND-STYLE.md](./PROMPTS-AND-STYLE.md)
- [ ] Optional: fetch OG tags from product URL (title, description, image)

### Replace mock analysis

- [ ] Swap `runAnalysis()` in `analyze-recording.ts` for API call
- [ ] Keep progress UI in `analysis-screen.tsx`; show real step labels
- [ ] Fallback to heuristic draft if LLM fails (graceful degradation)
- [ ] `buildDraftProject()` uses AI markers + style preset from response

### Editor AI actions

- [ ] **Regenerate copy** button on selected scene in `scene-inspector.tsx`
- [ ] **Regenerate all copy** — respects brief + current project state
- [ ] Optional: global “Ask Arco…” bar in `editor-workspace.tsx` for tone tweaks

### Brand

- [ ] Map product URL / brief → `stylePreset` suggestion
- [ ] Map brand colors → `ArcoProject.brand` (OG image or LLM inference)
- [ ] Optional: logo from OG image → `brand.logoSrc`

---

## Phase 3 — Render + download

**Goal:** Export real MP4 from the browser without CLI. MVP definition of done.

**Exit criteria:** Upload → edit → Export → download 1080p MP4. Render completes without manual CLI.

### Remotion render worker

- [ ] Render entry script in `@arco/remotion` using `renderMedia()` / `@remotion/renderer`
- [ ] Worker picks `RenderJob` where `status = queued`
- [ ] Load `projectData` + `recordingSrc` for job
- [ ] Write output MP4 to S3; set `outputUrl` + `status = completed`
- [ ] Failed jobs → `status = failed` with error message
- [ ] Local dev: worker as script or Nest cron/queue

### Music bed

- [ ] Add music track asset to `packages/remotion/public/` or CDN
- [ ] Wire `ArcoComposition` to play `project.audio.musicId`
- [ ] Match `audioId` from style presets

### Export UI

- [ ] `export-dialog.tsx` → `POST /renders` with `projectId` + format
- [ ] Poll render status until complete
- [ ] Download button when `outputUrl` ready
- [ ] Project detail page — real preview + download (replace placeholders)
- [ ] Update project status — `draft` → `processing` → `completed`

### Quality

- [ ] 16:9 export at 1920×1080
- [ ] Recording resolves correctly from S3 in headless render
- [ ] End-to-end test with one real screen recording
- [ ] Total flow under 20 minutes (manual QA)

---

## Phase 4 — Polish + ship

**Goal:** Ready for founding users — credible product, not a prototype.

**Exit criteria:** External user can sign up, create a video, export, and (optionally) pay.

### Product polish

- [ ] Render progress UI — % or stage labels in dashboard + export dialog
- [ ] Replace mock stats on dashboard (credits, activity) with real data or hide until ready
- [ ] Empty states link to working create flow
- [ ] Error toasts for API, upload, render failures

### Landing & demo

- [ ] Before/after demo on landing page (real Arco output)
- [ ] Update [LANDING.md](./LANDING.md) copy to match shipped features

### Monetization (optional for soft launch)

- [ ] Stripe founding tier ($29–49) — [MONETIZATION.md](./MONETIZATION.md)
- [ ] Wire billing page to real subscription or hide behind flag
- [ ] Credits / export limits if needed

### GTM

- [ ] 5 beta users — hackathon teams + founders
- [ ] Feedback loop — what broke, time-to-export, vs CapCut compare

### Docs & ops

- [ ] Env example files for `apps/web` and `apps/api`
- [ ] Deploy checklist — web, API, worker, S3, Postgres
- [ ] Update [CURRENT-STATE.md](./CURRENT-STATE.md)

---

## Phase 5 — Smarter AI & stretch (post-MVP)

**Do not start until Phase 3 exit criteria pass.**

### Vision & detection

- [ ] Extract keyframes from upload (5–10 frames)
- [ ] Vision model labels screens — login, dashboard, settings, etc.
- [ ] Align marker timestamps to detected UI moments
- [ ] Click/cursor detection (replace duration-only heuristics)

### Export & format

- [ ] 9:16 and 1:1 render crop (schema already supports formats)
- [ ] Intro card from URL — logo + headline
- [ ] Free tier — 1 export/month

### Integrations

- [ ] Figma frame import
- [ ] AE export plugin (Phase 2 integrations)

---

## MVP definition of done

All must pass before calling MVP shipped:

- [ ] Upload a real screen recording
- [ ] AI or manual draft with ≥3 markers (zoom + ripple + title)
- [ ] Live preview in browser
- [ ] Export 1080p MP4 without CLI
- [ ] End-to-end under 20 minutes
- [ ] Side-by-side: output obviously more launch-ready than CapCut on same recording (5s compare)

---

## Environment variables (collect as you go)

### `apps/web`

| Variable | Phase | Purpose |
|----------|-------|---------|
| `AUTH_SECRET` | 1 | NextAuth |
| `API_URL` | 1 | Nest API base URL |
| `OPENAI_API_KEY` | 2 | LLM draft generation |

### `apps/api`

| Variable | Phase | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | 1 | Postgres |
| `JWT_SECRET` | 1 | API auth |
| `S3_ENDPOINT` | 1 | Object storage |
| `S3_BUCKET` | 1 | Uploads + renders |
| `S3_ACCESS_KEY` | 1 | S3 credentials |
| `S3_SECRET_KEY` | 1 | S3 credentials |
| `OPENAI_API_KEY` | 2 | LLM (if AI lives on API) |

---

## Phase 6 — Screenshot, BGM, voice (June 2026+)

**Goal:** Motionflare-grade create UX with Arco’s real visuals. Master plan: [SCREENSHOT-VOICE-MUSIC-ROADMAP.md](./SCREENSHOT-VOICE-MUSIC-ROADMAP.md).

**Do not start until Phase 4 polish is stable for recording mode.**

### Export billing (align code with policy)

- [x] Move export consumption from `POST /renders` queue to render **`completed`**
- [x] In-flight cap in `assertCanExport`
- [x] Billing query invalidation on export complete/fail (web)

See [MOTIONFLARE-INSPIRATION.md](./MOTIONFLARE-INSPIRATION.md) · [MONETIZATION.md](./MONETIZATION.md).

### Phase 1 — Screenshot storyboard

- [x] Schema v2: `projectMode`, `scenes[]` with image assets
- [x] Image upload API + S3
- [x] Dashboard Screenshots tab on create hero
- [x] AI storyboard from images + brief
- [x] Remotion screenshot composition (device frame + Ken Burns)

### Phase 2 — BGM library

- [x] Ship 5 track MP3 assets (placeholders) + `LICENSES-MUSIC.md`
- [x] BGM modal on dashboard create (preview + mood tags)
- [x] Wire all tracks in render + preview

### Phase 3 — ElevenLabs (shipped)

- [x] Voice picker modal on dashboard create (preview + catalog)
- [x] TTS per scene + BGM ducking (`VoiceTrack`, `musicVolumeForProject`)
- [x] `ELEVENLABS_API_KEY` env + `apps/api/src/voice/`
- [ ] Pipeline chat step “Recording voice-over…” (stretch)

---

## Suggested weekly focus

| Week | Focus | Checklist section |
|------|-------|-------------------|
| **A** | Connect stack + uploads | Phase 1 |
| **B** | AI draft + editor regen | Phase 2 |
| **C** | Render worker + export | Phase 3 |
| **D** | Polish, landing, beta users | Phase 4 |

Phases 1 and 2 can overlap if split across workstreams.

---

## Quick commands

```bash
pnpm install
pnpm dev                                    # all apps
pnpm --filter @arco/remotion dev            # Remotion Studio
pnpm --filter @arco/remotion render:sample  # CLI render test
```

---

*Last updated: June 2026 — adjust checkboxes as items ship.*
