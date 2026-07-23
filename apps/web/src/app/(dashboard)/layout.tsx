import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { resolveProductUser } from "@/lib/auth/session";
import { signInUrl } from "@/lib/auth/return-to";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await resolveProductUser();
  if (!user) redirect(signInUrl("/dashboard"));
  if (!user.onboardingCompleted) redirect("/onboarding");

  return (
    <DashboardShell user={{ name: user.name, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
