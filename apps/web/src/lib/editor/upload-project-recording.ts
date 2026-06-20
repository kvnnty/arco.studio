import type { ArcoProject, ExportFormat, StylePreset } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";

import { syncProject } from "@/app/actions/projects";
import { uploadRecordingWithProgress } from "@/lib/api/client";
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
};

export async function uploadProjectRecording(
  input: UploadProjectRecordingInput,
): Promise<UploadProjectRecordingResult> {
  const metadata = await getVideoMetadata(input.file);

  const uploadResult = await uploadRecordingWithProgress(
    input.accessToken,
    input.file,
    input.onUploadProgress,
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

  await syncProject({
    projectId: input.projectId,
    project,
    platform: input.platform as "web" | "mobile" | "both",
    recordingSrc: uploadResult.url,
  });

  return {
    project,
    recordingUrl: uploadResult.url,
    ...metadata,
  };
}
