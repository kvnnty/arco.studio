# Arco

**B2B SaaS launch motion system** — turn a product URL and screenshots into a music-driven launch video in minutes. No After Effects. No AI voiceover.

## Documentation

**[docs/README.md](./docs/README.md)** — full index (product, business, GTM, technical).

| Start here | Doc |
|------------|-----|
| Build MVP | [docs/MVP-ROADMAP.md](./docs/MVP-ROADMAP.md) |
| Business & money | [docs/BUSINESS.md](./docs/BUSINESS.md) |
| Locked decisions | [docs/DECISIONS.md](./docs/DECISIONS.md) |
| First customers | [docs/ICP.md](./docs/ICP.md) + [docs/GTM.md](./docs/GTM.md) |

## Development

```bash
pnpm install
pnpm dev
```

## Apps

| App | Path | Description |
|-----|------|-------------|
| web | `apps/web` | Next.js landing + waitlist |
| api | `apps/api` | NestJS API (scaffold) |

## Environment

| Variable | App | Description |
|----------|-----|-------------|
| `WAITLIST_WEBHOOK_URL` | web | Optional webhook for waitlist signups |

## Stack (planned)

- **Remotion** — render engine  
- **scene JSON** — composition contract ([docs/SCENE-SCHEMA.md](./docs/SCENE-SCHEMA.md))  
- **Curated music** — no VO in MVP ([docs/AUDIO.md](./docs/AUDIO.md))  
