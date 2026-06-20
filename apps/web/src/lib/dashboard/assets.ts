import type { DashboardAsset } from "@/lib/dashboard/types";
import type { DashboardProject } from "@/lib/dashboard/projects";

export function buildProjectAssets(
  projects: DashboardProject[],
): DashboardAsset[] {
  const assets: DashboardAsset[] = [];

  for (const project of projects) {
    if (project.recordingSrc) {
      assets.push({
        id: `${project.id}-recording`,
        name: `${project.title} recording`,
        type: "recording",
        projectId: project.id,
        createdAt: project.createdAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }

    if (project.latestExportUrl) {
      assets.push({
        id: `${project.id}-export`,
        name: `${project.title} export`,
        type: "output",
        projectId: project.id,
        createdAt: project.updatedAt,
        href: `/dashboard/projects/${project.id}`,
      });
    }
  }

  return assets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
