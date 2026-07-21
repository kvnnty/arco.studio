import type {
  ArcoProject,
  Marker,
  ScreenshotScene,
  StylePreset,
} from "@arco/project-schema";
import {
  createScreenshotPendingProject,
  screenshotProjectDurationMs,
} from "@arco/project-schema";
import {
  applyStylePreset,
  STYLE_PRESETS,
} from "@arco/project-schema/style-presets";
import {
  applyTemplateToProject,
  getTemplate,
} from "@arco/project-schema/templates";

import { apiGenerateStoryboard, apiGetBillingStatus } from "@/lib/api/client";
import type { BrandKit } from "@/lib/api/hooks/brand";
import { assertWithinDurationLimit } from "@/lib/billing/duration-limits";
import {
  mergeBrandIntoProject,
  toneToStylePreset,
} from "@/lib/editor/brand-kit";
import { generateVoiceForScreenshotProject } from "@/lib/editor/generate-voice-for-project";
import {
  advancePipeline,
  createInitialPipelineState,
  type PipelineState,
} from "@/lib/editor/generation-pipeline";
import { getDefaultVoiceId } from "@arco/project-schema/voices";

export type ScreenshotPipelineCallbacks = {
  onPipelineChange: (pipeline: PipelineState, markers: Marker[]) => void;
  onBrandAnalyzed?: (kit: BrandKit) => void;
  onProjectPatch?: (project: ArcoProject) => void;
  analyzeBrand: (url: string) => Promise<BrandKit>;
};

export type ScreenshotPipelineResult = {
  project: ArcoProject;
  brandKit?: BrandKit;
  pipeline: PipelineState;
  draftMarkers: Marker[];
};

function scenesToDraftMarkers(scenes: ScreenshotScene[]): Marker[] {
  let startMs = 0;
  return scenes.map((scene, index) => {
    const marker: Marker = {
      id: scene.id,
      startMs,
      durationMs: scene.durationMs,
      effects: [{ type: "title-card" }],
      label: scene.headline ?? `Scene ${index + 1}`,
      callout: scene.headline
        ? {
            text: scene.headline,
            subtext: scene.subheadline,
          }
        : undefined,
    };
    startMs += scene.durationMs;
    return marker;
  });
}

function defaultMotionForIndex(
  index: number,
  preset: StylePreset,
): ScreenshotScene["motion"] {
  const motions: ScreenshotScene["motion"][] = [
    "ken-burns-in",
    "ken-burns-out",
    "pan-left",
    "ken-burns-in",
  ];
  if (preset === "apple") return index % 2 === 0 ? "ken-burns-in" : "static";
  if (preset === "startup")
    return motions[index % motions.length] ?? "ken-burns-in";
  return motions[index % 3] ?? "ken-burns-in";
}

function defaultTransitionForIndex(
  index: number,
  preset: StylePreset,
): NonNullable<ScreenshotScene["transition"]> {
  const byPreset: Record<
    StylePreset,
    Array<NonNullable<ScreenshotScene["transition"]>["type"]>
  > = {
    linear: ["fade", "slide", "fade"],
    stripe: ["fade", "push", "scale"],
    apple: ["fade", "blur", "fade"],
    startup: ["scale", "slide", "push", "morph"],
  };
  const types = byPreset[preset];
  return { type: types[index % types.length] ?? "fade" };
}

/**
 * Runs Analyze → Draft → Voice → Layout → Scenes → Stitch for screenshot projects.
 * Each step does real work (no cosmetic delays except tiny UI pacing).
 */
