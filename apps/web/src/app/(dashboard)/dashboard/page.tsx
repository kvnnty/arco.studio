import { getServerSession } from "@/lib/auth/session";
import { DashboardHomeClient } from "@/components/dashboard/dashboard-home-client";

export const metadata = {
  title: "Home",
};

type PageProps = {
  searchParams: Promise<{ template?: string }>;
};

export default async function DashboardHomePage({ searchParams }: PageProps) {
  const session = await getServerSession();
  const params = await searchParams;

  return (
    <DashboardHomeClient
      userName={session?.user?.name}
      initialTemplateId={params.template ?? null}
    />
  );
}
