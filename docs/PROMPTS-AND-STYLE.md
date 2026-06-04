# Visual style & AI prompts reference

Reference for output quality and optional Phase 2 B-roll generation. **MVP does not use text-to-video for UI.**

## “Clean product promo” definition

Arco output should match modern SaaS launch aesthetic:

- Minimalist, modern, product-forward  
- Smooth camera (slow pans, close-ups, UI zoom)  
- Professional lighting on abstract backgrounds (B-roll only)  
- Neutral or premium backgrounds  
- Clear typography, subtle motion graphics  
- High-end commercial look (Apple, Samsung, luxury SaaS)  
- Short scenes emphasizing features and benefits  

## Reference brands

Linear, Raycast, Vercel, Framer — typically:

- Music bed  
- Motion graphics  
- Product UI (real)  
- Text callouts  
- **No narrator**

---

## Optional B-roll prompt (Phase 2 only)

Use for abstract segments between UI scenes. **Never** for product UI (use screenshots).

```
Create a clean, modern abstract B-roll clip for a SaaS brand.
Cinematic studio lighting, premium white or dark neutral background,
smooth slow camera pan, shallow depth of field, minimal elements,
professional commercial advertising style, 4K, seamless loop-friendly,
no people, no text, no user interface, no logos.
```

### Physical product variant (out of MVP scope)

Add: material, color, key feature macro shots.

---

## SaaS-specific content rules

| Element | Source |
|---------|--------|
| Dashboard UI | User screenshots / Figma |
| Headlines | Storyboard text scenes (LLM + user edit) |
| Logo | User upload or OG image |
| Music | Curated library ([AUDIO.md](./AUDIO.md)) |
| VO | **Not MVP** |

---

## LLM prompts (storyboard — draft)

### System intent

You write **on-screen text only** for a 30-second SaaS launch video. No voiceover script. Tone: confident, minimal, devtool/SaaS audience. No hype clichés (“revolutionary”, “game-changing”).

### User context template

```
Product URL: {url}
Title: {title}
Description: {description}
Features detected: {features}

Generate 5-7 storyboard scenes with:
- headline (max 8 words)
- optional subheadline (max 12 words)
- durationSeconds (total ~30)

Scene types: hook, feature (x3), cta.
Output JSON only matching Storyboard schema.
```

See [SCENE-SCHEMA.md](./SCENE-SCHEMA.md).

---

## Design system for web + video text

Video text should align with [`apps/web/DESIGN.md`](../apps/web/DESIGN.md):

- Background `#07080a` or brand kit  
- Primary text `#f9f9f9`  
- Accent `hsl(202, 100%, 67%)` (~`#55b3ff`)  
- Inter, positive letter-spacing on dark  
- Weight 500–600 for headlines  

---

## Related docs

- [OUTPUT-SPEC.md](./OUTPUT-SPEC.md)  
- [AUDIO.md](./AUDIO.md)  
- [PRODUCT.md](./PRODUCT.md)  
