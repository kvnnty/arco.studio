# Product & technical decisions

## Category (locked)

| Decision | Choice |
|----------|--------|
| What we are | **Cost-effective Motion.so** — brief + real UI assets → studio-feeling motion video |
| What we're not | Generative video (Runway/Sora), CapCut clone, AI-invented UI, physical product ads |
| Product center | **Arco Project** (editable), not one-shot MP4 |
| Scope | **Web + mobile tech** product demos only |
| Quality bar | Framed UI + paced VO + branded type + real music — not a captioned slideshow |

## Input (locked)

| Decision | Choice |
|----------|--------|
| **Primary input** | **Screenshots (3–10) + URL and/or brief** |
| Secondary | Screen recording (advanced tab — kept, not hero) |
| Brand / templates | URL scrape → colors, logo, tone; style presets |
| Not primary | Prompt-only video, stock footage, text-to-video |

## AI (locked)

| AI does | AI does NOT |
|---------|-------------|
| Analyze URL / brand | Invent product UI |
| Draft storyboard scenes (copy, VO scripts, timing) | Click / cursor / pause CV detection (out of active roadmap) |
| Refine copy via chat | Replace Remotion preset motion system |
| Drive TTS (ElevenLabs) per scene | Generate motion from scratch with generative video models |

**Motion:** Remotion presets — device frames, Ken Burns, transitions, title treatments (`ken-burns-*`, fade/push/scale/blur/slide, etc.).

## Workflow (locked)

| Step | Owner |
|------|--------|
| Analyze → Draft → Voice → Layout → Ready | Pipeline UX (Motionflare-cost theater, real work per step) |
| Preview + hand edit | Editor (scene strip, inspector) |
| Chat refine | Scene copy / VO / tone — no full rebuild required |
| Export | Remotion → MP4 |

## Audio (locked)

| Decision | Choice |
|----------|--------|
| BGM | Curated licensed library (placeholders are launch blockers) |
| VO / TTS | ElevenLabs on screenshot path (shipped) |
| Custom music | Pro+ upload with rights checkbox |
| Out of scope | AI-generated music, avatar presenters |

## Editor (locked)

| Primary (screenshot) | Secondary (recording) | Later |
|----------------------|----------------------|--------|
| Scene strip + inspector | Marker list + effects | Full timeline |
| Motion + transition per scene | Zoom, ripple, callout | Freeform keyframes |
| Canva-depth | Same | After Effects-depth |

## Buyers (locked)

| Tier | Segment |
|------|---------|
| Revenue | Indie hackers, solo product owners |
| Funnel | Hackathons, students |
| Avoid | Agencies/teams as ICP; general B2C video |

## Business (locked)

| Decision | Choice |
|----------|--------|
| Quality bar | **95%** launch-ready or users leave for CapCut / agency |
| Billing model | **Subscription + project slots** — not credit packs |
| What counts | Successful MP4 export only (unlimited re-exports per project) |
| Iteration | Unlimited draft/regen/preview within subscription |
| Plans | Intro ($9) · Pro ($29) · Studio ($59) |
| No team tier | No seats, shared workspaces, or enterprise SSO |

See [BUSINESS.md](./BUSINESS.md) · [REFERENCE-MOTIONFLARE.md](./REFERENCE-MOTIONFLARE.md#part-2--what-to-borrow-and-avoid).

## Active roadmap vs backlog

| Priority | Work |
|----------|------|
| **Now** | Screenshot Motion pipeline UX, Remotion visual quality, chat refine + re-TTS, licensed BGM |
| **Secondary** | Recording path polish (heuristic draft only) |
| **Backlog / cut** | CV click detection, vision screen labels, hybrid B-roll, generative UI |
| **Later** | Figma / AE plugins, GitHub release hook, Redis render queue if beta needs it |

## Integrations timeline

| Tool | When |
|------|------|
| Remotion render | Shipped |
| Screenshot storyboard + TTS | Shipped |
| Motion pipeline UX (screenshot) | Active |
| Device frames + real transitions | Active |
| Figma / AE | Month 3+ |
| GitHub release hook | Month 6+ |

## Open questions

- [x] SQLite vs Postgres for projects — **Postgres + Prisma**
- [ ] Render local vs Lambda first
- [ ] Sample screenshot set bundled for demo

## Under review

| Topic | Status |
|-------|--------|
| ElevenLabs VO | ✅ Shipped (screenshot mode) |
| Custom music upload | ✅ Shipped (Pro+) |
| Hybrid recording + screenshots | Backlog — not active |
| CV / click detection | **Cut from active plan** |

## Related

- [REFERENCE-MOTIONFLARE.md](./REFERENCE-MOTIONFLARE.md) — UX reference; target = Motion.so result quality via Motionflare-cost pipeline
- [ROADMAP.md](./ROADMAP.md) — active Motion pipeline delivery
- [STATUS.md](./STATUS.md) — shipped vs gaps
