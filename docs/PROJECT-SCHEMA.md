# Arco Project schema (v1)

Source of truth: `packages/project-schema` — validate with Zod.

The **Arco Project** replaces the old scene-only JSON. A project includes a **recording** + **markers** + **effects**.

## ArcoProject

```typescript
type ArcoProject = {
  version: "1";
  meta: {
    title: string;
    fps: number;        // default 30
    width: number;      // default 1920
    height: number;     // default 1080
  };
  recording: {
    /** Path or URL to uploaded MP4 */
    src: string;
    durationMs: number;
  };
  markers: Marker[];
  brand?: {
    primary: string;
    background: string;
    logoSrc?: string;
  };
  audio?: {
    musicId?: string;
    volume?: number;    // 0–1, default 0.85
  };
};
```

## Marker

```typescript
type EffectType =
  | "smooth-zoom"
  | "click-ripple"
  | "title-card"
  | "spotlight"
  | "feature-callout"
  | "transition";

type MarkerEffect = {
  type: EffectType;
  scale?: number;       // smooth-zoom, default 1.2
  intensity?: number;   // ripple/spotlight 0–1
};

type Marker = {
  id: string;
  startMs: number;
  durationMs: number;   // default 1500
  effects: MarkerEffect[];
  callout?: {
    text: string;
    subtext?: string;
  };
};
```

## AI vs presets

- **AI (later):** proposes `markers[]` from recording analysis
- **Presets:** `effects[].type` maps to Remotion components — motion designed once

## Export settings (v2)

```typescript
type ExportSettings = {
  format: "16:9" | "9:16" | "1:1";
  includeMusic: boolean;
};
```

## Sample

See `packages/remotion/src/sample/golden-project.json`.

## Migration from scene-schema

Old `SCENE-SCHEMA.md` described URL→storyboard launch videos. v1 MVP is **recording-first**. URL/intro cards become optional `brand` + bookend markers in v2.
