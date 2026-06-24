# Current state

**Updated:** ElevenLabs voiceover (Phase 3) shipped (June 2026).

## Implemented

| Area | Status |
|------|--------|
| Auth + API JWT bridge | Done |
| Durable projects (API + S3 + sync) | Done |
| **Dashboard quick-create** | Recording + Screenshots tabs, BGM + Voice pickers |
| **Screenshot storyboard** | Upload 3–10 PNGs → AI storyboard → editor → export |
| **ElevenLabs voiceover** | Per-scene TTS, BGM ducking, mute option |
| **BGM library** | 5 tracks with preview modal on create + customize panel |
| **Template gallery** | `/dashboard/templates` + blueprint-driven drafts |
| Brand from URL | `POST /brand/analyze-url` + chat analyze pipeline |
| Export MP4 | Render worker + screenshot + recording compositions |
| **Export allowance** | Charged on **completed** render only |
| **Stripe billing** | Launch Offer $9 → $29/mo Pro |

## Core loop

```
Sign up → Billing → Create (recording or screenshots + BGM/voice) → Editor → Export MP4
```

## Local dev

```bash
pnpm install
pnpm --filter @arco/api dev
pnpm --filter @arco/web dev
```

Set `ELEVENLABS_API_KEY` in `apps/api/.env` for voice generation. See [`DEPLOY.md`](./DEPLOY.md).

## Next

- Phase 4: Custom music upload (Pro)
- Phase 5: Hybrid recording + screenshots, i18n
- Licensed BGM tracks ([LICENSES-MUSIC.md](./LICENSES-MUSIC.md))
- VO on recording-mode projects (optional)
- Vision / click detection, landing demo video, team tier
