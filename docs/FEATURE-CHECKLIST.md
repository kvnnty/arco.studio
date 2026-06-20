# Arco feature checklist

User-facing features to ship. Check off as each becomes **real** (not mock UI).

**Status key:** `[x]` shipped · `[~]` partial / mock · `[ ]` not built · `[-]` explicitly out of scope

**Combined MVP target:** [MOTIONFLARE-REFERENCE.md](./MOTIONFLARE-REFERENCE.md) — Motionflare UX + Arco real recordings.

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
| [-] | AI voice / TTS | Out of scope |

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
| [ ] | Screenshot import as B-roll | Post-MVP |
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
| [-] | Voiceover | Out of scope v1 |
| [-] | AI narrator | Out of scope |

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
| [~] | Recent activity feed | Sample data labeled on dashboard |
| [x] | Credits / usage stats | Live export allowance from API |
| [~] | Usage chart page | Chart mock; export stats live |
| [~] | Assets library page | Mock data |
| [~] | Notifications | Mock data |
| [x] | Billing & plans | Stripe Launch Offer + portal |
| [~] | Team / members | Mock data |
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
| [x] | Export credits / limits | 15/mo on Pro, gated at render |
| [~] | Invoices & billing history | Stripe Customer Portal |

---

## Landing & growth

| | Feature | Status |
|---|---------|--------|
| [x] | Marketing landing page | |
| [x] | Waitlist | |
| [ ] | Before/after demo video on landing | |
| [ ] | Public example exports | |
| [ ] | Referral / invite | |
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

## Priority order (what to ship next)

1. **Cloud projects + upload** — persistence
2. **AI brief → draft** — real intelligence
3. **Export MP4** — core value
4. **Project detail + download** — complete loop
5. **Brand from URL** — shipped (Phase 4)
6. **Billing** — shipped (Phase 5)
7. **Vision / click detection** — quality leap

---

*Last updated: June 2026*
