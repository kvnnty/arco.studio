import { redirect } from "next/navigation";

import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import { getServerSession } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  if (session.user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingClient user={session.user} />;
}
