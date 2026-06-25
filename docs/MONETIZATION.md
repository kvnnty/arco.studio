# Monetization

> Full business analysis: [BUSINESS.md](./BUSINESS.md) · ICP: [ICP.md](./ICP.md) · GTM: [GTM.md](./GTM.md)

## Model

**Paid-only subscription** — no free tier. Prevents multi-account abuse.

**Launch Offer:** $9 first billing cycle (full Pro), then **$29/month**. Cancel anytime. 14-day money-back via Stripe refunds.

### Export allowance (not credits)

Arco meters **active projects** per plan — not exports. Delete a project to free a slot.

| Metered | Not metered (included in subscription) |
|---------|----------------------------------------|
| **Active projects** in workspace | Re-exports per project, AI, preview, chat |

**Product rule:** Users can re-export the same project unlimited times. Intro/Pro must delete a project to create a new one when at cap.

### Public

| Tier | Price | Includes |
|------|-------|----------|
| Intro | $9/mo | 5 active projects, 1080p 16:9 |
| Pro | $29/mo | 15 active projects, all formats 1080p, brand, custom music |
| Studio | $59/mo | Unlimited projects, 4K, social export pack |

### Founding note

Original founding tier ($29/mo flat) is superseded by Launch Offer pricing for new signups.

### Model B (Phase 2 — teams)

| Tier | Price | Includes |
|------|-------|----------|
| Team | $149–499/mo | Seats, unlimited drafts, brand kit, priority render |

### Model C (Phase 3 — agencies)

| Tier | Price | Includes |
|------|-------|----------|
| Agency | $99–300/mo | Batch exports, scene JSON, white-label (roadmap) — **export allowance**, not per-scene credits |

## Add-ons (Phase 2+)

- **Extra exports** per month (Stripe add-on), not opaque “credit packs”
- Premium template packs  
- Marketplace revenue share (designers)  

## Value anchors (what justifies price)

| Anchor | Amount / claim |
|--------|----------------|
| Freelancer replacement | $300–$2,000 per video |
| Founder time saved | 2–5 days → &lt;15 minutes |
| Hourly equivalent | $50–150/hr × hours saved |
| VO API cost in MVP | Low until Phase 3 (ElevenLabs); draft/edit still unmetered |
| Outcome | “Launch this week”; “look funded” |

## MRR scenarios

### Model A (self-serve)

| Users | ARPU | MRR |
|-------|------|-----|
| 50 | $25 | $1.25K |
| 200 | $30 | $6K |
| 500 | $35 | $17.5K |
| 2,000 | $40 | $80K |

### Model B (teams)

| Companies | ARPU | MRR |
|-----------|------|-----|
| 100 | $150 | $15K |
| 500 | $300 | $150K |

## Revenue phases

| Phase | MRR | Milestone |
|-------|-----|-----------|
| Validation | $0 → $2K | 5–80 paying founders |
| PMF signal | $5K → $20K | Repeat usage, referrals |
| Niche scale | $50K → $150K | Teams + agencies + ad variants |
| Stalled | &lt;$3K | Wrong positioning or quality |

## What drives willingness to pay

1. **Designer replacement** — clear $ savings  
2. **Launch speed** — date-driven urgency  
3. **Polish** — “Stripe/Linear-level” marketing  
4. **Conversion belief** — homepage / ads (qualitative early, A/B later)  

## What kills pricing power

- “AI video generator” positioning  
- Inconsistent render quality  
- One-and-done (no feature/ad loop)  
- $9/mo race to bottom  
- Adding generic VO (feels like cheap ads)  

## Retention loops (revenue durability)

| Loop | Billing impact |
|------|----------------|
| Feature launch video | Monthly active for shipping teams |
| Changelog / what’s new | Substack + social cadence |
| Ad variants (9:16, 6s hook) | Paid growth teams stay subscribed |
| Rebrand / pricing page | Spiky but high WTP |

## 14-day validation target

**5 × $29 founding = $145 MRR** — proves willingness to pay, not scale.

See [GTM.md](./GTM.md).

## Annual plans

Introduce when monthly churn is measured: typically **2 months free** on annual.

## Related docs

- [MOTIONFLARE-INSPIRATION.md](./MOTIONFLARE-INSPIRATION.md) — UX to borrow; export billing vs Motionflare  
- [BUSINESS.md](./BUSINESS.md) — models A/B/C, money engines, risks  
- [LANDING.md](./LANDING.md) — pricing copy  
- [DECISIONS.md](./DECISIONS.md) — locked business choices  
