import type { ExportFormat, StylePreset } from "@arco/project-schema";
import { createScreenshotPendingProject } from "@arco/project-schema";
import { getTemplate } from "@arco/project-schema/templates";
import { getDefaultVoiceId } from "@arco/project-schema/voices";

import { uploadImageWithProgress } from "@/lib/api/client";
import { createProject, syncProjectRecord } from "@/lib/api/projects";
import type { ProjectPlatform } from "@/lib/editor/create-project";
import { deriveProjectTitle } from "@/lib/editor/create-from-template";

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

/**
 * Upload screenshots and create a pending project.
 * Storyboard / VO / layout run in the editor Motion pipeline.
 */
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

  const stubScenes = imageUrls.map((url, index) => ({
    id: `scene-${index + 1}`,
    imageSrc: url,
    durationMs: 4000,
    motion: "ken-burns-in" as const,
  }));

  const voiceEnabled = input.voiceEnabled !== false;
  const voiceId = input.voiceId ?? getDefaultVoiceId();
  const musicId =
    input.musicId ?? template?.audio.musicId ?? "warm-launch";

  let project = createScreenshotPendingProject(title, stubScenes);

  if (input.brief) {
    project = { ...project, brief: input.brief };
  }

  if (template) {
    project = {
      ...project,
      template: { id: template.id, name: template.name },
      stylePreset: template.stylePreset,
    };
  } else if (input.stylePreset) {
    project = { ...project, stylePreset: input.stylePreset };
  }

  if (input.exportFormat) {
    project = { ...project, exportFormat: input.exportFormat };
  }

  project = {
    ...project,
    projectMode: "screenshots",
    pipelineStatus: "pending",
    scenes: stubScenes,
    audio: {
      musicId: input.customMusicSrc ? undefined : musicId,
      customMusicSrc: input.customMusicSrc ?? undefined,
      volume: template?.audio.volume ?? 0.25,
      voiceId: voiceEnabled ? voiceId : undefined,
      voiceEnabled,
      duckUnderVoice: true,
    },
    recording: {
      src: "placeholder",
      durationMs: stubScenes.reduce((sum, scene) => sum + scene.durationMs, 0),
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
