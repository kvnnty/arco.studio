import type { ExportFormat, StylePreset } from "@arco/project-schema";
import { getTemplate } from "@arco/project-schema/templates";

import { createProject } from "@/lib/api/projects";
import { uploadProjectRecording } from "@/lib/editor/upload-project-recording";
import type { ProjectPlatform } from "@/lib/editor/create-project";

export type CreateAndUploadProjectInput = {
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
  file: File;
  onUploadProgress?: (percent: number) => void;
};

export function deriveProjectTitle(input: {
  title?: string;
  productUrl?: string;
  intent?: string;
}): string {
  if (input.title?.trim()) return input.title.trim();

  if (input.productUrl?.trim()) {
    try {
      const hostname = new URL(input.productUrl.trim()).hostname.replace(
        /^www\./,
        "",
      );
      const brand = hostname.split(".")[0];
      if (brand) {
        return `${brand.charAt(0).toUpperCase()}${brand.slice(1)} launch video`;
      }
    } catch {
      // ignore invalid URL
    }
  }

  const intentLine = input.intent?.trim().split("\n")[0]?.trim();
  if (intentLine && intentLine.length <= 80) {
    return intentLine;
  }

  return "Untitled launch video";
}

export async function createAndUploadProject(
  input: CreateAndUploadProjectInput,
): Promise<{ projectId: string }> {
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
  });

  await uploadProjectRecording({
    accessToken: input.accessToken,
    projectId: id,
    projectName: title,
    platform: input.platform ?? "web",
    file: input.file,
    templateId: input.templateId,
    stylePreset: input.stylePreset ?? template?.stylePreset,
    exportFormat: input.exportFormat ?? template?.exportFormat,
    brief: input.brief,
    musicId: input.musicId,
    onUploadProgress: input.onUploadProgress,
  });

  return { projectId: id };
}
