# Music licenses

**Status:** Development placeholders (June 2026)

## Current assets

All tracks under `apps/web/public/music/` and `packages/remotion/public/music/`:

| Track ID | File | Status |
|----------|------|--------|
| `modern-saas` | `modern-saas.mp3` | Placeholder (lavfi sine bed) |
| `ambient-tech` | `ambient-tech.mp3` | Dev copy of `modern-saas.mp3` |
| `corporate-clean` | `corporate-clean.mp3` | Dev copy of `modern-saas.mp3` |
| `startup-launch` | `startup-launch.mp3` | Dev copy of `modern-saas.mp3` |
| `energetic-reveal` | `energetic-reveal.mp3` | Dev copy of `modern-saas.mp3` |

**Before public launch:** replace each file with a properly licensed track and update this document with source, license type, and attribution requirements.

## Recommended sources

- Epidemic Sound / Artlist (subscription)
- Pixabay / Uppbeat (royalty-free with attribution)
- Commission original beds

## Catalog in code

Track metadata: [`apps/web/src/lib/editor/music-tracks.ts`](../apps/web/src/lib/editor/music-tracks.ts)

Render mapping: [`packages/remotion/src/components/MusicBed.tsx`](../packages/remotion/src/components/MusicBed.tsx)
