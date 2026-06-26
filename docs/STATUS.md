# Status

Current snapshot, feature matrix, and engineering checklist.

**See also:** [ROADMAP.md](./ROADMAP.md) (what's next) · [TECHNICAL.md](./TECHNICAL.md) (how to run/deploy)

---

# Snapshot (June 2026)


**Updated:** June 2026 — Studio tier, screenshot + voice mode, project-slot billing.

---

## Implemented

| Area | Status |
|------|--------|
| **Billing tiers** | Intro $9 · Pro $29 · **Studio $59** |
| **Project slots** | 5 / 15 / unlimited — delete to free a slot (dashboard UI shipped) |
| **Exports** | Unlimited re-exports per project |
| **Studio export** | 4K + batch social format pack *(QA: [ROADMAP.md](./ROADMAP.md#part-1--polish-plan-active))* |
| Screenshot storyboard + ElevenLabs VO + custom music (Pro+) | Done |
| Export MP4 | Render worker + screenshot + recording compositions |
| Core loop | Sign up → create → upload → AI draft → editor → export → download |
| Templates + dashboard quick-create | Shipped June 2026 |
| BGM picker + custom upload | UI + render wired; **audio files are placeholders** |

---

## Known gaps (summary)

| Gap | Doc |
|-----|-----|
| BGM library sounds identical (placeholder files) | [AUDIO.md](./AUDIO.md) |
| Recording AI uses heuristics, not CV | [ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets) |
| Duplicate project | [ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets) |
| Render queue in-memory | [ROADMAP.md](./ROADMAP.md#part-1--polish-plan-active) Phase D |

---

## Plans at a glance

| Plan | Active projects | Export |
|------|-----------------|--------|
| Intro | 5 | 1080p 16:9 |
| Pro | 15 | 1080p all formats |
| Studio | Unlimited | 4K + social pack |

---

## Local dev

```bash
pnpm install
pnpm --filter @arco/api exec prisma db push
pnpm --filter @arco/api dev
pnpm --filter @arco/web dev
```

**Requires:** Postgres, MinIO (S3), FFmpeg for full export path.

Add `STRIPE_PRICE_STUDIO_MONTHLY` in `apps/api/.env` for Studio checkout.

---

## Next work (recommended order)

1. **Phase A1** — Licensed BGM ([AUDIO.md](./AUDIO.md)) — deferred from Sprint 1
2. **Phase B4 / C / D** — Format QA, real assets page, persistent render queue, vision/CV

Full backlog: [ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets)

---

# Feature checklist


User-facing features to ship. Check off as each becomes **real** (not mock UI).

**Status key:** `[x]` shipped · `[~]` partial / mock · `[ ]` not built · `[-]` explicitly out of scope

**Combined MVP target:** [REFERENCE-MOTIONFLARE.md](./REFERENCE-MOTIONFLARE.md) — Motionflare UX + Arco real recordings. **What to borrow (and avoid):** [REFERENCE-MOTIONFLARE.md](./REFERENCE-MOTIONFLARE.md#part-2--what-to-borrow-and-avoid).

**Related:** [PRODUCT.md](./PRODUCT.md) · [STATUS.md](./STATUS.md#engineering-checklist) (how to build) · [ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets) (not built + excellence) · [ROADMAP.md](./ROADMAP.md#part-1--polish-plan-active) (partial work plan)

---

## Core workflow

The product loop every user should complete.

| | Feature | Status |
|---|---------|--------|
| [x] | Landing page | Live |
| [x] | Waitlist signup | Webhook |
| [x] | Sign up / log in | Email credentials |
| [x] | Create project | Dashboard `/dashboard/projects/new` |
| [x] | Upload screen recording (MP4/MOV) | S3 via API |
| [x] | AI analysis of recording | Chat panel + LLM/heuristic draft |
| [x] | Auto-generated first draft | `POST /ai/generate-draft` |
| [x] | Review draft before editing | Chat summary → edit in shell |
| [x] | Motion editor | Unified shell at `/editor` |
| [x] | Export video (MP4) | Render worker + dialog |
| [x] | Download exported video | Project detail + export dialog |
| [~] | End-to-end in under 20 minutes | Requires local infra running |

---

## Project creation

| | Feature | Status |
|---|---------|--------|
| [x] | Project name | |
| [x] | Product type — web / mobile / both | |
| [x] | Product URL | Create form (optional) |
| [x] | Creative brief — “what is this video for?” | Create form + `ArcoProject.brief` |
| [ ] | Target audience (founders, PMM, etc.) | |
| [ ] | Tone — minimal, bold, technical | |
| [ ] | Target length — 15s / 30s / 60s | |
| [x] | Choose export format at create | Wired via upload helper |
| [x] | Choose style at create | Wired via upload helper |
| [x] | Projects saved to cloud | API + Postgres |
| [x] | Re-open project after refresh | `?projectId=` load |
| [x] | Delete project | Dashboard list + detail; frees slot |
| [ ] | Duplicate project | — |

---

## AI

| | Feature | Status |
|---|---------|--------|
| [~] | Analyze recording for key moments | Heuristic timing; UI labels “AI suggested timings” |
| [ ] | Detect clicks & cursor (real CV) | Week 5+ |
| [ ] | Detect pauses & navigation changes | Week 5+ |
| [x] | Draft from user brief + intent | LLM when `OPENAI_API_KEY` set |
| [x] | Draft from product URL / website | Cheerio scrape in analyze chat |
| [x] | Brand-aware copy (headlines & subtitles) | LLM draft + refine + `brandContext` |
| [x] | Suggest style preset from brand | Tone heuristic from scrape |
| [x] | Extract brand colors from URL | `POST /brand/analyze-url` |
| [x] | Extract logo from URL / OG image | Favicon / og:image → `brand.logoSrc` |
| [x] | Regenerate copy for one scene | Inspector + chat |
| [x] | Regenerate all copy | `POST /ai/refine-project` + chat |
| [x] | “Ask Arco” — tweak tone globally | Chat panel + `/ai/chat` |
| [ ] | Sync narrative after manual edits | |
| [ ] | Vision — label screens in recording | Post-MVP |
| [-] | Text-to-video / fake UI generation | Out of scope |
| [-] | AI music | Out of scope |
| [x] | AI voice / TTS (ElevenLabs) | Screenshot mode — `POST /voice/generate` |

---

## Upload & assets

| | Feature | Status |
|---|---------|--------|
| [x] | Drag & drop video upload | Create + editor |
| [x] | Cloud storage (S3) | Recordings + thumbnails |
| [x] | Upload progress indicator | Create + editor |
| [x] | Max file size enforcement (500MB) | API multer limit |
| [ ] | Recording library / assets page | Mock UI |
| [ ] | Re-use recording across projects | |
| [x] | Screenshot import as storyboard scenes | Dashboard Screenshots tab + `POST /uploads/image` |
| [x] | Logo upload for brand kit | Customize panel + thumbnail upload |

---

## Motion & effects

Presets are designed once; AI/user picks **where**, presets define **how**.

| | Feature | Status |
|---|---------|--------|
| [x] | Smooth zoom | Remotion + editor |
| [x] | Click ripple | |
| [x] | Title card overlay | |
| [x] | Spotlight | |
| [x] | Pulse | |
| [x] | Glow | |
| [x] | Feature callout (text + pointer) | Inspector + Remotion `FeatureCallout` |
| [x] | Click effect picker — none, ripple, pulse, spotlight, zoom, glow | |
| [x] | Zoom strength slider | |
| [x] | Scene transitions — fade, push, scale, blur, morph, slide | |
| [x] | Toggle title card on/off per scene | |
| [x] | Camera focus box (drag on preview) | |
| [x] | Add scene at playhead | |
| [x] | Delete scene | |
| [x] | Scene start time & duration | |
| [x] | Reorder scenes (drag) | Recording + screenshot strips |
| [ ] | Split scene | |
| [ ] | Merge scenes | |
| [-] | Freeform keyframes | Post-MVP |
| [-] | Layer timeline (After Effects depth) | Post-MVP |

---

## Style & brand

| | Feature | Status |
|---|---------|--------|
| [x] | Style presets — Linear, Stripe, Apple, Startup | |
| [x] | Preset applies brand colors + motion feel | |
| [x] | Change preset in editor | |
| [x] | Export format — 16:9, 1:1, 9:16 | Preview + save; render TBD |
| [x] | Preview aspect ratio updates with format | |
| [x] | Custom brand colors | Customize panel |
| [x] | Custom logo in video | `LogoOverlay` in Remotion |
| [~] | Brand kit saved per workspace | Per-project `ArcoProject.brand` |
| [ ] | Intro card (logo + headline) | Post-MVP |
| [ ] | Outro / CTA card | Post-MVP |

---

## Audio

| | Feature | Status |
|---|---------|--------|
| [x] | Music bed on draft | Style presets assign track |
| [x] | Music plays in preview | `MusicBed` + web public asset |
| [x] | Music in exported video | Remotion render |
| [x] | Music track picker | Customize panel |
| [x] | Volume control | Customize panel + `MusicBed` |
| [-] | Voiceover (manual upload) | Out of scope v1 |
| [x] | AI narrator (ElevenLabs TTS) | Screenshot projects |

---

## Preview & export

| | Feature | Status |
|---|---------|--------|
| [x] | Live in-browser preview (`@remotion/player`) | |
| [x] | Play / pause / scrub controls | |
| [x] | Export dialog — format selection | Wired to render job |
| [x] | Server-side render to MP4 | Remotion worker |
| [x] | 1080p 16:9 export | Default |
| [x] | 1080×1080 1:1 export | Format picker |
| [x] | 1080×1920 9:16 export | Format picker |
| [x] | Render progress / status | Poll in dialog + detail |
| [x] | Download from editor | Export dialog |
| [x] | Download from project page | `ProjectDetailActions` |
| [x] | Render queue (background jobs) | In-memory processor |

---

## Dashboard & workspace

| | Feature | Status |
|---|---------|--------|
| [x] | Dashboard home | |
| [x] | Project list | API-backed with posters + search |
| [x] | Project detail page | Preview, live export, timeline |
| [x] | Recent activity feed | Derived from projects + exports |
| [x] | Credits / usage stats | Live export allowance from API |
| [~] | Usage chart page | Weekly exports from usage events |
| [~] | Assets library page | Project recordings + exports |
| [~] | Notifications | Derived from export/render status |
| [x] | Billing & plans | Stripe Launch Offer + portal |
| [-] | Team / members | Out of scope — solo founders only |
| [x] | Settings — profile | |
| [x] | Help page | |
| [ ] | Workspace switcher (real) | UI only |
| [x] | Processing status on projects | Status badges + poll |
| [x] | Thumbnail on project card | Poster + optional `thumbnailUrl` |

---

## Auth & account

| | Feature | Status |
|---|---------|--------|
| [x] | Email sign up | |
| [x] | Email log in | |
| [x] | Magic link flow (UI) | |
| [x] | Protected dashboard & editor | |
| [ ] | Password auth | |
| [ ] | OAuth (Google, GitHub) | |
| [ ] | Unified web + API auth | Split systems today |
| [ ] | Email verification | |

---

## Monetization

| | Feature | Status |
|---|---------|--------|
| [x] | Intro plan ($9/mo) | 5 active project slots |
| [x] | Pro plan ($29/mo) | 15 slots; custom music upload |
| [x] | Studio plan ($59/mo) | Unlimited slots; 4K + social pack |
| [ ] | Free tier | Funnel option — see [ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets) |
| [-] | Legacy Maker ($15) / Pro ($39â€“49) | Superseded by Intro/Pro/Studio tiers |
| [x] | Stripe checkout | Checkout Session + Customer Portal |
| [x] | Project-slot limits | Active projects per plan |
| [x] | Unlimited re-exports | Per project |
| [~] | Invoices & billing history | Stripe Customer Portal only |
| [x] | Export-on-success billing | `consumeExport()` on completed render |

---

## Landing & growth

| | Feature | Status |
|---|---------|--------|
| [x] | Marketing landing page | |
| [x] | Waitlist | |
| [~] | Before/after demo video on landing | `BeforeAfterDemo` on home (poster stand-ins; swap MP4 when ready) |
| [ ] | Public example exports | |
| [x] | Referral / invite | |
| [ ] | Product Hunt launch assets | |

---

## Integrations (post-MVP)

| | Feature | Status |
|---|---------|--------|
| [ ] | Figma frame import | Month 2+ |
| [ ] | After Effects export plugin | Phase 2 |
| [ ] | GitHub release → auto video | Month 6+ |
| [ ] | URL-only storyboard (no recording) | Out of MVP |

---

## MVP feature gate

All must be checked before MVP launch:

- [x] Upload recording to cloud
- [x] AI draft from brief (or manual markers)
- [x] Edit scenes — copy, effects, camera, transitions
- [x] Style preset + brand applied
- [x] Preview in browser
- [x] Export & download 1080p MP4 (16:9)
- [x] Project persists across sessions
- [~] Sign up → create → export without developer help | Needs local Postgres + MinIO + FFmpeg

---

## Templates & dashboard quick-create (shipped June 2026)

| | Feature | Status |
|---|---------|--------|
| [x] | Dashboard create hero (URL + brief + recording) | `/dashboard` |
| [x] | Template strip + gallery | `/dashboard/templates` |
| [x] | Template blueprint → AI draft | `@arco/project-schema/templates` |
| [x] | Make video → editor analysis | One-step create |

---

## Screenshot storyboard mode (shipped June 2026)

| | Feature | Status |
|---|---------|--------|
| [x] | Dashboard Screenshots tab | `/dashboard` create hero |
| [x] | Multi-image upload (PNG/JPG) | 3â€“10 images, reorder |
| [x] | AI storyboard from screenshots + brief | `POST /ai/generate-storyboard` |
| [x] | Remotion screenshot composition | `ScreenshotStoryboard` + Ken Burns |
| [x] | Scene editor for screenshot projects | Strip + inspector |
| [ ] | Hybrid recording + screenshot B-roll | Phase 5 |

---

## Voice & advanced audio

| | Feature | Status |
|---|---------|--------|
| [x] | Music track picker | BGM modal + customize panel |
| [x] | BGM library with preview (Motionflare-style) | 5 tracks — [AUDIO.md](./AUDIO.md) |
| [x] | BGM on dashboard create | BGM chip + modal |
| [x] | Custom music upload | Pro — `POST /uploads/music` + rights checkbox |
| [x] | Language & Voice picker | Dashboard Screenshots tab |
| [x] | ElevenLabs TTS per scene | `apps/api/src/voice/` |
| [x] | BGM ducking under voice | Remotion `VoiceTrack` + lowered music volume |

---

## Priority order (what to ship next)

See **[ROADMAP.md](./ROADMAP.md#part-1--polish-plan-active)** for phased execution. Summary:

1. **Phase A1** — Licensed BGM ([AUDIO.md](./AUDIO.md)) — deferred from Sprint 1
2. **Phase B4** — Format fidelity QA (9:16, 1:1, Studio 4K)
3. **Phase C** — Real assets page, auth on staging, usage/notifications
4. **Phase D** — Persistent render queue, vision/click detection
5. **Backlog** — Hybrid mode, VO on recording, free tier, landing MP4 demos ([ROADMAP.md](./ROADMAP.md#part-2--backlog--excellence-targets))

---

*Last updated: June 2026*

---

# Engineering checklist

> **Note:** Phases 1–4 and most of Phase 6 are shipped. Unchecked Phase 1–3 items below are stale unless re-verified. Use the feature checklist above as product truth.


**North star:** Upload screen recording → AI-assisted draft → edit markers → export 1080p MP4 in under 20 minutes.

**How to use:** Work phases in order. Check items as you ship. Do not start Phase 4 until Phase 3 exit criteria pass.

**Related:** [ROADMAP.md](./ROADMAP.md#appendix--original-mvp-week-plan) · [TECHNICAL.md](./TECHNICAL.md#project-schema) · [TECHNICAL.md](./TECHNICAL.md)

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

- [x] Postgres running locally (`apps/api/docker-compose.yml` or hosted)
- [x] Prisma migrations applied; `Project.projectData` stores full `ArcoProject` JSON
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
- [x] Editor **New project** creates API project before upload step

### Cleanup

- [ ] Deprecate `.data/projects.json` for production path
- [ ] Update [STATUS.md](./STATUS.md) when Phase 1 ships

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
- [ ] System prompt based on [TECHNICAL.md](./TECHNICAL.md#prompts-and-style)
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
- [x] Empty states link to working create flow
- [x] Error toasts for API, upload, render failures

### Landing & demo

- [~] Before/after demo on landing page (real Arco output) — `BeforeAfterDemo` with poster stand-ins
- [ ] Update [PRODUCT.md](./PRODUCT.md) copy to match shipped features

### Monetization (optional for soft launch)

- [ ] Stripe founding tier ($29â€“49) — [BUSINESS.md](./BUSINESS.md)
- [ ] Wire billing page to real subscription or hide behind flag
- [ ] Credits / export limits if needed

### GTM

- [ ] 5 beta users — hackathon teams + founders
- [ ] Feedback loop — what broke, time-to-export, vs CapCut compare

### Docs & ops

- [ ] Env example files for `apps/web` and `apps/api`
- [ ] Deploy checklist — web, API, worker, S3, Postgres
- [ ] Update [STATUS.md](./STATUS.md)

---

## Phase 5 — Smarter AI & stretch (post-MVP)

**Do not start until Phase 3 exit criteria pass.**

### Vision & detection

- [ ] Extract keyframes from upload (5â€“10 frames)
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


| Variable         | Phase | Purpose              |
| ---------------- | ----- | -------------------- |
| `AUTH_SECRET`    | 1     | NextAuth             |
| `API_URL`        | 1     | Nest API base URL    |
| `OPENAI_API_KEY` | 2     | LLM draft generation |


### `apps/api`


| Variable         | Phase | Purpose                  |
| ---------------- | ----- | ------------------------ |
| `DATABASE_URL`   | 1     | Postgres                 |
| `JWT_SECRET`     | 1     | API auth                 |
| `S3_ENDPOINT`    | 1     | Object storage           |
| `S3_BUCKET`      | 1     | Uploads + renders        |
| `S3_ACCESS_KEY`  | 1     | S3 credentials           |
| `S3_SECRET_KEY`  | 1     | S3 credentials           |
| `OPENAI_API_KEY` | 2     | LLM (if AI lives on API) |


---

## Phase 6 — Screenshot, BGM, voice (June 2026+)

**Goal:** Motionflare-grade create UX with Arco’s real visuals. Master plan: [ROADMAP.md](./ROADMAP.md#part-3--screenshot--voice--music-initiative).

**Do not start until Phase 4 polish is stable for recording mode.**

### Export billing (align code with policy)

- [x] Move export consumption from `POST /renders` queue to render `**completed`**
- [x] In-flight cap in `assertCanExport`
- [x] Billing query invalidation on export complete/fail (web)

See [REFERENCE-MOTIONFLARE.md](./REFERENCE-MOTIONFLARE.md#part-2--what-to-borrow-and-avoid) · [BUSINESS.md](./BUSINESS.md).

### Phase 1 — Screenshot storyboard

- [x] Schema v2: `projectMode`, `scenes[]` with image assets
- [x] Image upload API + S3
- [x] Dashboard Screenshots tab on create hero
- [x] AI storyboard from images + brief
- [x] Remotion screenshot composition (device frame + Ken Burns)

### Phase 2 — BGM library

- [x] Ship 5 track MP3 assets (placeholders) + [AUDIO.md](./AUDIO.md)
- [x] BGM modal on dashboard create (preview + mood tags)
- [x] Wire all tracks in render + preview

### Phase 3 — ElevenLabs (shipped)

- [x] Voice picker modal on dashboard create (preview + catalog)
- [x] TTS per scene + BGM ducking (`VoiceTrack`, `musicVolumeForProject`)
- [x] `ELEVENLABS_API_KEY` env + `apps/api/src/voice/`
- [ ] Pipeline chat step “Recording voice-over…” (stretch)

### Phase 4 — Custom music (shipped)

- [x] `POST /uploads/music` (MP3/WAV, 10MB, Pro gate)
- [x] `audio.customMusicSrc` in schema + Remotion `MusicBed`
- [x] Rights affirmation checkbox on upload
- [x] BGM modal + customize panel upload UI

---

## Suggested weekly focus


| Week  | Focus                       | Checklist section |
| ----- | --------------------------- | ----------------- |
| **A** | Connect stack + uploads     | Phase 1           |
| **B** | AI draft + editor regen     | Phase 2           |
| **C** | Render worker + export      | Phase 3           |
| **D** | Polish, landing, beta users | Phase 4           |


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
