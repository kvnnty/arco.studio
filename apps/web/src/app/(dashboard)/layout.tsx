import { auth } from "@/auth";
import { getBillingStatusAction } from "@/app/actions/billing";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppTopbar } from "@/components/dashboard/app-topbar";
import { DashboardPaywall } from "@/components/dashboard/dashboard-paywall";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const billing = session?.accessToken
    ? await getBillingStatusAction().catch(() => null)
    : null;

  return (
    <SidebarProvider>
      <AppSidebar billing={billing} />
      <SidebarInset>
        <AppTopbar
          user={{
            name: session?.user?.name,
            email: session?.user?.email,
          }}
          exportsRemaining={billing?.exportsRemaining ?? 0}
          planActive={billing?.canUseProduct ?? false}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <DashboardPaywall canUseProduct={billing?.canUseProduct ?? false}>
            {children}
          </DashboardPaywall>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
