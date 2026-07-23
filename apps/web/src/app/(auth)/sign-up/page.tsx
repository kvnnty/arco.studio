import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignupForm } from "@/components/auth/signup-form";
import { resolveProductUser } from "@/lib/auth/session";

export const metadata = { title: "Sign up" };

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    const user = await resolveProductUser({ maxAttempts: 3, retryMs: 200 });
    if (user) {
      redirect(user.onboardingCompleted ? "/dashboard" : "/onboarding");
    }
  }

  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
