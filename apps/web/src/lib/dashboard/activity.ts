import type { DashboardActivity } from "@/lib/dashboard/types";
import type { DashboardProject } from "@/lib/dashboard/projects";

export function buildProjectActivity(
  projects: DashboardProject[],
  limit = 10,
): DashboardActivity[] {
  const items: DashboardActivity[] = [];

  for (const project of projects) {
    items.push({
      id: `${project.id}-created`,
      action: "Created project",
      target: project.title,
      timestamp: project.createdAt,
      href: `/dashboard/projects/${project.id}`,
    });

    if (project.recordingSrc) {
      items.push({
        id: `${project.id}-recording`,
        action: "Uploaded recording",
        target: project.title,
        timestamp: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }

    if (project.status === "completed" && project.latestExportUrl) {
      items.push({
        id: `${project.id}-export`,
        action: "Exported video",
        target: project.title,
        timestamp: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }

    if (project.status === "failed") {
      items.push({
        id: `${project.id}-failed`,
        action: "Export failed",
        target: project.title,
        timestamp: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }

    if (project.status === "processing") {
      items.push({
        id: `${project.id}-processing`,
        action: "Export in progress",
        target: project.title,
        timestamp: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, limit);
}
