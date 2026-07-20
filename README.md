# Arco

Arco is an AI motion-design studio for product owners.

Users provide a product brief, brand system, real product screens, and
references. Arco turns that material into an editable creative direction,
storyboard, designed motion draft, revision workflow, and premium video
delivery package.

The product is not a prompt-to-video toy. AI makes bounded creative decisions;
Arco's tested video compiler owns typography, layout, camera, transitions,
timing, asset fidelity, and render quality.

## Workspace

| Path | Responsibility |
|------|----------------|
| `apps/web` | Next.js intake, dashboard, editor, review, and HyperFrames preview |
| `apps/api` | NestJS projects, AI direction, voice, uploads, billing, and renders |
| `packages/hyperframes` | Arco video compiler, quality gates, asset staging, and MP4 export |
| `packages/project-schema` | Shared project, creative-direction, scene, audio, and template contracts |
| `packages/typescript-config` | Shared TypeScript configuration |

## Develop

```bash
pnpm install
pnpm --filter @arco/api exec prisma generate
pnpm --filter @arco/api exec prisma db push
pnpm --filter @arco/api dev
pnpm --filter @arco/web dev
```

HyperFrames needs Node.js 22+, FFmpeg, and its managed Chrome browser:

```bash
pnpm --filter @arco/video exec hyperframes browser ensure
```

## Video Checks

```bash
pnpm --filter @arco/video test
pnpm --filter @arco/video lint
pnpm video:preview
pnpm video:render
```

The sample export runs Arco's quality gate, stages all local assets and fonts,
runs strict HyperFrames lint, and renders a high-quality MP4.

See [docs/DECISIONS.md](./docs/DECISIONS.md) for the product contract and
[docs/ROADMAP.md](./docs/ROADMAP.md) for the quality-moat plan.
