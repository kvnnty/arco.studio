import { redirect } from "next/navigation";

import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import { resolveProductUser } from "@/lib/auth/session";
import { signInUrl } from "@/lib/auth/return-to";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await resolveProductUser();
  if (!user) redirect(signInUrl("/onboarding"));
  if (user.onboardingCompleted) redirect("/dashboard");
  return <OnboardingClient user={user} />;
}
