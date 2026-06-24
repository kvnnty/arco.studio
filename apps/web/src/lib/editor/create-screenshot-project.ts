import type { ExportFormat, StylePreset } from "@arco/project-schema";
import {
  createScreenshotPendingProject,
  screenshotProjectDurationMs,
} from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import { applyTemplateToProject, getTemplate } from "@arco/project-schema/templates";

import {
  apiGenerateStoryboard,
  uploadImageWithProgress,
} from "@/lib/api/client";
import { createProject, syncProjectRecord } from "@/lib/api/projects";
import type { ProjectPlatform } from "@/lib/editor/create-project";
import { deriveProjectTitle } from "@/lib/editor/create-from-template";
import { generateVoiceForScreenshotProject } from "@/lib/editor/generate-voice-for-project";
import { getDefaultVoiceId } from "@arco/project-schema/voices";

export type CreateScreenshotProjectInput = {
  accessToken: string;
  title?: string;
  platform?: ProjectPlatform;
  templateId?: string;
  brief?: {
    intent?: string;
    productUrl?: string;
  };
  stylePreset?: StylePreset;
  exportFormat?: ExportFormat;
  musicId?: string | null;
  customMusicSrc?: string | null;
  voiceId?: string | null;
  voiceEnabled?: boolean;
  files: File[];
  onUploadProgress?: (percent: number) => void;
};

export async function createScreenshotProject(
  input: CreateScreenshotProjectInput,
): Promise<{ projectId: string }> {
  if (input.files.length < 3) {
    throw new Error("Upload at least 3 screenshots.");
  }
  if (input.files.length > 10) {
    throw new Error("Maximum 10 screenshots per project.");
  }

  const title = deriveProjectTitle({
    title: input.title,
    productUrl: input.brief?.productUrl,
    intent: input.brief?.intent,
  });

  const template = input.templateId ? getTemplate(input.templateId) : undefined;

  const { id } = await createProject(input.accessToken, {
    title,
    platform: input.platform ?? "web",
    templateId: input.templateId,
    brief: input.brief,
    stylePreset: input.stylePreset ?? template?.stylePreset,
    exportFormat: input.exportFormat ?? template?.exportFormat,
    projectMode: "screenshots",
  });

  const imageUrls: string[] = [];
  const total = input.files.length;

  for (let index = 0; index < total; index++) {
    const file = input.files[index];
    const result = await uploadImageWithProgress(
      input.accessToken,
      file,
      input.onUploadProgress
        ? (percent) => {
            const overall = Math.round(((index + percent / 100) / total) * 100);
            input.onUploadProgress?.(overall);
          }
        : undefined,
    );
    imageUrls.push(result.url);
  }

  const storyboard = await apiGenerateStoryboard(input.accessToken, {
    title,
    imageUrls,
    intent: input.brief?.intent,
    productUrl: input.brief?.productUrl,
    templateId: input.templateId,
    brief: input.brief,
    targetDurationMs: 45000,
  });

  const scenes = storyboard.scenes.map((scene, index) => ({
    ...scene,
    imageSrc: imageUrls[index] ?? scene.imageSrc,
  }));

  let project = createScreenshotPendingProject(title, scenes);

  if (input.brief) {
    project = { ...project, brief: input.brief };
  }

  if (template) {
    project = applyTemplateToProject(project, template);
  } else if (input.stylePreset) {
    project = applyStylePreset(project, input.stylePreset);
  } else {
    project = { ...project, stylePreset: storyboard.stylePreset };
  }

  if (input.exportFormat) {
    project = { ...project, exportFormat: input.exportFormat };
  }

  const musicId =
    input.musicId ?? template?.audio.musicId ?? "modern-saas";
  const voiceEnabled = input.voiceEnabled !== false;
  const voiceId = input.voiceId ?? getDefaultVoiceId();

  let finalScenes = scenes;

  if (voiceEnabled && voiceId) {
    try {
      finalScenes = await generateVoiceForScreenshotProject(
        input.accessToken,
        {
          ...createScreenshotPendingProject(title, scenes),
          scenes,
        },
        voiceId,
      );
    } catch {
      // Continue without voice if ElevenLabs is unavailable
    }
  }

  project = {
    ...project,
    projectMode: "screenshots",
    scenes: finalScenes,
    audio: {
      musicId: input.customMusicSrc ? undefined : musicId ?? undefined,
      customMusicSrc: input.customMusicSrc ?? undefined,
      volume: template?.audio.volume ?? 0.85,
      voiceId: voiceEnabled ? voiceId : undefined,
      voiceEnabled,
      duckUnderVoice: true,
    },
    recording: {
      src: "placeholder",
      durationMs: screenshotProjectDurationMs({ ...project, scenes: finalScenes }),
    },
  };

  await syncProjectRecord(input.accessToken, {
    projectId: id,
    project,
    platform: input.platform ?? "web",
    recordingSrc: "placeholder",
    thumbnailUrl: imageUrls[0],
  });

  return { projectId: id };
}
