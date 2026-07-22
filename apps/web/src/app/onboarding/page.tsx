import { redirect } from "next/navigation";

import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import {
  getServerSession,
  hasRefreshSession,
} from "@/lib/auth/session";

export const metadata = {
  title: "Welcome",
};

export default async function OnboardingPage() {
  const [session, hasRefresh] = await Promise.all([
    getServerSession(),
    hasRefreshSession(),
  ]);

  if (!session && !hasRefresh) {
    redirect("/login");
  }

  if (session?.user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingClient user={session?.user ?? null} />;
}
