import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    const pathname = (await headers()).get("x-arco-pathname") ?? "/dashboard";
    redirect(`/api/auth/continue?returnTo=${encodeURIComponent(pathname)}`);
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    >
      {children}
    </DashboardShell>
  );
}
