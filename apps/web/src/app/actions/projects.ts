"use server";

import type { ArcoProject } from "@arco/project-schema";

import { auth } from "@/auth";
import {
  apiCreateProject,
  apiGetProject,
  apiListProjects,
  apiUpdateProject,
  parseProjectData,
  type ApiProjectRecord,
} from "@/lib/api/client";
import {
  toDashboardProject,
  type DashboardProject,
} from "@/lib/dashboard/projects";
import {
  createEmptyProject,
  inferJourneyStep,
  type EditorSession,
  type ProjectPlatform,
} from "@/lib/editor/create-project";

async function requireAccessToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }
  return session.accessToken;
}

function toEditorSession(
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

export async function listDashboardProjects(): Promise<DashboardProject[]> {
  const session = await auth();
  if (!session?.accessToken) return [];

  const records = await apiListProjects(session.accessToken);
  return records.map(toDashboardProject);
}

export async function getDashboardProject(
  id: string,
): Promise<DashboardProject | null> {
  const session = await auth();
  if (!session?.accessToken) return null;

  try {
    const record = await apiGetProject(session.accessToken, id);
    return toDashboardProject(record);
  } catch {
    return null;
  }
}

export async function createEditorProject(input: {
  title: string;
  platform: ProjectPlatform;
}): Promise<{ id: string }> {
  const token = await requireAccessToken();
  const emptyProject = createEmptyProject(input.title, "pending", 1000);

  const record = await apiCreateProject(token, {
    title: input.title,
    platform: input.platform,
    exportFormat: emptyProject.exportFormat ?? "16:9",
    projectData: emptyProject,
  });

  return { id: record.id };
}

export async function loadEditorProject(
  projectId: string,
): Promise<EditorSession | null> {
  const token = await requireAccessToken();

  try {
    const record = await apiGetProject(token, projectId);
    return toEditorSession(record);
  } catch {
    return null;
  }
}

export async function syncProject(input: {
  projectId: string;
  project: ArcoProject;
  platform: ProjectPlatform;
  recordingSrc: string;
}) {
  const session = await auth();
  if (!session?.accessToken) return;

  await apiUpdateProject(session.accessToken, input.projectId, {
    title: input.project.meta.title,
    platform: input.platform,
    stylePreset: input.project.stylePreset,
    exportFormat: input.project.exportFormat,
    projectData: input.project,
    recordingSrc: input.recordingSrc || undefined,
    markerCount: input.project.markers.length,
  });
}

export async function syncProjectSummary(input: {
  id: string;
  title: string;
  platform: string;
  exportFormat: string;
  markerCount: number;
}) {
  const session = await auth();
  if (!session?.accessToken) return;

  await apiUpdateProject(session.accessToken, input.id, {
    title: input.title,
    platform: input.platform,
    exportFormat: input.exportFormat,
    markerCount: input.markerCount,
  });
}
