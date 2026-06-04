# Output specification

Quality bar for templates and QA. Creative reference: **Linear, Raycast, Vercel, Framer** launch films.

## Format

| Property | MVP value |
|----------|-----------|
| Resolution | 1920×1080 |
| FPS | 30 |
| Duration | 30s default (900 frames) |
| Codec | H.264 MP4 |
| Audio | Stereo music, -14 to -16 LUFS normalized |

## Visual

- Background: brand `#07080a` or template premium dark/light
- Typography: bold headline, restrained subcopy; positive letter-spacing on dark (see DESIGN.md)
- UI: real screenshots in device frame; slow pan/zoom; no stretched assets
- Motion: ease-out / smooth bezier; stagger 3–8 frames
- Text: burned-in callouts (hook, features, CTA)—readable at mobile size
- No stock actors in MVP

## Audio

- **Music only** — no narrator
- Track must not overpower; no clipping
- Optional template SFX in Phase 2 (whoosh on cut)—not MVP

## Story rhythm (30s example)

| Segment | ~Duration | Content |
|---------|-----------|---------|
| Intro | 3s | Logo + tagline text |
| Hook | 4s | Problem/outcome headline |
| Feature 1 | 5s | UI + callout |
| Feature 2 | 5s | UI + callout |
| Feature 3 | 5s | UI + callout |
| CTA | 4s | CTA text + logo |
| Outro | 4s | Hold / fade |

Tune per template; total frames must match `durationInFrames`.

## Text scene examples

- “Stop losing files”
- “Sync across devices”
- “Collaborate in real time”
- “Start free today”

## QA checklist

- [ ] All headlines readable at 1080p on phone
- [ ] Screenshots sharp, correct aspect ratio
- [ ] No VO / no “AI ad” cadence
- [ ] Music fits mood; no jarring loop point
- [ ] CTA legible last 3 seconds
- [ ] Does not feel like stock slideshow
- [ ] Passes 5s comparison vs Canva/InVideo template

## Optional B-roll prompt (Phase 2 only)

If adding Runway/Veo later—never for UI:

> Cinematic studio lighting, premium neutral background, smooth slow pan, shallow DOF, professional commercial, minimal text, no people, no UI elements

UI must always come from **real screenshots**.
