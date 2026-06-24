# Audio strategy

## MVP decision: music-only

Arco MVP ships **curated music + on-screen text**. No voiceovers.

This matches modern SaaS launch creative (Linear, Raycast, Vercel, Framer): music, motion graphics, product UI, text callouts—often **no narrator**.

## Why skip voiceovers in v1

| Benefit | Detail |
|---------|--------|
| Lower cost | No TTS APIs, no audio sync pipeline |
| Cleaner output | VO can feel generic, salesy, templated |
| Faster pipeline | No script → generate → timing → lip-sync adjacency |
| Premium feel | Music + motion reads more “designed” than AI narration |
| Less complexity | No pronunciation, pacing, or multilingual issues |

## MVP pipeline (audio)

```
URL → analysis → storyboard (text scenes)
  → motion template → render video
  → mix selected music track → MP4
```

**Not** in MVP:

```
storyboard → voice script → TTS → align to timeline → video
```

## Curated music library

**Do not build music generation.** License or source **5–10 tracks** for MVP.

### Suggested categories

| ID | Mood | Use case |
|----|------|----------|
| `ambient-tech` | Ambient Tech | Calm B2B, dev tools |
| `modern-saas` | Modern SaaS | Default launch vibe |
| `corporate-clean` | Corporate Clean | Enterprise tone |
| `startup-launch` | Startup Launch | Product Hunt, upbeat |
| `energetic-reveal` | Energetic Product Reveal | High-energy feature drop |

### Implementation notes

- Store tracks as licensed MP3/WAV in `packages/remotion/assets/music/` or CDN
- User selects track in storyboard step; preview with `@remotion/player` + audio
- Normalize loudness across tracks (LUFS ~-14 to -16 for web)
- Duck music slightly under nothing in MVP (no VO); optional brief dip on CTA hit via template
- Document licenses in `docs/LICENSES-MUSIC.md` when tracks are added

## On-screen text = the narrative

Even without VO, storyboard must produce strong **text scenes**:

- Hook: “Stop losing files”
- Features: “Sync across devices”, “Collaborate in real time”
- CTA: “Start free today”

Motion templates animate these (slide-up, fade, stagger). Music drives **emotion**; text drives **message**.

## Phase 2+ (optional, demand-driven)

Full phased plan: **[SCREENSHOT-VOICE-MUSIC-ROADMAP.md](./SCREENSHOT-VOICE-MUSIC-ROADMAP.md)** · UX reference: **[MOTIONFLARE-INSPIRATION.md](./MOTIONFLARE-INSPIRATION.md)**.

Summary:

- **Phase 2:** Licensed BGM library (6+ tracks, preview on create) — replaces single-track MVP
- **Phase 3:** ElevenLabs VO per scene, BGM ducking, Language & Voice picker
- **Phase 4:** User-uploaded music (Pro, rights disclaimer)
- SRT export for social platforms
- Sound design SFX (whooshes on transitions)—low priority

## Demo tip

Strongest early demo: paste URL → **~30 seconds** → music-driven launch video with UI motion and text—no narrator, no uncanny voice.
