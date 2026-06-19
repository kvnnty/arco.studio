import type { ProjectStatus } from "@/lib/mock/data";
import type { ApiProjectRecord } from "@/lib/api/client";

export type DashboardProject = {
  id: string;
  title: string;
  status: ProjectStatus;
  platform: string;
  exportFormat: string;
  markerCount: number;
  updatedAt: string;
  createdAt: string;
  recordingSrc: string | null;
  latestExportUrl: string | null;
};

export function deriveProjectStatus(record: ApiProjectRecord): ProjectStatus {
  const latestRender = record.renderJobs?.[0];

  if (
    latestRender?.status === "processing" ||
    latestRender?.status === "queued"
  ) {
    return "processing";
  }

  if (latestRender?.status === "completed" && latestRender.outputUrl) {
    return "completed";
  }

  if (record.recordingSrc && record.markerCount > 0) {
    return "draft";
  }

  if (record.recordingSrc) {
    return "processing";
  }

  return "draft";
}

export function toDashboardProject(record: ApiProjectRecord): DashboardProject {
  const latestRender = record.renderJobs?.[0];

  return {
    id: record.id,
    title: record.title,
    status: deriveProjectStatus(record),
    platform: record.platform,
    exportFormat: record.exportFormat,
    markerCount: record.markerCount,
    updatedAt: record.updatedAt,
    createdAt: record.createdAt,
    recordingSrc: record.recordingSrc,
    latestExportUrl: latestRender?.outputUrl ?? null,
  };
}
