# Architecture

## Current monorepo

```
arco/
├── apps/
│   ├── web/          # Next.js — landing, waitlist
│   └── api/          # NestJS — placeholder
├── packages/
│   └── typescript-config/
├── docs/             # Product & build knowledge (this folder)
└── turbo.json
```

## Target architecture (MVP)

```
apps/web              # Dashboard: ingest, storyboard, music pick, preview, export
apps/api              # Projects, assets, render jobs (optional: merge into web first)
packages/
  scene-schema/       # JSON types + Zod validation
  remotion/           # Templates, compositions, music mux, render CLI
  ingest/             # URL scrape, metadata, color extraction (optional)
```

## Render engine

**Remotion** (recommended):

- Deterministic motion = quality moat
- React/TS matches stack
- Native audio track support for music mux

## MVP pipeline

```
URL
  → ingest / AI analysis (positioning, features, tone)
  → storyboard JSON (text scenes only)
  → user edits copy + uploads screenshots + picks musicId
  → scene JSON (composition contract)
  → Remotion render (video + music)
  → MP4 upload → download URL
```

**Excluded from pipeline:** voice script, TTS, audio timing to VO, avatars, text-to-video.

## Core data model

### Project

`id`, `userId`, `url`, `brandKit`, `musicId`, `templateId`, `createdAt`

### Storyboard

Array of text scenes (see [PRODUCT.md](./PRODUCT.md)) — source for scene JSON generation.

### Asset

Screenshots, logo, optional Figma bundle paths.

### Composition (scene JSON)

Versioned schema: comp metadata + scenes + layers. Source of truth for preview and render.

### RenderJob

`status`: queued | rendering | done | failed  
`outputUrl`, `error`, `durationMs`

## Scene JSON (integration contract)

Arco-owned format — not `.aep`.

```json
{
  "version": "1",
  "composition": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationInFrames": 900
  },
  "audio": {
    "musicId": "modern-saas",
    "volume": 0.85
  },
  "brand": {
    "primary": "#55b3ff",
    "background": "#07080a"
  },
  "scenes": [
    {
      "id": "hook",
      "durationInFrames": 90,
      "layers": [
        {
          "id": "headline",
          "type": "text",
          "props": {
            "content": "Sync Everything",
            "subcontent": "Across all your devices"
          },
          "animation": { "preset": "slide-up", "delayFrames": 0 }
        }
      ]
    }
  ]
}
```

## Layer types (MVP)

| Type | Purpose |
|------|---------|
| `text` | Headlines, subheadlines, CTA |
| `image` | Screenshots, logos |
| `ui-frame` | Screenshot + device chrome + pan/zoom |
| `solid` | Backgrounds, gradients |
| `group` | Nested children |

## AI usage (MVP)

- **LLM:** URL → storyboard text scenes (headlines, feature lines, CTA)—user editable
- **Not MVP:** TTS, music gen, Runway B-roll, presenter video

## Preview & render

- Preview: `@remotion/player` in web app, same JSON as export
- Render: `renderMedia()` local worker → S3/R2 in production

## Auth & billing

Defer to paid beta; magic link + manual invoice for first 10 users is fine.

## Environment

| Variable | App | Purpose |
|----------|-----|---------|
| `WAITLIST_WEBHOOK_URL` | web | Waitlist POST webhook |

## Web UI

Follow [`apps/web/DESIGN.md`](../apps/web/DESIGN.md) — `#07080a`, Raycast blue accent, Inter, premium dark.
