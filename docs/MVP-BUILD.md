# MVP build plan

**Goal (8/10 MVP):** Upload web app screen recording → add/edit markers → apply zoom + ripple + title presets → preview → export 16:9 MP4.

**Timeline:** ~4–6 weeks solo.

## Week 1 — Project model + preview ✅ START HERE

| Task | Package | Status |
|------|---------|--------|
| `ArcoProject` Zod schema | `@arco/project-schema` | Scaffolded |
| Remotion composition | `@arco/remotion` | Scaffolded |
| 3 presets: zoom, ripple, title-card | `@arco/remotion` | Scaffolded |
| Golden sample project JSON | `@arco/remotion` | Scaffolded |
| Remotion Studio | `pnpm --filter @arco/remotion dev` | Ready |

**Exit:** `golden-project.json` previews in Remotion Studio.

## Week 2 — Upload + marker editor

| Task | Where |
|------|-------|
| Upload MP4 (local/S3) | `apps/web` |
| Timeline UI — add marker at timestamp | `apps/web` |
| Sidebar — preset, intensity, callout text | `apps/web` |
| Wire `@remotion/player` preview | `apps/web` |

**Exit:** User uploads recording, places 3 markers, previews live.

## Week 3 — Render + persistence

| Task | Where |
|------|-------|
| Project CRUD (SQLite or Postgres) | `apps/api` or web |
| Render job → `renderMedia()` | `@arco/remotion` worker |
| Music bed (1 track) | `@arco/remotion` |
| Download MP4 | `apps/web` |

**Exit:** Upload → edit → MP4 without CLI.

## Week 4 — Ship

| Task | Where |
|------|-------|
| Landing before/after demo | `apps/web` |
| Founding Stripe ($29–49) | `apps/web` |
| 5 beta users (hackathon + founders) | GTM |
| Render progress UI | `apps/web` |

## Week 5–6 (stretch)

- AI click/pause detection → auto markers
- 9:16 export crop
- Intro card (logo + headline from URL)
- Free tier: 1 export/mo

## Explicitly NOT in MVP

- Perfect click AI (manual markers OK v1)
- Mobile recording pipeline
- AE / Figma plugins
- VO / avatars
- Team seats
- URL-only video (no recording)

## Architecture

```
apps/web          upload, editor, preview, export trigger
packages/
  project-schema  ArcoProject types + validation
  remotion        compositions, presets, render entry
```

## Marker model

```typescript
{
  id: "m1",
  startMs: 3000,
  durationMs: 1500,
  effects: [
    { type: "smooth-zoom", scale: 1.2 },
    { type: "click-ripple", intensity: 0.8 }
  ],
  callout: { text: "Create report" }
}
```

## Commands

```bash
pnpm install
pnpm --filter @arco/remotion dev          # Remotion Studio
pnpm --filter @arco/remotion render:sample # CLI render (needs sample video)
```

## Definition of done

1. Upload a real screen recording
2. Add ≥3 markers with zoom + ripple + title
3. Preview in browser
4. Export 1080p MP4 in < 20 min total
5. Output beats CapCut same recording in 5s side-by-side

## Related

- [PROJECT-SCHEMA.md](./PROJECT-SCHEMA.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [DECISIONS.md](./DECISIONS.md)
