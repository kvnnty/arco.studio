import { z } from "zod";

import type { ArcoProject, ScreenshotScene } from "./index.js";

export const soundDesignProfileSchema = z.enum([
  "minimal",
  "balanced",
  "energetic",
  "cinematic",
  "playful",
  "futuristic",
]);

export const soundCategorySchema = z.enum([
  "pop",
  "whoosh",
  "click",
  "impact",
  "riser",
  "glitch",
  "transition",
  "texture",
]);

export const soundCueAnchorSchema = z.object({
  type: z.enum(["scene", "marker", "timeline"]),
  targetId: z.string().min(1).optional(),
  offsetMs: z.number().int().min(-2000).max(10000).default(0),
  /** When true, the cue follows its scene or marker as timing changes. */
  followTiming: z.boolean().default(true),
});

export const soundCueSchema = z.object({
  id: z.string().min(1),
  soundId: z.string().min(1),
  category: soundCategorySchema,
  startMs: z.number().int().min(0),
  anchor: soundCueAnchorSchema,
  volume: z.number().min(0).max(0.85).default(0.45),
  intensity: z.number().min(0).max(1).default(0.5),
  enabled: z.boolean().default(true),
  source: z.enum(["ai", "manual"]).default("ai"),
  rationale: z.string().max(240).optional(),
});

export const soundDesignSchema = z
  .object({
    version: z.literal("1"),
    decision: z.enum(["include", "silence"]),
    rationale: z.string().min(1).max(500),
    profile: soundDesignProfileSchema.default("balanced"),
    masterVolume: z.number().min(0).max(0.8).default(0.7),
    cues: z.array(soundCueSchema).max(24).default([]),
  })
  .superRefine((value, context) => {
    if (value.decision === "silence" && value.cues.some((cue) => cue.enabled)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cues"],
        message: "A silence decision cannot contain enabled sound cues.",
      });
    }
  });

export type SoundDesignProfile = z.infer<typeof soundDesignProfileSchema>;
export type SoundCategory = z.infer<typeof soundCategorySchema>;
export type SoundCue = z.infer<typeof soundCueSchema>;
export type SoundDesign = z.infer<typeof soundDesignSchema>;

export type MotionSound = {
  id: string;
  label: string;
  description: string;
  category: SoundCategory;
  file: string;
  durationMs: number;
  character: readonly SoundDesignProfile[];
  /** All bundled cues are original procedural renders created for Arco. */
  rights: "arco-original";
};

export const MOTION_SOUNDS = [
  {
    id: "air-soft",
    label: "Air Soft",
    description: "A restrained directional lift for elegant movement.",
    category: "whoosh",
    file: "sounds/air-soft.wav",
    durationMs: 560,
    character: ["minimal", "balanced", "cinematic"],
    rights: "arco-original",
  },
  {
    id: "air-forward",
    label: "Air Forward",
    description: "A quicker sweep for scene changes with momentum.",
    category: "transition",
    file: "sounds/air-forward.wav",
    durationMs: 620,
    character: ["balanced", "energetic", "futuristic"],
    rights: "arco-original",
  },
  {
    id: "pop-soft",
    label: "Soft Pop",
    description: "A rounded, quiet accent for scale and appearance.",
    category: "pop",
    file: "sounds/pop-soft.wav",
    durationMs: 280,
    character: ["minimal", "balanced", "playful"],
    rights: "arco-original",
  },
  {
    id: "ui-tick",
    label: "UI Tick",
    description: "A clean tactile tick for product interactions.",
    category: "click",
    file: "sounds/ui-tick.wav",
    durationMs: 180,
    character: ["minimal", "balanced", "futuristic"],
    rights: "arco-original",
  },
  {
    id: "impact-soft",
    label: "Soft Impact",
    description: "A low, controlled landing for a key message.",
    category: "impact",
    file: "sounds/impact-soft.wav",
    durationMs: 520,
    character: ["balanced", "cinematic"],
    rights: "arco-original",
  },
  {
    id: "impact-deep",
    label: "Deep Impact",
    description: "A larger but still polished accent for decisive reveals.",
    category: "impact",
    file: "sounds/impact-deep.wav",
    durationMs: 760,
    character: ["energetic", "cinematic"],
    rights: "arco-original",
  },
  {
    id: "rise-clean",
    label: "Clean Rise",
    description: "A short anticipation lift before an important beat.",
    category: "riser",
    file: "sounds/rise-clean.wav",
    durationMs: 900,
    character: ["balanced", "energetic", "cinematic"],
    rights: "arco-original",
  },
  {
    id: "digital-flick",
    label: "Digital Flick",
    description: "A brief synthetic texture for technical transitions.",
    category: "glitch",
    file: "sounds/digital-flick.wav",
    durationMs: 360,
    character: ["energetic", "futuristic"],
    rights: "arco-original",
  },
] as const satisfies readonly MotionSound[];

