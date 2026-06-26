# Audio

Strategy, BGM licensing, voice (ElevenLabs), and mix standards.

**See also:** [ROADMAP.md](./ROADMAP.md) Phase A (replace placeholders) · [TECHNICAL.md](./TECHNICAL.md)

> **Sprint 1 (June 2026):** Placeholder/template BGM from `music-tracks.ts` is intentional. Licensed distinct tracks are deferred to a later sprint — see Phase A1 in [ROADMAP.md](./ROADMAP.md#phase-a--launch-blockers-12-weeks).

---

## Strategy

Arco ships **curated music + on-screen text** for recording mode; **music + ElevenLabs VO** for screenshot storyboard mode. Matches Linear/Raycast/Vercel launch aesthetic—music, motion, real UI, text callouts.

**Do not build music generation.** License real tracks.

### Pipeline

```
Draft scenes → motion template → render → mix music (+ optional VO) → MP4
```

### Shipped (June 2026)

- 5-track BGM picker + preview modal on create
- Custom music upload (Pro) — `POST /uploads/music`
- ElevenLabs TTS per scene (screenshot mode) + BGM ducking
- `MusicBed` + `VoiceTrack` in Remotion

### Stretch

- SRT export · transition SFX · VO on recording-mode title cards only
- Pipeline chat step: "Recording voice-over…"

---

## BGM library — production status

**Status:** Development placeholders — **not launch-ready**

All files in `apps/web/public/music/` and `packages/remotion/public/music/`:

| Track ID | Label | Mood | Status |
|----------|-------|------|--------|
| `modern-saas` | Modern SaaS | UPBEAT | Placeholder (sine bed) |
| `ambient-tech` | Ambient Tech | STEADY | Copy of placeholder |
| `corporate-clean` | Corporate Clean | BRIGHT | Copy of placeholder |
| `startup-launch` | Startup Launch | WARM | Copy of placeholder |
| `energetic-reveal` | Energetic Reveal | DRIVING | Copy of placeholder |

**Problem:** Picker shows five moods but all sound identical.

**Before public launch:** Replace with **distinct** licensed tracks. Keep track IDs stable.

### Target library (5–10 beds)

| Track ID | Mood | Duration | Use case |
|----------|------|----------|----------|
| `modern-saas` | UPBEAT | 60–90s | Default launch |
| `ambient-tech` | STEADY | 90–120s | Dev tools walkthrough |
| `corporate-clean` | BRIGHT | 60–90s | Enterprise |
| `startup-launch` | WARM | 60–90s | Indie / PH |
| `energetic-reveal` | DRIVING | 45–75s | Feature drop |

### Sourcing

| Source | Notes |
|--------|-------|
| Epidemic Sound / Artlist | Fast commercial license |
| Uppbeat / Pixabay | Check attribution |
| Commission original | Unique brand sound |

**Recommendation:** 5 unique beds before launch; expand to 10 post-launch.

### Replacement checklist

1. [ ] Normalize to **-14 LUFS**; peak **-1 dBTP**
2. [ ] Copy to both `apps/web/public/music/` and `packages/remotion/public/music/`
3. [ ] Update `durationSec` in `apps/web/src/lib/editor/music-tracks.ts`
4. [ ] QA: BGM modal preview === export; ducking balanced with VO
5. [ ] Fill production registry below

### Production registry

| Track ID | Source | License | Attribution | Date | Notes |
|----------|--------|---------|-------------|------|-------|
| `modern-saas` | | | | | |
| `ambient-tech` | | | | | |
| `corporate-clean` | | | | | |
| `startup-launch` | | | | | |
| `energetic-reveal` | | | | | |

### Custom upload (Pro)

`POST /uploads/music` — MP3/WAV, 10MB, rights checkbox. Stored as `audio.customMusicSrc`.

### Code references

- `apps/web/src/lib/editor/music-tracks.ts` — catalog
- `packages/remotion/src/components/MusicBed.tsx` — render
- `packages/remotion/src/components/VoiceTrack.tsx` — VO + ducking

---

## Mix standards (export)

| Element | Target |
|---------|--------|
| BGM (no VO) | -14 to -16 LUFS integrated |
| BGM under VO | ~-12 dB duck |
| Peak | -1 dBTP max |
| Fade out | Last 1–2s |

---

## On-screen text = narrative (recording mode)

Even without VO: hook → features → CTA. Music drives emotion; text drives message.

*Last updated: June 2026*
