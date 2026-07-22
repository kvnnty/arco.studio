import { getAuthenticatedUser } from "@/lib/auth/session";
import { DashboardHomeClient } from "@/components/dashboard/dashboard-home-client";

export const metadata = {
  title: "Home",
};

type PageProps = {
  searchParams: Promise<{ template?: string }>;
};

export default async function DashboardHomePage({ searchParams }: PageProps) {
  const user = await getAuthenticatedUser();
  const params = await searchParams;

  return (
    <DashboardHomeClient
      userName={user?.name}
      initialTemplateId={params.template ?? null}
    />
  );
}
