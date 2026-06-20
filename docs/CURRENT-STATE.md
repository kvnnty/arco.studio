# Current state

**Updated:** Phase 5 — paid-only billing + ship polish (June 2026).

## Implemented

| Area | Status |
|------|--------|
| Auth + API JWT bridge | Done |
| Durable projects (API + S3 + sync) | Done |
| Dashboard create flow | `/dashboard/projects/new` + example brand chips |
| Brand from URL | `POST /brand/analyze-url` + chat analyze pipeline |
| Customize panel | Logo, colors, music, volume |
| Export MP4 | Render worker + stages (queued → rendering → uploading) |
| **Stripe billing** | Launch Offer $9 → $29/mo Pro, no free tier |
| **Subscription gate** | API + dashboard paywall until checkout |
| **Export allowance** | 15 exports/period, tracked in DB |
| Chat SSE | `POST /ai/chat/stream` |
| Scene drag-reorder | Thumbnail strip |
| Error toasts | Sonner in dashboard + export flows |

## Core loop

```
Sign up → Billing (Launch Offer $9) → Create → Editor → Export MP4 → Download
```

## Local dev

```bash
pnpm install
pnpm --filter @arco/api dev
pnpm --filter @arco/web dev
```

Stripe test mode required for checkout. See [`DEPLOY.md`](./DEPLOY.md).

## Next (not in this slice)

- Landing page polish
- Vision / click detection
- Team tier Stripe products
- Real activity feed
