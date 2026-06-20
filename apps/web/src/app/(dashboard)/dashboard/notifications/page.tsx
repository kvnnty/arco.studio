import { listDashboardProjects } from "@/app/actions/projects";
import { NotificationsPageClient } from "@/components/dashboard/notifications-page-client";
import { buildProjectNotifications } from "@/lib/dashboard/notifications";

export default async function NotificationsPage() {
  const projects = await listDashboardProjects();
  const notifications = buildProjectNotifications(projects);

  return <NotificationsPageClient notifications={notifications} />;
}