export async function runScreenshotPipeline(
  accessToken: string,
  baseProject: ArcoProject,
  callbacks: ScreenshotPipelineCallbacks,
): Promise<ScreenshotPipelineResult> {
  const imageUrls = (baseProject.scenes ?? []).map((scene) => scene.imageSrc);
  if (imageUrls.length < 3) {
    throw new Error("Screenshot pipeline requires at least 3 uploaded images.");
  }

  let pipeline = createInitialPipelineState();
  callbacks.onPipelineChange(pipeline, []);

  let project = { ...baseProject };
  let brandKit: BrandKit | undefined;
  const productUrl = project.brief?.productUrl?.trim();

  // --- Analyze ---
  if (productUrl) {
    try {
      brandKit = await callbacks.analyzeBrand(productUrl);
      callbacks.onBrandAnalyzed?.(brandKit);
      project = mergeBrandIntoProject(project, brandKit);
      callbacks.onProjectPatch?.(project);
    } catch {
      // Continue without brand kit
    }
  }

  pipeline = advancePipeline(pipeline, "draft");
  callbacks.onPipelineChange(pipeline, []);

  // --- Draft (storyboard) ---
  const storyboard = await apiGenerateStoryboard(accessToken, {
    title: project.meta.title,
    imageUrls,
    intent: project.brief?.intent ?? brandKit?.description,
    productUrl: productUrl || undefined,
    templateId: project.template?.id,
    brief: project.brief,
    targetDurationMs: 45000,
  });

  let scenes: ScreenshotScene[] = storyboard.scenes.map((scene, index) => ({
    ...scene,
    imageSrc: imageUrls[index] ?? scene.imageSrc,
  }));

  const template = project.template?.id
    ? getTemplate(project.template.id)
    : undefined;

  const suggestedPreset: StylePreset =
    template?.stylePreset ??
    toneToStylePreset(brandKit?.tone) ??
    storyboard.stylePreset ??
    project.stylePreset ??
    "startup";

  project = {
    ...createScreenshotPendingProject(project.meta.title, scenes),
    brief: project.brief,
    brand: project.brand,
    template: project.template,
    exportFormat: project.exportFormat,
    audio: {
      ...project.audio,
      volume: project.audio?.volume ?? 0.25,
      soundDesign: storyboard.soundDesign,
    },
    creativeDirection: storyboard.creativeDirection,
    stylePreset: suggestedPreset,
    pipelineStatus: "pending",
  };

  if (template) {
    project = applyTemplateToProject(project, template);
    scenes = project.scenes ?? scenes;
  } else {
    project = applyStylePreset(project, suggestedPreset);
    // Preserve voice/music choices from create
    project = {
      ...project,
      audio: {
        ...project.audio,
        ...baseProject.audio,
        musicId: baseProject.audio?.customMusicSrc
          ? undefined
          : (baseProject.audio?.musicId ??
            STYLE_PRESETS[suggestedPreset].audioId),
        customMusicSrc: baseProject.audio?.customMusicSrc,
        volume: baseProject.audio?.volume ?? 0.25,
        soundDesign: storyboard.soundDesign,
      },
      brand: brandKit
        ? {
            primary: brandKit.colors.primary,
            background: brandKit.colors.background,
            logoSrc: brandKit.logoUrl,
          }
        : project.brand,
    };
  }

  let draftMarkers = scenesToDraftMarkers(scenes);
  const targetDurationSec = Math.round(
    scenes.reduce((sum, s) => sum + s.durationMs, 0) / 1000,
  );

  pipeline = advancePipeline(pipeline, "draft", {
    sceneCount: scenes.length,
    targetDurationSec,
  });
  callbacks.onPipelineChange(pipeline, draftMarkers);
  callbacks.onProjectPatch?.({ ...project, scenes });

  // --- Voice ---
  pipeline = advancePipeline(pipeline, "voice", {
    sceneCount: scenes.length,
    targetDurationSec,
  });
  callbacks.onPipelineChange(pipeline, draftMarkers);

  const voiceEnabled = project.audio?.voiceEnabled !== false;
  const voiceId = project.audio?.voiceId ?? getDefaultVoiceId();

  if (voiceEnabled && voiceId) {
    try {
      scenes = await generateVoiceForScreenshotProject(
        accessToken,
        { ...project, scenes },
        voiceId,
      );
      draftMarkers = scenesToDraftMarkers(scenes);
      callbacks.onPipelineChange(pipeline, draftMarkers);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Voice generation failed";
      throw new Error(`Recording voice-over failed: ${message}`);
    }
  }

  // --- Layout ---
  pipeline = advancePipeline(pipeline, "layout", {
    sceneCount: scenes.length,
    targetDurationSec,
  });
  callbacks.onPipelineChange(pipeline, draftMarkers);

  const preset = (project.stylePreset ?? suggestedPreset) as StylePreset;
  scenes = scenes.map((scene, index) => ({
    ...scene,
    motion: scene.motion ?? defaultMotionForIndex(index, preset),
    transition: scene.transition ?? defaultTransitionForIndex(index, preset),
  }));
  draftMarkers = scenesToDraftMarkers(scenes);

  // --- Scenes (client animation ready) ---
  pipeline = advancePipeline(pipeline, "scenes", {
    sceneCount: scenes.length,
    targetDurationSec,
  });
  callbacks.onPipelineChange(pipeline, draftMarkers);

  project = {
    ...project,
    projectMode: "screenshots",
    scenes,
    pipelineStatus: "ready",
    recording: {
      src: "placeholder",
      durationMs: screenshotProjectDurationMs({ ...project, scenes }),
    },
    audio: {
      ...project.audio,
      volume: project.audio?.volume ?? 0.25,
      voiceId: voiceEnabled ? voiceId : undefined,
      voiceEnabled,
      duckUnderVoice: true,
      soundDesign: storyboard.soundDesign,
    },
  };

  const billing = await apiGetBillingStatus(accessToken);
  assertWithinDurationLimit(
    project.recording.durationMs,
    billing.maxProjectDurationMs,
    billing.plan,
  );

  // --- Stitch ---
  pipeline = advancePipeline(pipeline, "stitch", {
    sceneCount: scenes.length,
    targetDurationSec,
  });
  pipeline = {
    ...pipeline,
    completedSteps: ["analyze", "draft", "voice", "layout", "scenes", "stitch"],
  };
  callbacks.onPipelineChange(pipeline, draftMarkers);
  callbacks.onProjectPatch?.(project);

  return {
    project,
    brandKit,
    pipeline,
    draftMarkers,
  };
}
