import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Sign up" };

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
