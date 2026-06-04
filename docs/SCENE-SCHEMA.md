# Scene schema (v1 draft)

Contract between ingest, web app, Remotion, and future AE plugin. Validate with Zod in `packages/scene-schema`.

## Storyboard (user-facing)

Generated from URL analysis; edited in UI before render.

```typescript
type StoryboardScene = {
  id: string;
  headline: string;
  subheadline?: string;
  durationSeconds: number;
  /** Optional screenshot asset id for ui-frame scenes */
  assetId?: string;
};

type Storyboard = {
  projectId: string;
  templateId: "launch-30";
  musicId: MusicId;
  scenes: StoryboardScene[];
};

type MusicId =
  | "ambient-tech"
  | "modern-saas"
  | "corporate-clean"
  | "startup-launch"
  | "energetic-reveal";
```

**No `voiceover` field in v1.**

## Composition (render-facing)

```typescript
type Composition = {
  version: "1";
  composition: {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
  };
  audio: {
    musicId: MusicId;
    /** 0–1, default 0.85 */
    volume?: number;
  };
  brand: {
    primary: string;
    background: string;
    logoAssetId?: string;
  };
  scenes: CompositionScene[];
};

type CompositionScene = {
  id: string;
  durationInFrames: number;
  layers: Layer[];
};

type Layer = TextLayer | ImageLayer | UiFrameLayer | SolidLayer | GroupLayer;

type TextLayer = {
  id: string;
  type: "text";
  props: {
    content: string;
    subcontent?: string;
  };
  animation: AnimationPreset;
};

type ImageLayer = {
  id: string;
  type: "image";
  props: { assetId: string };
  animation: AnimationPreset;
};

type UiFrameLayer = {
  id: string;
  type: "ui-frame";
  props: { assetId: string; device?: "browser" | "macos" };
  animation: AnimationPreset;
};

type SolidLayer = {
  id: string;
  type: "solid";
  props: { color: string };
};

type GroupLayer = {
  id: string;
  type: "group";
  children: Layer[];
};

type AnimationPreset = {
  preset:
    | "fade-in"
    | "slide-up"
    | "slide-down"
    | "scale-in"
    | "ui-pan-zoom";
  delayFrames?: number;
  durationFrames?: number;
};
```

## Transform: storyboard → composition

1. Sum `durationSeconds` → `durationInFrames` (fps × seconds).
2. Map each storyboard scene to `CompositionScene` with `text` + optional `ui-frame`.
3. Attach `audio.musicId` from storyboard.
4. Resolve `assetId` to file paths in render bundle.

## Assets manifest (sidecar)

```typescript
type AssetManifest = {
  assets: Record<
    string,
    { path: string; type: "image" | "logo"; width?: number; height?: number }
  >;
};
```

## Versioning

- Bump `version` on breaking changes.
- AE plugin (Phase 2) targets explicit `version` support list.

## Example minimal JSON

```json
{
  "version": "1",
  "composition": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationInFrames": 900
  },
  "audio": { "musicId": "modern-saas", "volume": 0.85 },
  "brand": { "primary": "#55b3ff", "background": "#07080a" },
  "scenes": [
    {
      "id": "hook",
      "durationInFrames": 90,
      "layers": [
        {
          "id": "headline",
          "type": "text",
          "props": {
            "content": "Sync Everything",
            "subcontent": "Across all your devices"
          },
          "animation": { "preset": "slide-up", "delayFrames": 8 }
        }
      ]
    }
  ]
}
```
