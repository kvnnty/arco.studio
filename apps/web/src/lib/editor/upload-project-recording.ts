import type { ArcoProject, ExportFormat, StylePreset } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";

import { syncProjectRecord } from "@/lib/api/projects";
import {
  uploadRecordingWithProgress,
  uploadThumbnail,
} from "@/lib/api/client";
import {
  captureVideoFrame,
  dataUrlToBlob,
} from "@/lib/editor/capture-frame";
import {
  createEmptyProject,
  getVideoMetadata,
} from "@/lib/editor/create-project";

export type UploadProjectRecordingInput = {
  accessToken: string;
  projectId: string;
  projectName: string;
  platform: string;
  file: File;
  stylePreset?: StylePreset;
  exportFormat?: ExportFormat;
  brief?: ArcoProject["brief"];
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
  accessToken: string,
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

  const uploadResult = await uploadRecordingWithProgress(
    input.accessToken,
    input.file,
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

  if (input.exportFormat) {
    project = { ...project, exportFormat: input.exportFormat };
  }

  if (input.brief) {
    project = { ...project, brief: input.brief };
  }

  if (input.stylePreset) {
    project = applyStylePreset(project, input.stylePreset);
  }

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
