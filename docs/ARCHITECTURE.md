# Architecture

## Monorepo

```
arco/
├── apps/
│   ├── web/                 # Next.js — upload, editor, preview, export
│   └── api/                 # NestJS — render jobs (later)
├── packages/
│   ├── project-schema/      # ArcoProject Zod types ✅
│   ├── remotion/            # Compositions + presets ✅
│   └── typescript-config/
└── docs/
```

## MVP pipeline

```
Upload recording (MP4)
  → ArcoProject JSON (markers + effects)
  → Preview (@remotion/player)
  → Render (@remotion/cli / worker)
  → Download MP4
```

## ArcoProject (source of truth)

See [PROJECT-SCHEMA.md](./PROJECT-SCHEMA.md) and `@arco/project-schema`.

```
recording.src + markers[].effects → Remotion composition
```

## Remotion package

| Path | Role |
|------|------|
| `ArcoComposition.tsx` | Main comp |
| `components/RecordingLayer` | Video / placeholder + zoom |
| `components/ClickRipple` | Ripple preset |
| `components/TitleCard` | Title card preset |
| `lib/motion.ts` | Zoom interpolation |

## Commands

```bash
pnpm --filter @arco/remotion dev
pnpm --filter @arco/remotion render:sample
```

## Week 2+ (apps/web)

- Upload → store `recording.src`
- Editor mutates `markers[]`
- Player receives `ArcoProject` props

## Env

| Variable | App |
|----------|-----|
| `WAITLIST_WEBHOOK_URL` | web |

## Design

[`apps/web/DESIGN.md`](../apps/web/DESIGN.md)
