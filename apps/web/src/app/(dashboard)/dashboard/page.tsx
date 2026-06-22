import { getServerSession } from "@/lib/auth/session";
import { DashboardHomeClient } from "@/components/dashboard/dashboard-home-client";

export default async function DashboardHomePage() {
  const session = await getServerSession();

  return <DashboardHomeClient userName={session?.user?.name} />;
}
