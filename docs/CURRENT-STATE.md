# Current state (codebase)

**Last updated:** Full documentation pack (product, business, GTM, technical).

## Repository

| Path | Status |
|------|--------|
| `apps/web` | Next.js landing, waitlist, Raycast UI |
| `apps/api` | NestJS scaffold |
| `packages/typescript-config` | Shared TS |
| `docs/` | **19 docs** — see [README.md](./README.md) |
| `apps/web/DESIGN.md` | Visual design system |

## Product implementation

| Capability | Status |
|------------|--------|
| Waitlist | ✅ `joinWaitlist` + optional webhook |
| Landing | ✅ Waitlist-only (no demo video yet) |
| `packages/scene-schema` | ❌ Not started |
| `packages/remotion` | ❌ Not started |
| URL ingest | ❌ |
| Storyboard / LLM | ❌ |
| Music library | ❌ |
| MP4 render | ❌ |
| Stripe / billing | ❌ |

## Locked product direction (see [DECISIONS.md](./DECISIONS.md))

- B2B SaaS founders first (not B2C)
- Music + text + real UI (no VO in MVP)
- Remotion render + scene JSON
- No AE / Figma plugins in month 1
- Model A pricing → founding $29

## Commands

```bash
pnpm install
pnpm dev
```

## Environment

| Variable | App | Purpose |
|----------|-----|---------|
| `WAITLIST_WEBHOOK_URL` | web | Waitlist POST `{ email }` |

## Next build steps

1. [MVP-ROADMAP.md](./MVP-ROADMAP.md) Week 1 — `scene-schema` + `remotion`
2. Golden demo MP4 for [LANDING.md](./LANDING.md)
3. [GTM.md](./GTM.md) 14-day founding revenue

## Documentation map

All strategy and build knowledge lives under `docs/`. Entry point: [README.md](./README.md).
