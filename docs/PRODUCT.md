# Product

## Primary ICP (MVP)

**Solo / small-team SaaS founders** launching or relaunching a product who:

- Do not know After Effects
- Need a polished promo for landing page, Product Hunt, LinkedIn, paid ads
- Have Figma and/or screenshots, not a motion team
- Prefer **music + motion + text** over AI voiceovers (modern SaaS launch style)

## Secondary ICP (Phase 2+)

- Growth marketers at B2B SaaS (repeat ads, feature launches)
- Small agencies white-labeling SaaS launch videos
- Motion designers using Arco as **80% draft** → refine in AE

## Critical decision: founder-first vs designer-first

| | Founder-first (MVP) | Designer-first |
|--|---------------------|----------------|
| Goal | Video in minutes, no AE | Editable draft for AE polish |
| UI | Wizard, templates, few knobs | Timeline, layers, comps |
| Audio | Curated music tracks | Same + later VO if requested |
| Integration | Figma + screenshots | AE plugin, Lottie, JSON |
| Time to ship | ~30 days possible | Months |

**MVP: founder-first.** Designer workflow via **exported scene JSON + later AE plugin**.

## Core job-to-be-done

> “I’m launching my SaaS next week. I need a premium promo that looks like Linear/Raycast/Vercel—not a templated AI ad with a narrator.”

## User flow (MVP)

```
URL
  → product understanding (AI analysis)
  → storyboard (text scenes, not voice script)
  → pick motion template
  → pick music track (curated library)
  → preview
  → render MP4
  → download + optional scene JSON
```

## MVP inputs

- Product URL (marketing site)
- 3–8 screenshots (dashboard, hero, features)
- Optional: Figma export (frames, text, colors)
- Brand: logo, primary colors (auto-detect + override)
- Music: user selects from **5–10 curated tracks**

## MVP outputs

- MP4 (1080p, 16:9)
- **Scene JSON** (composition contract for future AE plugin)
- **No voiceover** in v1

## Storyboard model (text-driven, not VO)

The motion system carries the message visually. Storyboard slots generate **copy for on-screen text**, not narration.

```json
{
  "scenes": [
    {
      "id": "hook",
      "headline": "Stop losing files",
      "subheadline": null,
      "durationSeconds": 3
    },
    {
      "id": "feature-1",
      "headline": "Sync across devices",
      "subheadline": "Every folder, every team",
      "durationSeconds": 4
    },
    {
      "id": "cta",
      "headline": "Start free today",
      "subheadline": null,
      "durationSeconds": 3
    }
  ]
}
```

**Do not generate** (MVP):

```json
{
  "voiceover": "Manage your files effortlessly..."
}
```

## Scene structure (fixed templates)

Typical **30s launch** structure:

1. Logo + tagline (text)
2. Problem / outcome hook (text)
3. Feature 1–3 (UI + text callout)
4. Optional metric / social proof (text)
5. CTA (text)

Templates own motion (easing, stagger, UI pan); user edits **text slots** and assets.

## Audio (MVP)

See [AUDIO.md](./AUDIO.md).

- Curated royalty-safe music library (5–10 tracks)
- User picks mood: Ambient Tech, Modern SaaS, Corporate Clean, Startup Launch, Energetic Product Reveal
- **No** music generation, **no** VO, **no** avatars

## Out of scope (30-day MVP)

- Voiceovers, ElevenLabs, pronunciation, multilingual audio
- AI presenters / avatars
- Text-to-video B-roll (Runway/Veo)
- `.aep` import/export, full timeline editor
- Round-trip AE editing
- Music generation
- Team/agency features (can stub)

## Deferred (only if users ask)

- Optional VO track
- AI B-roll between scenes
- 9:16 vertical export
- Auto-captions as SRT (on-screen text scenes are MVP)

## Quality bar

Pass the **5-second test**: side-by-side with InVideo/Canva, Arco looks **crafted** like Linear/Raycast—not slideshow, not “AI ad voice.”

## Messaging

Lead with **launch video system for SaaS**, not “AI video” or “AI voice.”

## Business context

- Buyer: **B2B** (see [BUSINESS.md](./BUSINESS.md))
- First users: [ICP.md](./ICP.md)
- Launch plan: [GTM.md](./GTM.md)
- Locked scope: [DECISIONS.md](./DECISIONS.md)
