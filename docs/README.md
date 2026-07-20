# Arco Documentation

Arco automates the working relationship between a product owner and a senior
motion designer. The documentation is organized around that outcome.

| Document | Purpose |
|----------|---------|
| [DECISIONS.md](./DECISIONS.md) | Locked product, quality, AI, and rendering decisions |
| [ROADMAP.md](./ROADMAP.md) | Delivery phases for the automated motion-design workflow |
| [STATUS.md](./STATUS.md) | Current implementation, verified behavior, and open risks |
| [TECHNICAL.md](./TECHNICAL.md) | Architecture, project contract, compiler, preview, and export |
| [PRODUCT.md](./PRODUCT.md) | Positioning, audience, workflow, and product experience |
| [BUSINESS.md](./BUSINESS.md) | Pricing, market, competition, and go-to-market |
| [AUDIO.md](./AUDIO.md) | Music, voice, licensing, and mix standards |
| [WEEK-SHIP.md](./WEEK-SHIP.md) | Short-horizon execution checklist |
| [REFERENCE-MOTIONFLARE.md](./REFERENCE-MOTIONFLARE.md) | Competitor workflow reference |
| [`apps/web/DESIGN.md`](../apps/web/DESIGN.md) | Web product design system |

## Product Test

Every feature should answer one of these questions:

1. Does it collect material a strong motion designer would need?
2. Does it make a deliberate creative decision from that material?
3. Does it let the user review and revise that decision without starting over?
4. Does it improve the final video's craft, fidelity, or delivery reliability?

Work that answers none of these questions is outside the current product goal.

## Code Map

```text
apps/web                 client workflow and live preview
apps/api                 durable projects, AI, voice, uploads, and renders
packages/project-schema  shared creative and production contract
packages/hyperframes     deterministic motion compiler and renderer
```
