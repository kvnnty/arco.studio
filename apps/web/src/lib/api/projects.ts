import type { ArcoProject, ExportFormat, StylePreset } from "@arco/project-schema";
import type { AccessTokenSource } from "@/lib/auth/constants";

import {
  apiCreateProject,
  apiDeleteProject,
  apiGetProject,
  apiListProjects,
  apiUpdateProject,
  parseProjectData,
  type ApiProjectRecord,
} from "@/lib/api/client";
import { toDashboardProject } from "@/lib/dashboard/projects";
import {
  createEmptyProject,
  inferJourneyStep,
  type EditorSession,
  type ProjectPlatform,
} from "@/lib/editor/create-project";

export function toEditorSession(
  record: ApiProjectRecord,
  platform: ProjectPlatform = "web",
): EditorSession {
  let project: ArcoProject;
  try {
    project = parseProjectData(record.projectData);
  } catch {
    project = createEmptyProject(record.title, "pending", 1000);
  }

  const recordingSrc =
    record.recordingSrc && record.recordingSrc !== "pending"
      ? record.recordingSrc
      : project.recording.src !== "pending"
        ? project.recording.src
        : "";

  if (recordingSrc) {
    project = {
      ...project,
      recording: {
        ...project.recording,
        src: recordingSrc,
      },
      brief: project.brief,
      template: project.template,
    };
  }

  return {
    projectId: record.id,
    project,
    platform: (record.platform as ProjectPlatform) ?? platform,
    recordingUrl: recordingSrc,
    journeyStep: inferJourneyStep(project),
    projectName: record.title || project.meta.title,
  };
}

export async function fetchDashboardProjects(token: AccessTokenSource) {
  const records = await apiListProjects(token);
  return records.map(toDashboardProject);
}

export async function fetchDashboardProject(token: AccessTokenSource, id: string) {
  const record = await apiGetProject(token, id);
  return toDashboardProject(record);
}

export async function fetchEditorProject(token: AccessTokenSource, projectId: string) {
  const record = await apiGetProject(token, projectId);
  return toEditorSession(record);
}

export async function createProject(
  token: AccessTokenSource,
  input: {
    title: string;
    platform: ProjectPlatform;
    templateId?: string;
    brief?: { intent?: string; productUrl?: string };
    stylePreset?: StylePreset;
    exportFormat?: ExportFormat;
    projectMode?: string;
  },
) {
  const record = await apiCreateProject(token, {
    title: input.title,
    platform: input.platform,
    templateId: input.templateId,
    brief: input.brief,
    stylePreset: input.stylePreset,
    exportFormat: input.exportFormat,
    projectMode: input.projectMode,
  });
  return { id: record.id };
}

export async function syncProjectRecord(
  token: AccessTokenSource,
  input: {
    projectId: string;
    project: ArcoProject;
    platform: ProjectPlatform;
    recordingSrc: string;
    thumbnailUrl?: string;
  },
) {
  return apiUpdateProject(token, input.projectId, {
    title: input.project.meta.title,
    platform: input.platform,
    stylePreset: input.project.stylePreset,
    exportFormat: input.project.exportFormat,
    projectData: input.project,
    recordingSrc: input.recordingSrc || undefined,
    markerCount: input.project.scenes?.length ?? input.project.markers.length,
    thumbnailUrl: input.thumbnailUrl,
  });
}

export async function deleteProject(token: AccessTokenSource, projectId: string) {
  return apiDeleteProject(token, projectId);
}
