"use client";

import { useConsent } from "@/components/consent/consent-provider";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppTopbar } from "@/components/dashboard/app-topbar";
import { DashboardPaywall } from "@/components/dashboard/dashboard-paywall";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
  exportsRemaining: number;
  planActive: boolean;
  billing: React.ComponentProps<typeof AppSidebar>["billing"];
};

export function DashboardShell({
  children,
  user,
  exportsRemaining,
  planActive,
  billing,
}: DashboardShellProps) {
  const { consent } = useConsent();

  return (
    <SidebarProvider persistState={consent.functional}>
      <AppSidebar billing={billing} />
      <SidebarInset>
        <AppTopbar
          user={user}
          exportsRemaining={exportsRemaining}
          planActive={planActive}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <DashboardPaywall canUseProduct={planActive}>{children}</DashboardPaywall>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
