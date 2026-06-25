# Arco feature checklist

User-facing features to ship. Check off as each becomes **real** (not mock UI).

**Status key:** `[x]` shipped · `[~]` partial / mock · `[ ]` not built · `[-]` explicitly out of scope

**Combined MVP target:** [MOTIONFLARE-REFERENCE.md](./MOTIONFLARE-REFERENCE.md) — Motionflare UX + Arco real recordings. **What to borrow (and avoid):** [MOTIONFLARE-INSPIRATION.md](./MOTIONFLARE-INSPIRATION.md).

**Related:** [PRODUCT.md](./PRODUCT.md) · [BUILD-CHECKLIST.md](./BUILD-CHECKLIST.md) (how to build)

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
| [ ] | Delete project | — |
| [ ] | Duplicate project | — |

---

## AI

| | Feature | Status |
|---|---------|--------|
| [~] | Analyze recording for key moments | Heuristic timing; no CV yet |
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
| [~] | Feature callout (text + pointer) | Schema only |
| [x] | Click effect picker — none, ripple, pulse, spotlight, zoom, glow | |
| [x] | Zoom strength slider | |
| [x] | Scene transitions — fade, push, scale, blur, morph, slide | |
| [x] | Toggle title card on/off per scene | |
| [x] | Camera focus box (drag on preview) | |
| [x] | Add scene at playhead | |
| [x] | Delete scene | |
| [x] | Scene start time & duration | |
| [ ] | Reorder scenes (drag) | |
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
| [ ] | Free tier | |
| [ ] | Pro plan ($39–49) | |
| [ ] | Maker plan ($15) | |
| [x] | Stripe checkout | Launch Offer via Checkout Session |
| [x] | Export credits / limits | 15/mo on Pro — charged on **completed** export |
| [~] | Invoices & billing history | Stripe Customer Portal |
| [x] | Export-on-success billing (code) | `consumeExport()` on completed render |

---

## Landing & growth

| | Feature | Status |
|---|---------|--------|
| [x] | Marketing landing page | |
| [x] | Waitlist | |
| [ ] | Before/after demo video on landing | |
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
| [x] | Multi-image upload (PNG/JPG) | 3–10 images, reorder |
| [x] | AI storyboard from screenshots + brief | `POST /ai/generate-storyboard` |
| [x] | Remotion screenshot composition | `ScreenshotStoryboard` + Ken Burns |
| [x] | Scene editor for screenshot projects | Strip + inspector |
| [ ] | Hybrid recording + screenshot B-roll | Phase 5 |

---

## Voice & advanced audio

| | Feature | Status |
|---|---------|--------|
| [x] | Music track picker | BGM modal + customize panel |
| [x] | BGM library with preview (Motionflare-style) | 5 tracks — [LICENSES-MUSIC.md](./LICENSES-MUSIC.md) |
| [x] | BGM on dashboard create | BGM chip + modal |
| [x] | Custom music upload | Pro — `POST /uploads/music` + rights checkbox |
| [x] | Language & Voice picker | Dashboard Screenshots tab |
| [x] | ElevenLabs TTS per scene | `apps/api/src/voice/` |
| [x] | BGM ducking under voice | Remotion `VoiceTrack` + lowered music volume |

---

## Priority order (what to ship next)

1. **Licensed BGM assets** — swap placeholders ([LICENSES-MUSIC.md](./LICENSES-MUSIC.md))
2. **Vision / click detection** — recording mode quality
3. **Hybrid mode** — Phase 5
5. **VO on recording mode** — optional stretch

---

*Last updated: June 2026*
