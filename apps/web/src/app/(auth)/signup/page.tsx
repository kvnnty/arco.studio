import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getOAuthProviders } from "@/lib/auth/oauth";
import { getServerSession } from "@/lib/auth/session";

export default async function SignupPage() {
  const session = await getServerSession();
  if (session) {
    redirect(session.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  const oauthProviders = await getOAuthProviders();

  return <SignupForm oauthProviders={oauthProviders} />;
}
