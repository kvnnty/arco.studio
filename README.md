# Arco

**Product demo & motion design workflow** — upload web/mobile app recordings, enhance with zooms, ripples, and callouts, edit, export.

## Build MVP

```bash
pnpm install
pnpm --filter @arco/remotion dev    # Remotion Studio — preview composition
```

**Docs:** [docs/README.md](./docs/README.md) · **Build plan:** [docs/MVP-BUILD.md](./docs/MVP-BUILD.md)

## Packages

| Package | Description |
|---------|-------------|
| `@arco/project-schema` | ArcoProject types + Zod validation |
| `@arco/remotion` | Motion compositions + presets |
| `@arco/web` | Next.js app (waitlist → editor) |

## Quick start (Week 1)

1. `pnpm --filter @arco/remotion dev` — see golden project with placeholder UI
2. Edit `packages/remotion/src/sample/golden-project.json` markers
3. Week 2: upload + editor in `apps/web`

## Scripts

```bash
pnpm dev                              # turbo — all apps
pnpm --filter @arco/remotion render:sample
```
