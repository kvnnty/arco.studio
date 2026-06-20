import { listDashboardProjects } from "@/app/actions/projects";
import { AssetsPageClient } from "@/components/dashboard/assets-page-client";
import { buildProjectAssets } from "@/lib/dashboard/assets";

export default async function AssetsPage() {
  const projects = await listDashboardProjects();
  const assets = buildProjectAssets(projects);

  return <AssetsPageClient assets={assets} />;
}
