# Current state

**Updated:** Recording-first MVP — Week 1 scaffolded.

## Implemented

| Item | Status |
|------|--------|
| Docs (refined vision) | ✅ |
| `@arco/project-schema` | ✅ Zod types, markers, effects |
| `@arco/remotion` | ✅ Composition, zoom, ripple, title-card |
| Golden sample project | ✅ `golden-project.json` |
| `apps/web` waitlist | ✅ |
| Upload / editor / render | ❌ Week 2–3 |

## Try Remotion Studio

```bash
pnpm install
pnpm --filter @arco/remotion dev
```

Opens preview with placeholder UI + 4 markers (zoom, ripple, titles).

## Next (Week 2)

See [MVP-BUILD.md](./MVP-BUILD.md):

1. Wire `@remotion/player` in `apps/web`
2. Upload MP4
3. Marker editor UI

## Vision summary

Upload app recording → markers + motion presets → edit → export. Web/mobile tech only.
