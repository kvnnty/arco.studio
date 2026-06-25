import { z } from "zod";

export const effectTypeSchema = z.enum([
  "smooth-zoom",
  "click-ripple",
  "title-card",
  "spotlight",
  "feature-callout",
  "transition",
  "pulse",
  "glow",
]);

export const clickEffectSchema = z.enum([
  "none",
  "ripple",
  "pulse",
  "spotlight",
  "zoom",
  "glow",
]);

export const transitionTypeSchema = z.enum([
  "fade",
  "push",
  "scale",
  "blur",
  "morph",
  "slide",
]);

export const stylePresetSchema = z.enum([
  "linear",
  "stripe",
  "apple",
  "startup",
]);

export const exportFormatSchema = z.enum(["16:9", "1:1", "9:16"]);

export const exportQualitySchema = z.enum(["1080p", "4k"]);

export const projectModeSchema = z.enum(["recording", "screenshots"]);

export const screenshotMotionSchema = z.enum([
  "ken-burns-in",
  "ken-burns-out",
  "pan-left",
  "static",
]);

export const screenshotSceneSchema = z.object({
  id: z.string().min(1),
  imageSrc: z.string().min(1),
  durationMs: z.number().int().min(1000).max(15000),
  headline: z.string().max(120).optional(),
  subheadline: z.string().max(200).optional(),
  voScript: z.string().max(500).optional(),
  voAudioSrc: z.string().optional(),
  voDurationMs: z.number().int().positive().optional(),
  motion: screenshotMotionSchema.default("ken-burns-in"),
  transition: z.object({ type: transitionTypeSchema }).optional(),
});

export const focusRegionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0.05).max(1),
  height: z.number().min(0.05).max(1),
});

export const markerEffectSchema = z.object({
  type: effectTypeSchema,
  scale: z.number().min(1).max(3).optional(),
  intensity: z.number().min(0).max(1).optional(),
});

export const markerCalloutSchema = z.object({
  text: z.string().min(1).max(120),
  subtext: z.string().max(200).optional(),
});

export const markerSchema = z.object({
  id: z.string().min(1),
  startMs: z.number().min(0),
  durationMs: z.number().min(100).default(1500),
  effects: z.array(markerEffectSchema).min(1),
  callout: markerCalloutSchema.optional(),
  label: z.string().max(80).optional(),
  focus: focusRegionSchema.optional(),
  click: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    })
    .optional(),
  clickEffect: clickEffectSchema.optional(),
  transition: z.object({ type: transitionTypeSchema }).optional(),
});

export const arcoProjectSchema = z.object({
  version: z.literal("1"),
  meta: z.object({
    title: z.string().min(1),
    fps: z.number().int().min(1).max(60).default(30),
    width: z.number().int().positive().default(1920),
    height: z.number().int().positive().default(1080),
  }),
  recording: z.object({
    src: z.string().min(1),
    durationMs: z.number().int().positive(),
  }),
  markers: z.array(markerSchema),
  brand: z
    .object({
      primary: z.string(),
      background: z.string(),
      logoSrc: z.string().optional(),
    })
    .optional(),
  audio: z
    .object({
      musicId: z.string().optional(),
      customMusicSrc: z.string().optional(),
      volume: z.number().min(0).max(1).default(0.85),
      voiceId: z.string().optional(),
      voiceEnabled: z.boolean().optional(),
      duckUnderVoice: z.boolean().optional(),
    })
    .optional(),
  brief: z
    .object({
      intent: z.string().max(2000).optional(),
      productUrl: z.string().max(500).optional(),
    })
    .optional(),
  template: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
    })
    .optional(),
  stylePreset: stylePresetSchema.default("startup"),
  exportFormat: exportFormatSchema.default("16:9"),
  projectMode: projectModeSchema.default("recording"),
  scenes: z.array(screenshotSceneSchema).optional(),
});

export type EffectType = z.infer<typeof effectTypeSchema>;
export type ClickEffect = z.infer<typeof clickEffectSchema>;
export type TransitionType = z.infer<typeof transitionTypeSchema>;
export type StylePreset = z.infer<typeof stylePresetSchema>;
export type ExportFormat = z.infer<typeof exportFormatSchema>;
export type ExportQuality = z.infer<typeof exportQualitySchema>;
export type ProjectMode = z.infer<typeof projectModeSchema>;
export type ScreenshotMotion = z.infer<typeof screenshotMotionSchema>;
export type ScreenshotScene = z.infer<typeof screenshotSceneSchema>;
export type FocusRegion = z.infer<typeof focusRegionSchema>;
export type MarkerEffect = z.infer<typeof markerEffectSchema>;
export type Marker = z.infer<typeof markerSchema>;
export type ArcoProject = z.infer<typeof arcoProjectSchema>;

export const DEFAULT_FOCUS: FocusRegion = {
  x: 0.5,
  y: 0.5,
  width: 0.4,
  height: 0.35,
};

export function parseArcoProject(data: unknown): ArcoProject {
  return arcoProjectSchema.parse(data);
}

