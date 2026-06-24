# Motionflare inspiration (what to borrow — and what to avoid)

**Purpose:** Capture UX and product ideas worth taking from [Motionflare](https://motionflare.ai/dashboard), contrast their [disclosed stack](https://motionflare.ai/privacy) with Arco’s, and document billing philosophy Arco intentionally rejects.

**Related:** [MOTIONFLARE-REFERENCE.md](./MOTIONFLARE-REFERENCE.md) · [SCREENSHOT-VOICE-MUSIC-ROADMAP.md](./SCREENSHOT-VOICE-MUSIC-ROADMAP.md) · [MONETIZATION.md](./MONETIZATION.md)

---

## Strategic stance

Motionflare’s **product UX and create flow** are strong. Their **output quality** often disappoints because visuals are **AI-generated or scraped**, not the user’s real product in motion.

> **Borrow their interface patterns. Do not borrow their visual pipeline or credit-metered generation.**

**Arco positioning:**

> Motionflare makes videos *about* your product from a URL.  
> **Arco makes videos *of* your product** — recordings and real screenshots — with Motionflare-grade create UX, voice, and music.

---

## Ideas to adopt (UX & product)

### Create surface

| Idea | Motionflare | Arco plan |
|------|-------------|-----------|
| “What would you like to create?” hero | ✅ | ✅ Shipped (`/dashboard`) |
| Input mode tabs | Website · Prompt | **Recording · Screenshots ·** (optional URL) |
| **Language & Voice** chip before generate | ✅ | Phase 3 — [roadmap](./SCREENSHOT-VOICE-MUSIC-ROADMAP.md) |
| **BGM** modal — library + preview + None | ✅ (Warm Launch, Up Bit, …) | Phase 2 |
| **Upload your BGM** (Pro) | ✅ | Phase 4 |
| Example brand chips (Cursor, Stripe, …) | ✅ | Add under create hero |
| Make video → workspace (not wizard pages) | ✅ | ✅ Shipped |

### BGM modal pattern (copy this UI)

Observed library tracks with mood tags and play buttons:

- Warm Launch (WARM)
- Bright Pulse (BRIGHT)
- Launch Drive (DRIVING)
- Calm Focus (STEADY)
- Mountain Rise (CINEMATIC)
- **Up Bit** (UPBEAT)

Arco should match: **None**, grid with **mood tag + duration + play preview**, optional Pro upload.

### Generation workspace

| Idea | Adopt? |
|------|--------|
| Chat left, preview right | ✅ Already in editor |
| Timed pipeline messages (“Analyzing…”, “Recording voice-over…”) | ✅ Extend chat for Phase 3 |
| “Ask me to change something…” after draft | ✅ Chat panel |
| Per-scene **Regenerate** | ✅ Marker/scene regen |
| Right-side stepper (Analyze → Draft → Voice → …) | ✅ Add Voice step when TTS ships |

### Growth & trust (later)

| Idea | Priority |
|------|----------|
| Public share links for exports | Phase 2+ |
| Curated showcase gallery | Maps to template gallery |
| Product update emails | Resend — already wired |
| Watermark on free tier | N/A — Arco is paid-only today |

---

## Do NOT adopt

| Motionflare pattern | Why Arco avoids it |
|---------------------|-------------------|
| **Credits pre-deducted on scene generation** | Punishes iteration; Arco includes draft/AI in subscription |
| **AI-generated scene footage** | Generic, untrustworthy UI |
| **Firecrawl + Gemini as primary visual source** | Output “feels AI”; Arco uses real recordings/screenshots |
| **Vertex TTS as default** (per their privacy policy) | Quality varies; Arco plans **ElevenLabs** in Phase 3 |
| Credit packs as primary monetization | Arco uses **subscription + export allowance** |

---

## Toolbox comparison

Sources: [Motionflare Privacy](https://motionflare.ai/privacy) · [Motionflare Terms](https://motionflare.ai/terms) · Arco codebase.

| Category | Motionflare | Arco today |
|----------|-------------|------------|
| **AI text** | Google Vertex AI (Gemini) | OpenAI (optional) + heuristic fallback |
| **Voice** | Vertex AI TTS | None → **ElevenLabs** (planned) |
| **URL / brand** | Firecrawl (scrape + screenshots) | Cheerio + fetch (OG, logo, colors) |
| **Visual source** | AI / scraped scenes | **User screen recording** (+ screenshots planned) |
| **Motion** | AI per-scene animation | **Remotion presets** + templates |
| **Render** | AWS Remotion Lambda | Local Remotion + FFmpeg in API |
| **Storage** | Cloudflare R2 | S3 / MinIO |
| **Auth** | OAuth + email | OAuth + email + magic link |
| **Billing** | Stripe + **credit ledger** | Stripe + **exports/month** |
| **Email** | Resend | Resend |
| **Errors** | Sentry (API) | Sentry (web, consent-gated) |
| **Analytics** | GA (opt-in) | GA (opt-in) |

**When to add Motionflare-like vendors:**

| Vendor | Add when |
|--------|----------|
| Firecrawl | URL-only create is a priority; optional — user screenshot upload first |
| Remotion Lambda | Export queue latency or scale pain |
| ElevenLabs | Phase 3 voice (quality wedge vs Vertex TTS) |

---

## Billing: Arco vs Motionflare

### Motionflare ([Terms §6](https://motionflare.ai/terms))

- Credits **pre-deducted** at start of chargeable actions (scene gen, export).
- Refund on permanent failure.
- Monthly subscription credits + purchasable packs.

### Arco policy (locked June 2026)

**No credit system.** Subscription unlocks the product; **export allowance** meters delivered value only.

| Included in subscription (unlimited) | Counts toward export allowance |
|--------------------------------------|--------------------------------|
| Create project, upload recording/screenshots | |
| AI analyze, draft, storyboard, chat | |
| Regenerate copy / scenes | |
| In-browser preview (`@remotion/player`) | |
| Failed export renders | |
| | **Successful completed MP4 export only** |

**User expectation:** Iterate freely (100+ previews/regens); **pay the export slot only when a final MP4 completes successfully.**

### Implementation status

| Behavior | Target | Code today |
|----------|--------|------------|
| AI / draft / preview | Free | ✅ Not metered |
| Failed export | Free | ✅ No charge (nothing reserved at queue) |
| Successful export | Counts 1 | ✅ `consumeExport()` on **completed** |
| Re-export after failure | Free retry | ✅ In-flight cap prevents over-queue |

---

## Build queue (next)

1. **Phase 3** — ElevenLabs + Language & Voice modal
2. **Licensed BGM** — replace placeholders ([LICENSES-MUSIC.md](./LICENSES-MUSIC.md))
3. **Example brand chips** on create hero
4. **Phase 5** — hybrid recording + screenshots

---

*Last updated: June 2026*
