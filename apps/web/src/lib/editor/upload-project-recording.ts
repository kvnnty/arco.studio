import type { ArcoProject, ExportFormat, StylePreset } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import type { AccessTokenSource } from "@/lib/auth/constants";
import {
  applyTemplateToProject,
  getTemplate,
} from "@arco/project-schema/templates";

import { syncProjectRecord } from "@/lib/api/projects";
import {
  uploadRecordingWithProgress,
  uploadThumbnail,
  apiGetBillingStatus,
} from "@/lib/api/client";
import { assertWithinDurationLimit } from "@/lib/billing/duration-limits";
import {
  captureVideoFrame,
  dataUrlToBlob,
} from "@/lib/editor/capture-frame";
import {
  createEmptyProject,
  getVideoMetadata,
} from "@/lib/editor/create-project";

export type UploadProjectRecordingInput = {
  accessToken: AccessTokenSource;
  projectId: string;
  projectName: string;
  platform: string;
  file: File;
  stylePreset?: StylePreset;
  exportFormat?: ExportFormat;
  templateId?: string;
  brief?: ArcoProject["brief"];
  musicId?: string | null;
  customMusicSrc?: string | null;
  onUploadProgress?: (percent: number) => void;
};

export type UploadProjectRecordingResult = {
  project: ArcoProject;
  recordingUrl: string;
  durationMs: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
};

async function captureAndUploadThumbnail(
  accessToken: AccessTokenSource,
  recordingUrl: string,
  file: File,
): Promise<string | undefined> {
  try {
    const objectUrl = URL.createObjectURL(file);
    const dataUrl = await captureVideoFrame(objectUrl, 1000);
    URL.revokeObjectURL(objectUrl);

    const blob = await dataUrlToBlob(dataUrl);
    const thumbFile = new File([blob], "thumbnail.jpg", {
      type: "image/jpeg",
    });
    const result = await uploadThumbnail(accessToken, thumbFile);
    return result.url;
  } catch {
    try {
      const dataUrl = await captureVideoFrame(recordingUrl, 1000);
      const blob = await dataUrlToBlob(dataUrl);
      const thumbFile = new File([blob], "thumbnail.jpg", {
        type: "image/jpeg",
      });
      const result = await uploadThumbnail(accessToken, thumbFile);
      return result.url;
    } catch {
      return undefined;
    }
  }
}

export async function uploadProjectRecording(
  input: UploadProjectRecordingInput,
): Promise<UploadProjectRecordingResult> {
  const metadata = await getVideoMetadata(input.file);

  const billing = await apiGetBillingStatus(input.accessToken);
  assertWithinDurationLimit(
    metadata.durationMs,
    billing.maxProjectDurationMs,
    billing.plan,
  );

  const uploadResult = await uploadRecordingWithProgress(
    input.accessToken,
    input.file,
    metadata.durationMs,
    input.onUploadProgress,
  );

  const thumbnailUrl = await captureAndUploadThumbnail(
    input.accessToken,
    uploadResult.url,
    input.file,
  );

  let project = createEmptyProject(
    input.projectName,
    uploadResult.url,
    metadata.durationMs,
    metadata.width,
    metadata.height,
  );

  if (input.brief) {
    project = { ...project, brief: input.brief };
  }

  const template = input.templateId ? getTemplate(input.templateId) : undefined;
  if (template) {
    project = applyTemplateToProject(project, template);
  } else {
    if (input.exportFormat) {
      project = { ...project, exportFormat: input.exportFormat };
    }
    if (input.stylePreset) {
      project = applyStylePreset(project, input.stylePreset);
    }
  }

  const musicId =
    input.musicId ?? template?.audio.musicId ?? project.audio?.musicId ?? "warm-launch";
  project = {
    ...project,
    audio: {
      musicId: input.customMusicSrc ? undefined : musicId ?? undefined,
      customMusicSrc: input.customMusicSrc ?? undefined,
      volume: template?.audio.volume ?? project.audio?.volume ?? 0.85,
    },
  };

  await syncProjectRecord(input.accessToken, {
    projectId: input.projectId,
    project,
    platform: input.platform as "web" | "mobile" | "both",
    recordingSrc: uploadResult.url,
    thumbnailUrl,
  });

  return {
    project,
    recordingUrl: uploadResult.url,
    thumbnailUrl,
    ...metadata,
  };
}
