import { redirect } from "next/navigation";

import { ProductUserUnavailable } from "@/components/auth/product-user-unavailable";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) return <ProductUserUnavailable />;
  if (!user.onboardingCompleted) redirect("/onboarding");

  return (
    <DashboardShell user={{ name: user.name, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
