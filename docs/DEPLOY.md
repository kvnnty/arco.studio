# Deploy checklist

## Services

| Service | Notes |
|---------|--------|
| **Web** | Next.js 15 — `apps/web` |
| **API** | NestJS — `apps/api` |
| **Render worker** | Runs inside API process (`RenderProcessorService`) |
| **Postgres** | Prisma — `DATABASE_URL` |
| **S3** | Recordings, thumbnails, rendered MP4s |
| **Stripe** | Subscriptions + webhooks |

## Environment

Copy and fill:

- [`apps/api/.env.example`](../apps/api/.env.example)
- [`apps/web/.env.example`](../apps/web/.env.example)

Run after schema changes:

```bash
pnpm --filter @arco/api exec prisma db push
```

## Stripe setup

1. Create **Product**: Arco Pro
2. Create **Price**: $29/month recurring → set `STRIPE_PRICE_PRO_MONTHLY`
3. Create **Coupon**: $20 off once (Launch Offer → $9 first invoice) → set `STRIPE_COUPON_LAUNCH`
4. Enable **Customer Portal** in Stripe Dashboard
5. Add webhook endpoint: `https://your-api.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
6. Set `STRIPE_WEBHOOK_SECRET` from webhook signing secret

Local webhook testing:

```bash
stripe listen --forward-to localhost:8000/api/billing/webhook
```

## Build & run

```bash
pnpm install
pnpm --filter @arco/api run build
pnpm --filter @arco/web run build
```

Production:

```bash
pnpm --filter @arco/api run start:prod
pnpm --filter @arco/web run start
```

## FFmpeg

Remotion render requires **FFmpeg** on the API host PATH.

## Paid-only model

- New users register with `planStatus: inactive`
- Dashboard/editor blocked until Stripe checkout completes
- Launch Offer: $9 first month via coupon, then $29/mo
- Exports gated at `POST /renders` (15/month default via `EXPORT_ALLOWANCE_PRO`)

## URLs to configure

| Variable | Example |
|----------|---------|
| `STRIPE_SUCCESS_URL` | `https://app.arco.video/dashboard/billing?checkout=success` |
| `STRIPE_CANCEL_URL` | `https://app.arco.video/dashboard/billing?checkout=canceled` |
| `STRIPE_PORTAL_RETURN_URL` | `https://app.arco.video/dashboard/billing` |
| `CORS_ORIGIN` | `https://app.arco.video` |
| `API_PUBLIC_URL` | `https://api.arco.video` |
