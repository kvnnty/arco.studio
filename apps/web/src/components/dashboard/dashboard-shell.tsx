"use client";

import { useConsent } from "@/components/consent/consent-provider";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppTopbar } from "@/components/dashboard/app-topbar";
import { DashboardPaywall } from "@/components/dashboard/dashboard-paywall";
import { DashboardThemeProvider } from "@/components/providers/dashboard-theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useBillingStatus } from "@/lib/api/hooks/billing";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const { consent } = useConsent();
  const {
    data: billing,
    isLoading: billingLoading,
    isError: billingError,
  } = useBillingStatus();

  const planActive = billing?.canUseProduct ?? false;
  const availableCredits = billing?.credits.available ?? 0;

  return (
    <DashboardThemeProvider>
      <SidebarProvider persistState={consent.functional}>
        <AppSidebar billing={billing ?? null} />
        <SidebarInset>
          <AppTopbar
            user={user}
            availableCredits={availableCredits}
            planActive={planActive}
          />
          <div className="flex-1 overflow-y-auto p-6">
            <DashboardPaywall
              canUseProduct={planActive}
              billingLoading={billingLoading}
              billingError={billingError}
            >
              {children}
            </DashboardPaywall>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardThemeProvider>
  );
}