export type MotionSoundId = (typeof MOTION_SOUNDS)[number]["id"];

export const MOTION_SOUND_IDS = MOTION_SOUNDS.map((sound) => sound.id) as [
  MotionSoundId,
  ...MotionSoundId[],
];

export function getMotionSound(
  id: string | null | undefined,
): MotionSound | null {
  return MOTION_SOUNDS.find((sound) => sound.id === id) ?? null;
}

export function soundsForCategory(category: SoundCategory): MotionSound[] {
  return MOTION_SOUNDS.filter((sound) => sound.category === category);
}

function sceneStartMs(project: ArcoProject, targetId: string): number | null {
  let startMs = 0;
  for (const scene of project.scenes ?? []) {
    if (scene.id === targetId) return startMs;
    startMs += scene.durationMs;
  }
  return null;
}

/** Resolve an anchored cue at render time so edits to scene timing stay in sync. */
export function resolveSoundCueStartMs(
  project: ArcoProject,
  cue: SoundCue,
): number {
  if (!cue.anchor.followTiming || cue.anchor.type === "timeline") {
    return Math.max(0, cue.startMs + cue.anchor.offsetMs);
  }

  const targetId = cue.anchor.targetId;
  if (!targetId) return Math.max(0, cue.startMs + cue.anchor.offsetMs);

  const anchorStart =
    cue.anchor.type === "scene"
      ? sceneStartMs(project, targetId)
      : (project.markers.find((marker) => marker.id === targetId)?.startMs ??
        null);

  return Math.max(0, (anchorStart ?? cue.startMs) + cue.anchor.offsetMs);
}

function profileForProject(project: ArcoProject): SoundDesignProfile {
  const tone = project.creativeDirection?.tone?.toLowerCase() ?? "";
  if (/cinematic|dramatic|bold/.test(tone)) return "cinematic";
  if (/playful|friendly|fun/.test(tone)) return "playful";
  if (/technical|future|digital/.test(tone)) return "futuristic";
  if (/minimal|quiet|calm|premium/.test(tone)) return "minimal";
  return project.stylePreset === "apple" ? "minimal" : "balanced";
}

function soundForScene(
  scene: ScreenshotScene,
  index: number,
  profile: SoundDesignProfile,
): MotionSound {
  if (scene.transition?.type === "push" || scene.transition?.type === "slide") {
    return getMotionSound(profile === "minimal" ? "air-soft" : "air-forward")!;
  }
  if (scene.transition?.type === "blur" || scene.transition?.type === "morph") {
    return getMotionSound(
      profile === "futuristic" ? "digital-flick" : "air-soft",
    )!;
  }
  if (scene.beatRole === "cta") {
    return getMotionSound(
      profile === "cinematic" ? "impact-deep" : "impact-soft",
    )!;
  }
  if (scene.beatRole === "hook" && index === 0) {
    return getMotionSound(profile === "minimal" ? "pop-soft" : "impact-soft")!;
  }
  return getMotionSound(scene.motion === "static" ? "ui-tick" : "pop-soft")!;
}

/**
 * Conservative fallback for offline generation and user-triggered remixing.
 * It deliberately returns silence when the motion has no salient audiovisual beat.
 */
