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
| [~] | Create project | Editor flow works; dashboard wizard is UI-only |
| [~] | Upload screen recording (MP4/MOV) | Local blob only — not cloud storage |
| [~] | AI analysis of recording | Mock timers + hardcoded markers |
| [~] | Auto-generated first draft | Fake scene labels & copy |
| [x] | Review draft before editing | Draft ready screen |
| [x] | Motion editor | Full workspace at `/editor` |
| [~] | Export video (MP4) | Dialog only — no real render |
| [ ] | Download exported video | — |
| [ ] | End-to-end in under 20 minutes | Blocked by export |

---

## Project creation

| | Feature | Status |
|---|---------|--------|
| [x] | Project name | |
| [x] | Product type — web / mobile / both | |
| [ ] | Product URL | |
| [ ] | Creative brief — “what is this video for?” | |
| [ ] | Target audience (founders, PMM, etc.) | |
| [ ] | Tone — minimal, bold, technical | |
| [ ] | Target length — 15s / 30s / 60s | |
| [~] | Choose export format at create | Wizard UI; not wired to editor |
| [~] | Choose style at create | Wizard UI; editor has real presets |
| [ ] | Projects saved to cloud | Local / file store only |
| [ ] | Re-open project after refresh | Session fragile |
| [ ] | Delete project | — |
| [ ] | Duplicate project | — |

---

## AI

| | Feature | Status |
|---|---------|--------|
| [~] | Analyze recording for key moments | UI only |
| [ ] | Detect clicks & cursor (real CV) | Week 5+ |
| [ ] | Detect pauses & navigation changes | Week 5+ |
| [ ] | Draft from user brief + intent | |
| [ ] | Draft from product URL / website | |
| [ ] | Brand-aware copy (headlines & subtitles) | |
| [ ] | Suggest style preset from brand | |
| [ ] | Extract brand colors from URL | |
| [ ] | Extract logo from URL / OG image | |
| [ ] | Regenerate copy for one scene | |
| [ ] | Regenerate all copy | |
| [ ] | “Ask Arco” — tweak tone globally | |
| [ ] | Sync narrative after manual edits | |
| [ ] | Vision — label screens in recording | Post-MVP |
| [-] | Text-to-video / fake UI generation | Out of scope |
| [-] | AI music | Out of scope |
| [-] | AI voice / TTS | Out of scope |

---

## Upload & assets

| | Feature | Status |
|---|---------|--------|
| [~] | Drag & drop video upload | Editor only |
| [ ] | Cloud storage (S3) | API exists, not wired |
| [ ] | Upload progress indicator | |
| [ ] | Max file size enforcement (500MB) | |
| [ ] | Recording library / assets page | Mock UI |
| [ ] | Re-use recording across projects | |
| [ ] | Screenshot import as B-roll | Post-MVP |
| [ ] | Logo upload for brand kit | |

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
| [ ] | Custom brand colors | |
| [ ] | Custom logo in video | |
| [ ] | Brand kit saved per workspace | |
| [ ] | Intro card (logo + headline) | Post-MVP |
| [ ] | Outro / CTA card | Post-MVP |

---

## Audio

| | Feature | Status |
|---|---------|--------|
| [~] | Music bed on draft | Assigned in JSON; not audible in preview |
| [ ] | Music plays in preview | |
| [ ] | Music in exported video | |
| [ ] | Music track picker | |
| [ ] | Volume control | Schema only |
| [-] | Voiceover | Out of scope v1 |
| [-] | AI narrator | Out of scope |

---

## Preview & export

| | Feature | Status |
|---|---------|--------|
| [x] | Live in-browser preview (`@remotion/player`) | |
| [x] | Play / pause / scrub controls | |
| [~] | Export dialog — format selection | Saves format; no render |
| [ ] | Server-side render to MP4 | |
| [ ] | 1080p 16:9 export | |
| [ ] | 1080×1080 1:1 export | |
| [ ] | 1080×1920 9:16 export | |
| [ ] | Render progress / status | |
| [ ] | Download from editor | |
| [ ] | Download from project page | |
| [ ] | Render queue (background jobs) | API scaffold only |

---

## Dashboard & workspace

| | Feature | Status |
|---|---------|--------|
| [x] | Dashboard home | |
| [~] | Project list | Mixed mock + local data |
| [~] | Project detail page | Placeholder preview |
| [~] | Recent activity feed | Mock data |
| [~] | Credits / usage stats | Mock data |
| [~] | Usage chart page | Mock data |
| [~] | Assets library page | Mock data |
| [~] | Notifications | Mock data |
| [~] | Billing & plans | Mock data |
| [~] | Team / members | Mock data |
| [x] | Settings — profile | |
| [x] | Help page | |
| [ ] | Workspace switcher (real) | UI only |
| [ ] | Processing status on projects | |
| [ ] | Thumbnail on project card | |

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
| [ ] | Stripe checkout | |
| [ ] | Export credits / limits | |
| [ ] | Invoices & billing history | Mock UI only |

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

- [ ] Upload recording to cloud
- [ ] AI draft from brief (or manual markers)
- [ ] Edit scenes — copy, effects, camera, transitions
- [ ] Style preset + brand applied
- [ ] Preview in browser
- [ ] Export & download 1080p MP4 (16:9)
- [ ] Project persists across sessions
- [ ] Sign up → create → export without developer help

---

## Priority order (what to ship next)

1. **Cloud projects + upload** — persistence
2. **AI brief → draft** — real intelligence
3. **Export MP4** — core value
4. **Project detail + download** — complete loop
5. **Brand from URL** — differentiation
6. **Billing** — monetization
7. **Vision / click detection** — quality leap

---

*Last updated: June 2025*
