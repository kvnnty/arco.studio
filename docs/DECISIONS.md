# Product & technical decisions

## Category (locked)

| Decision | Choice |
|----------|--------|
| What we are | **Product demo & motion design workflow** |
| What we're not | AI video generator, CapCut clone, physical product ads |
| Product center | **Arco Project** (editable), not MP4 export |
| Scope | **Web + mobile tech** only |

## Input (locked)

| Decision | Choice |
|----------|--------|
| Primary input | **User screen recording** (browse their app) |
| Secondary | Screenshots, URL brand (v2) |
| Not primary | Prompt-only video, stock footage |

## AI (locked)

| AI does | AI does NOT |
|---------|-------------|
| Analyze recording (clicks, pauses) | Invent UI |
| Suggest markers + treatments | Generate motion from scratch |
| Draft title copy | Replace preset motion system |

**Motion:** hardcoded presets (`smooth-zoom`, `click-ripple`, etc.)

## Audio (locked)

| Decision | Choice |
|----------|--------|
| MVP | Curated **music** optional |
| No MVP | VO, TTS, avatars |

## Editor (locked)

| MVP | Later |
|-----|-------|
| Marker list + sidebar | Full timeline |
| Preset picker, text, duration | Freeform keyframes |
| Canva-depth | After Effects-depth |

## Buyers (locked)

| Tier | Segment |
|------|---------|
| Revenue | B2B founders, PMM, agencies |
| Funnel | B2C hackathons, students, indies |
| Avoid | General B2C video |

## Business (locked)

| Decision | Choice |
|----------|--------|
| Money score (MVP) | **8/10** |
| Start pricing | Pro $39–49, Maker $15, Free 1 export |
| Quality bar | **95%** or users leave |

## Integrations timeline

| Tool | When |
|------|------|
| Remotion render | Week 1 |
| Manual markers | Week 1–2 |
| AI click detection | Week 5+ |
| Figma / AE | Month 3+ |
| GitHub release hook | Month 6+ |

## MVP scope

### In
- Upload MP4, markers, 3 presets, preview, export 16:9

### Out
- Mobile pipeline, 9:16, team, Stripe (week 4), perfect click AI

## Open questions

- [ ] SQLite vs Postgres for projects
- [ ] Render local vs Lambda first
- [ ] Sample recording bundled for demo
