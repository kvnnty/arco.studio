# MVP roadmap (~30 days, solo)

## North star

> Paste URL → ~30 seconds to preview path → clean, **music-driven** SaaS launch video with UI motion and text callouts—no narrator.

## Prioritize

1. URL → product understanding
2. Storyboard generation (**text scenes**, not voice script)
3. Motion templates (Remotion)
4. Curated music tracks (5–10)
5. MP4 export

## Ignore for 30 days

- Voiceovers / TTS / ElevenLabs
- Avatars / AI presenters
- Text-to-video (Runway/Veo)
- Perfect After Effects integration
- Music generation
- Multilingual audio

## Week 1 — Render path

- [ ] `packages/scene-schema` — Zod types, sample storyboard + scene JSON
- [ ] `packages/remotion` — `Launch30` template: text scenes + UI placeholder + **one music track**
- [ ] CLI: JSON → MP4 locally
- [ ] Golden demo JSON (fake SaaS) for killer demo

**Exit:** Script renders reference-quality 30s MP4 with music.

## Week 2 — Ingest & storyboard

- [ ] URL ingest (title, description, og:image, colors)
- [ ] LLM: URL → storyboard text scenes (headline/subheadline per scene)
- [ ] Web: paste URL, show editable storyboard
- [ ] Screenshot upload → map to `ui-frame` layers
- [ ] Remotion Player preview in browser

**Exit:** Real URL → edited storyboard → preview.

## Week 3 — Product loop

- [ ] Project persistence (DB)
- [ ] Music picker (5 tracks minimum; stub IDs OK until licensed)
- [ ] Brand overrides (logo, colors)
- [ ] Render queue (single worker)
- [ ] Download MP4

**Exit:** Dashboard end-to-end without CLI.

## Week 4 — Ship

- [ ] 5–10 music tracks licensed and normalized
- [ ] Landing: embed killer demo MP4
- [ ] Export scene JSON download
- [ ] Waitlist → invite 5–10 beta users
- [ ] Fix render failures, progress UI

**Exit:** Paid beta or strong conversion story.

## Phase 2 (month 2–3)

- Figma plugin → scene JSON
- AE plugin: JSON → comps/layers
- Second template (Feature 45s) or 9:16
- Optional VO only if users demand
- Stripe + credits

## Definition of done

A SaaS founder can:

1. Paste URL
2. Edit 5–7 text scenes
3. Upload 4 screenshots
4. Pick music
5. Export 30s 1080p MP4 in **< 15 minutes total**
6. Video feels comparable to **Linear/Raycast-tier** launch motion—not AI VO ad

## Solo realism

| Goal | 30 days? |
|------|----------|
| Music + text + UI template → MP4 | Yes |
| URL → LLM storyboard | Yes |
| Figma plugin | Stretch |
| AE integration | No |
| VO pipeline | No (intentionally) |

## Related docs

- [GTM.md](./GTM.md) — 14-day founding revenue
- [ICP.md](./ICP.md) — who to onboard in beta
- [DECISIONS.md](./DECISIONS.md) — scope locks
- [ARCHITECTURE.md](./ARCHITECTURE.md) — packages to create
