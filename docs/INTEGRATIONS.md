# Integrations

## Strategy

**Arco scene JSON** is the contract. Tools export into or import from Arco—not `.aep` parsing in v1.

```
Figma / screenshots / URL
        ↓
   Storyboard (text scenes)
        ↓
   Arco scene JSON  ←── source of truth
        ↓
   Remotion + music track → MP4
        ↓ (Phase 2)
   After Effects plugin (refine)
```

## Figma (highest leverage)

**Month 1:** Manual PNG export + copy colors/text into Arco.  
**Month 2+:** Plugin exports frames → scene JSON + assets.

## After Effects (Phase 2)

Not in 30-day MVP.

1. Month 1: Export scene JSON + asset bundle
2. Month 2–3: AE plugin reads JSON → comps/layers (subset of properties)
3. Designers polish; no round-trip required

### Lottie (optional)

AE → Bodymovin → Lottie for logo stings only. Heavy effects → bake to MP4.

## Remotion

Primary renderer. Templates = React components + `scene-schema` props + `staticFile()` music.

## Audio integrations (MVP)

- **Curated local/CDN MP3/WAV** — no Spotify API, no AI music gen
- See [AUDIO.md](./AUDIO.md)

## Audio Phase 2–3 (planned)

| Phase | Integration |
|-------|-------------|
| 2 | Licensed BGM library (6+ tracks, preview modal) — [SCREENSHOT-VOICE-MUSIC-ROADMAP.md](./SCREENSHOT-VOICE-MUSIC-ROADMAP.md) |
| 3 | **ElevenLabs** TTS per scene, BGM ducking — not Vertex TTS ([MOTIONFLARE-INSPIRATION.md](./MOTIONFLARE-INSPIRATION.md)) |
| 4 | User-uploaded music (Pro) |

## Audio NOT in MVP

- TTS / voice (ElevenLabs in Phase 3)
- Audio sync to generated speech
- Presenter video APIs

## AI (MVP scope)

| Use | Tool |
|-----|------|
| URL → storyboard copy | LLM API |
| Optional metadata | Cheerio / fetch OG tags |

## AI NOT in MVP

- Text-to-video
- AI music
- AI voice (ElevenLabs planned Phase 3 — see [SCREENSHOT-VOICE-MUSIC-ROADMAP.md](./SCREENSHOT-VOICE-MUSIC-ROADMAP.md))

## Waitlist (existing)

`apps/web/src/app/actions/waitlist.ts` → `WAITLIST_WEBHOOK_URL` POST `{ email }`.

## Design system

[`apps/web/DESIGN.md`](../apps/web/DESIGN.md)
