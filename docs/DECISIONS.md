# Product & technical decisions (locked)

Record of decisions from product discovery. Change deliberately—update this file when pivoting.

## Category & positioning

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Category | SaaS launch **motion system** | Avoid AI video commodity |
| Buyer | **B2B** (founder = smallest B2B) | Businesses pay for launches |
| Creative reference | Linear, Raycast, Vercel, Framer | Music + UI + text, not VO ads |
| Anti-positioning | “AI video generator”, text-to-video | Price war, low defensibility |

## MVP customer

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary ICP | **Founder-first** indie SaaS | Fastest sale, matches MVP |
| Not MVP ICP | Motion-designer-first timeline | Months to ship; AE dependency |
| Not MVP ICP | B2C creators | Low WTP, CapCut |

## Audio

| Decision | Choice | Rationale |
|----------|--------|-----------|
| MVP audio | **Music-only** (5–10 curated tracks) | Premium, cheaper, faster pipeline |
| No MVP | TTS, ElevenLabs, VO sync | Generic feel, complexity |
| No MVP | AI music generation | Legal + quality risk |
| No MVP | AI presenters / avatars | Different product category |
| Storyboard | `headline` / `subheadline` / `duration` | Not `voiceover` script |

See [AUDIO.md](./AUDIO.md).

## Video generation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Render engine | **Remotion** | Deterministic quality moat |
| UI source | **Real screenshots** | No hallucinated dashboards |
| No MVP | Runway/Veo text-to-video | Phase 2 B-roll only if needed |
| Output | 1080p MP4, 30s default | Launch + website hero |

## Integrations timeline

| Tool | Month 1 | Later |
|------|---------|-------|
| URL ingest | Yes | — |
| Screenshots | Yes | — |
| Figma | Manual PNG export | Plugin → scene JSON |
| After Effects | **No** | Plugin reads Arco JSON (Phase 2) |
| `.aep` import | **Never** as MVP goal | Not feasible solo |
| Lottie | Optional | Logo stings |
| Scene JSON export | Yes | AE contract |

See [INTEGRATIONS.md](./INTEGRATIONS.md).

## After Effects (explicit)

| Claim | Reality |
|-------|---------|
| Perfect AE integration in 1 month solo | **No** |
| Month 1 | Arco scene JSON + MP4 out |
| Month 2–3 | AE plugin: JSON → comps/layers (subset) |
| Round-trip AE ↔ Arco | Not v1 |
| Arco becomes mini After Effects | **Anti-goal** |

## Business model

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Start model | **Model A** self-serve $19–99 | Fast validation |
| Expand | **Model B** $100–500 teams | After PMF |
| Later | **Model C** agencies | High ARPU |
| Monetization | Subscription + render credits | Margin on render |
| First revenue | $29 founding, 5 users in 14 days | Validation |

See [BUSINESS.md](./BUSINESS.md).

## 30-day MVP scope

### In scope

- URL → analysis → text storyboard  
- Motion template(s) in Remotion  
- Music picker  
- Screenshot upload  
- Preview + MP4 export  
- scene JSON download  

### Out of scope

- Voiceovers, avatars, text-to-video  
- AE plugin, Figma plugin  
- Timeline editor, `.aep`  
- Team billing (Stripe OK for founding)  
- 9:16 (unless Week 4 stretch)  

See [MVP-ROADMAP.md](./MVP-ROADMAP.md).

## Quality bar

| Decision | Choice |
|----------|--------|
| Pass test | 5s comparison vs Canva/InVideo |
| Aesthetic | Premium dark, crafted motion |
| Narrative | On-screen text carries story; music carries emotion |

See [OUTPUT-SPEC.md](./OUTPUT-SPEC.md).

## Money hypothesis

> Arco wins as a **conversion-driven SaaS marketing asset generator**, not a video tool.

People pay for: designer replacement, launch speed, Stripe-level polish—not AI features.

---

## Open questions (not locked)

- [ ] First template name: `launch-30` only or + `feature-45`?  
- [ ] LLM provider for storyboard copy  
- [ ] Render: local worker vs Lambda first  
- [ ] Annual pricing when to introduce  

---

## Related docs

- [VISION.md](./VISION.md)  
- [PRODUCT.md](./PRODUCT.md)  
- [BUSINESS.md](./BUSINESS.md)  
