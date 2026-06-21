import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getServerSession } from "@/lib/auth/session";

export default async function SignupPage() {
  const session = await getServerSession();
  if (session) {
    redirect(session.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  return <SignupForm />;
}
