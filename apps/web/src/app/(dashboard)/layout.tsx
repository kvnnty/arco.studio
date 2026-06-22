import { getServerSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <DashboardShell
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
    >
      {children}
    </DashboardShell>
  );
}
