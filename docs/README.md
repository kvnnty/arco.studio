# Arco documentation

Product demo & motion design workflow — upload recordings or screenshots, enhance with motion presets, edit, export.

## Docs

| Doc | Contents |
|-----|----------|
| **[WEEK-SHIP.md](./WEEK-SHIP.md)** | **Active (19–26 July)** — one-week finish: M1–M4 + soft launch |
| [PRODUCT.md](./PRODUCT.md) | Vision, positioning, workflow, ICP, landing copy |
| [BUSINESS.md](./BUSINESS.md) | Pricing, market, competition, GTM |
| [STATUS.md](./STATUS.md) | **What's shipped** — snapshot + feature matrix + eng checklist |
| [ROADMAP.md](./ROADMAP.md) | Polish phases, backlog, screenshot/voice initiative |
| [TECHNICAL.md](./TECHNICAL.md) | Auth, deploy, schema, output spec, prompts, integrations |
| [AUDIO.md](./AUDIO.md) | BGM licensing, voice, mix standards |
| [DECISIONS.md](./DECISIONS.md) | Locked product & technical choices |
| [REFERENCE-MOTIONFLARE.md](./REFERENCE-MOTIONFLARE.md) | Motionflare competitor reference + what to borrow |
| [`apps/web/DESIGN.md`](../apps/web/DESIGN.md) | Visual design system |

Agent rule: `.cursor/rules/week-ship.mdc` (always apply) → follow WEEK-SHIP.md.

## Quick start

```bash
pnpm install
pnpm --filter @arco/api exec prisma db push
pnpm --filter @arco/api dev
pnpm --filter @arco/web dev
pnpm --filter @arco/remotion dev   # Remotion Studio
```

Code: `packages/project-schema` · `packages/remotion` · `apps/web` · `apps/api`
