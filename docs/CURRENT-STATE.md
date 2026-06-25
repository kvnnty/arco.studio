# Current state

**Updated:** Studio tier ($59), project-slot billing, 4K export (June 2026).

## Implemented

| Area | Status |
|------|--------|
| **Billing tiers** | Intro $9 · Pro $29 · **Studio $59** |
| **Project slots** | 5 / 15 / unlimited — delete to free a slot |
| **Exports** | Unlimited re-exports per project |
| **Studio export** | 4K + batch social format pack |
| Screenshot storyboard + ElevenLabs VO + custom music (Pro+) | Done |
| Export MP4 | Render worker + screenshot + recording compositions |

## Plans at a glance

| Plan | Active projects | Export |
|------|-----------------|--------|
| Intro | 5 | 1080p 16:9 |
| Pro | 15 | 1080p all formats |
| Studio | Unlimited | 4K + social pack |

## Local dev

```bash
pnpm install
pnpm --filter @arco/api exec prisma db push
pnpm --filter @arco/api dev
pnpm --filter @arco/web dev
```

Add `STRIPE_PRICE_STUDIO_MONTHLY` in `apps/api/.env` for Studio checkout.
