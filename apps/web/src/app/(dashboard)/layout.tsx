import { getServerSession } from "@/lib/auth/session";
import { getBillingStatusAction } from "@/app/actions/billing";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const billing = session?.accessToken
    ? await getBillingStatusAction().catch(() => null)
    : null;

  return (
    <DashboardShell
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
      exportsRemaining={billing?.exportsRemaining ?? 0}
      planActive={billing?.canUseProduct ?? false}
      billing={billing}
    >
      {children}
    </DashboardShell>
  );
}