/** Empty project before recording upload (recording.src = "pending"). */
export function createPendingProject(title: string): ArcoProject {
  return {
    version: "1",
    meta: {
      title,
      fps: 30,
      width: 1920,
      height: 1080,
    },
    recording: {
      src: "pending",
      durationMs: 1000,
    },
    markers: [],
    brand: {
      primary: "#55b3ff",
      background: "#07080a",
    },
    stylePreset: "startup",
    exportFormat: "16:9",
    projectMode: "recording",
  };
}

/** Screenshot storyboard project before scenes are finalized. */
export function createScreenshotPendingProject(
  title: string,
  scenes: ScreenshotScene[] = [],
): ArcoProject {
  const durationMs =
    scenes.length > 0
      ? scenes.reduce((sum, scene) => sum + scene.durationMs, 0)
      : 1000;

  return {
    version: "1",
    meta: {
      title,
      fps: 30,
      width: 1920,
      height: 1080,
    },
    recording: {
      src: "placeholder",
      durationMs,
    },
    markers: [],
    brand: {
      primary: "#55b3ff",
      background: "#07080a",
    },
    stylePreset: "startup",
    exportFormat: "16:9",
    projectMode: "screenshots",
    scenes,
  };
}

export function isScreenshotProject(project: ArcoProject): boolean {
  return project.projectMode === "screenshots";
}

export function screenshotProjectDurationMs(project: ArcoProject): number {
  if (!project.scenes?.length) {
    return project.recording.durationMs;
  }
  return project.scenes.reduce((sum, scene) => sum + scene.durationMs, 0);
}

export function projectHasVoiceover(project: ArcoProject): boolean {
  if (project.audio?.voiceEnabled === false) return false;
  return (
    project.scenes?.some((scene) => Boolean(scene.voAudioSrc)) ?? false
  );
}

export function projectHasCustomMusic(project: ArcoProject): boolean {
  return Boolean(project.audio?.customMusicSrc);
}

export function spokenScriptFromScene(scene: ScreenshotScene): string {
  if (scene.voScript?.trim()) return scene.voScript.trim();
  return [scene.headline, scene.subheadline].filter(Boolean).join(". ");
}

export function msToFrames(ms: number, fps: number): number {
  return Math.round((ms / 1000) * fps);
}

export function projectDurationInFrames(project: ArcoProject): number {
  const durationMs = isScreenshotProject(project)
    ? screenshotProjectDurationMs(project)
    : project.recording.durationMs;
  return msToFrames(durationMs, project.meta.fps);
}

export function getExportDimensions(
  format: ExportFormat,
  quality: ExportQuality = "1080p",
): {
  width: number;
  height: number;
} {
  const scale = quality === "4k" ? 2 : 1;

  switch (format) {
    case "1:1":
      return { width: 1080 * scale, height: 1080 * scale };
    case "9:16":
      return { width: 1080 * scale, height: 1920 * scale };
    default:
      return { width: 1920 * scale, height: 1080 * scale };
  }
}

export function effectsFromClickEffect(
  clickEffect: ClickEffect,
  zoomScale = 1.15,
): MarkerEffect[] {
  switch (clickEffect) {
    case "ripple":
      return [
        { type: "click-ripple", intensity: 0.85 },
        { type: "smooth-zoom", scale: 1 },
      ];
    case "pulse":
      return [
        { type: "pulse", intensity: 0.9 },
        { type: "smooth-zoom", scale: 1 },
      ];
    case "spotlight":
      return [
        { type: "spotlight", intensity: 0.85 },
        { type: "smooth-zoom", scale: 1 },
      ];
    case "zoom":
      return [{ type: "smooth-zoom", scale: zoomScale }];
    case "glow":
      return [
        { type: "glow", intensity: 0.9 },
        { type: "smooth-zoom", scale: 1 },
      ];
    default:
      return [{ type: "smooth-zoom", scale: 1 }];
  }
}

export function clickEffectFromMarker(marker: Marker): ClickEffect {
  if (marker.clickEffect) return marker.clickEffect;
  if (marker.effects.some((e) => e.type === "pulse")) return "pulse";
  if (marker.effects.some((e) => e.type === "glow")) return "glow";
  if (marker.effects.some((e) => e.type === "spotlight")) return "spotlight";
  if (marker.effects.some((e) => e.type === "click-ripple")) return "ripple";
  const zoom = marker.effects.find((e) => e.type === "smooth-zoom");
  if (zoom && (zoom.scale ?? 1) > 1.01) return "zoom";
  return "none";
}

export function setMarkerClickEffect(
  marker: Marker,
  clickEffect: ClickEffect,
  zoomScale = 1.15,
): Marker {
  const preserved = marker.effects.filter(
    (e) =>
      e.type !== "click-ripple" &&
      e.type !== "smooth-zoom" &&
      e.type !== "pulse" &&
      e.type !== "glow" &&
      e.type !== "spotlight",
  );
  return {
    ...marker,
    clickEffect,
    effects: [...preserved, ...effectsFromClickEffect(clickEffect, zoomScale)],
  };
}
