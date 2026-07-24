import { redirect } from "next/navigation";

import { ProductUserUnavailable } from "@/components/auth/product-user-unavailable";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import {
  getAuthenticatedUser,
  requireAuth,
} from "@/lib/auth/session";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  await requireAuth();
  const user = await getAuthenticatedUser();
  if (!user) return <ProductUserUnavailable />;
  if (user.onboardingCompleted) redirect("/dashboard");
  return <OnboardingClient user={user} />;
}
