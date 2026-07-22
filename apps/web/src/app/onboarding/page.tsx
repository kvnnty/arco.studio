import { redirect } from "next/navigation";

import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  if (user.onboardingCompleted) redirect("/dashboard");
  return <OnboardingClient user={user} />;
}
