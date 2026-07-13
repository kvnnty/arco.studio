# Audio

Strategy, BGM library, voice (ElevenLabs), and mix standards.

**See also:** [ROADMAP.md](./ROADMAP.md) · [DECISIONS.md](./DECISIONS.md)

> **July 2026:** Curated library replaced with six distinct Motionflare-sourced beds. Files live in `apps/web/public/music/` and `packages/remotion/public/music/`.

---

## Strategy

Arco ships **curated music + ElevenLabs VO** on the screenshot Motion path (primary). Recording mode uses music + on-screen text.

**Do not build music generation.** Use licensed / cleared library tracks.

### Pipeline

```
Draft scenes → motion template → render → mix music (+ VO with timed duck) → MP4
```

### Shipped

- 6-track BGM picker + preview modal on create
- Custom music upload (Pro) — `POST /uploads/music`
- ElevenLabs TTS per scene (screenshot mode)
- Timed BGM ducking under VO (`musicVolumeAtFrame`, duck to ~35% of base)
- Style presets map to distinct tracks
- Library default mix volume **0.25**

---

## BGM library

| Track ID | Label | Mood | Duration | Use case |
|----------|-------|------|----------|----------|
| `warm-launch` | Warm Launch | WARM | ~76s | Default SaaS announcements |
| `bright-pulse` | Bright Pulse | BRIGHT | ~65s | Energetic product demos |
| `launch-drive` | Launch Drive | DRIVING | ~71s | Fast-paced launch stories |
| `calm-focus` | Calm Focus | STEADY | ~117s | Quiet walkthroughs / Linear-style |
| `mountain-rise` | Mountain Rise | CINEMATIC | ~86s | Bigger cinematic finishes |
| `up-bit` | Up Bit | UPBEAT | ~67s | Playful / light launches |

**Source files:** originally hosted at `storage.motionflare.ai/assets/bgm/*.mp3` — vendored locally for preview + Remotion render parity.

### Style preset → track

| Preset | Track |
|--------|-------|
| Linear | `calm-focus` |
| Stripe | `bright-pulse` |
| Apple | `mountain-rise` |
| Startup | `launch-drive` |

Default when no preset/template: `warm-launch`.

### Mix standards

| Rule | Value |
|------|-------|
| Library base volume | **0.25** |
| Duck under VO | ~35% of base with ~0.25s fade |
| Peak limiter | -1 dBTP (export path) |
| Fade out last 1–2s | Prefer soft ending |

### Custom upload (Pro)

- MP3/WAV, 10MB, rights affirmation
- Stored on `audio.customMusicSrc`; clears `musicId`

---

## Voice

ElevenLabs per-scene TTS on screenshot projects. Re-TTS after `voScript` edits (chat refine + inspector).

---

*Last updated: July 2026*
