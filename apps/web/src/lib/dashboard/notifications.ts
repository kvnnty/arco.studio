import type { DashboardNotification } from "@/lib/dashboard/types";
import type { DashboardProject } from "@/lib/dashboard/projects";

export function buildProjectNotifications(
  projects: DashboardProject[],
): DashboardNotification[] {
  const notifications: DashboardNotification[] = [];

  for (const project of projects) {
    if (project.status === "completed" && project.latestExportUrl) {
      notifications.push({
        id: `${project.id}-export-ready`,
        title: "Export complete",
        description: `"${project.title}" is ready to download.`,
        type: "processing",
        read: true,
        createdAt: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }

    if (project.status === "failed") {
      notifications.push({
        id: `${project.id}-export-failed`,
        title: "Export failed",
        description:
          project.latestRenderError ??
          `Could not export "${project.title}". Try again from the project page.`,
        type: "processing",
        read: false,
        createdAt: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }

    if (project.status === "processing") {
      notifications.push({
        id: `${project.id}-export-processing`,
        title: "Export in progress",
        description: `"${project.title}" is rendering.`,
        type: "processing",
        read: false,
        createdAt: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }
  }

  return notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