export function createHeuristicSoundDesign(
  project: ArcoProject,
  requestedProfile?: SoundDesignProfile,
  variation = 0,
): SoundDesign {
  const profile = requestedProfile ?? profileForProject(project);
  const scenes = project.scenes ?? [];
  const isSalientScene = (scene: ScreenshotScene) =>
    scene.motion !== "static" || scene.transition?.type !== "fade";
  const salient = scenes.filter(isSalientScene);

  if (scenes.length === 0 && project.markers.length > 0) {
    const maxCues = Math.max(
      1,
      Math.min(6, Math.floor(project.recording.durationMs / 5500)),
    );
    const markers = [...project.markers]
      .sort((a, b) => a.startMs - b.startMs)
      .filter((marker) =>
        marker.effects.some((effect) =>
          [
            "title-card",
            "feature-callout",
            "click-ripple",
            "pulse",
            "glow",
            "transition",
          ].includes(effect.type),
        ),
      )
      .slice(0, maxCues);
    const cues: SoundCue[] = markers.map((marker, index) => {
      const hasTitle = marker.effects.some(
        (effect) => effect.type === "title-card",
      );
      const hasInteraction = marker.effects.some((effect) =>
        ["click-ripple", "pulse", "glow"].includes(effect.type),
      );
      const sound = getMotionSound(
        hasTitle
          ? profile === "cinematic"
            ? "impact-deep"
            : "impact-soft"
          : hasInteraction
            ? "ui-tick"
            : profile === "minimal"
              ? "air-soft"
              : "air-forward",
      )!;
      return {
        id: `sound-${marker.id}-${variation}-${index}`,
        soundId: sound.id,
        category: sound.category,
        startMs: marker.startMs,
        anchor: {
          type: "marker",
          targetId: marker.id,
          offsetMs: hasInteraction ? 0 : 80,
          followTiming: true,
        },
        volume: profile === "minimal" ? 0.3 : 0.44,
        intensity: profile === "minimal" ? 0.3 : 0.52,
        enabled: true,
        source: "ai",
        rationale: hasInteraction
          ? "Confirms a visible product interaction without adding a continuous texture."
          : "Supports a deliberate visual emphasis while leaving surrounding motion silent.",
      };
    });
    return {
      version: "1",
      decision: cues.length > 0 ? "include" : "silence",
      rationale:
        cues.length > 0
          ? `Use ${cues.length} selective accents across ${project.markers.length} authored moments; leave routine motion silent.`
          : "No recorded interaction is visually important enough to justify an effect.",
      profile,
      masterVolume: profile === "minimal" ? 0.55 : 0.7,
      cues,
    };
  }

  if (scenes.length === 0 || salient.length === 0) {
    return {
      version: "1",
      decision: "silence",
      rationale:
        scenes.length === 0
          ? "There are no authored visual beats to support with sound."
          : "The sequence is visually restrained; silence preserves clarity better than decorative effects.",
      profile,
      masterVolume: 0.65,
      cues: [],
    };
  }

  const durationMs = scenes.reduce((sum, scene) => sum + scene.durationMs, 0);
  const maxCues = Math.max(1, Math.min(6, Math.floor(durationMs / 5500)));
  const candidates = scenes
    .map((scene, index) => ({ scene, index }))
    .filter(({ scene }) => isSalientScene(scene))
    .slice(0, maxCues);

  let absoluteStart = 0;
  const starts = new Map<string, number>();
  for (const scene of scenes) {
    starts.set(scene.id, absoluteStart);
    absoluteStart += scene.durationMs;
  }

  const cues: SoundCue[] = candidates.map(({ scene, index }) => {
    let sound = soundForScene(scene, index, profile);
    const sameCategory = soundsForCategory(sound.category);
    if (sameCategory.length > 1) {
      sound = sameCategory[(variation + index) % sameCategory.length] ?? sound;
    }
    const offsetMs = scene.beatRole === "cta" ? 120 : 80;
    return {
      id: `sound-${scene.id}-${variation}-${index}`,
      soundId: sound.id,
      category: sound.category,
      startMs: starts.get(scene.id) ?? 0,
      anchor: {
        type: "scene",
        targetId: scene.id,
        offsetMs,
        followTiming: true,
      },
      volume:
        profile === "minimal" ? 0.32 : profile === "energetic" ? 0.58 : 0.44,
      intensity:
        profile === "minimal" ? 0.3 : profile === "energetic" ? 0.75 : 0.5,
      enabled: true,
      source: "ai",
      rationale:
        scene.beatRole === "cta"
          ? "Gives the closing decision a controlled landing."
          : "Reinforces a visible story turn without scoring every movement.",
    };
  });

  return {
    version: "1",
    decision: cues.length > 0 ? "include" : "silence",
    rationale:
      cues.length > 0
        ? `Use ${cues.length} restrained accents across ${scenes.length} scenes; leave the remaining motion silent so the mix can breathe.`
        : "No moment benefits enough from an effect to justify one.",
    profile,
    masterVolume: profile === "minimal" ? 0.55 : 0.7,
    cues,
  };
}
