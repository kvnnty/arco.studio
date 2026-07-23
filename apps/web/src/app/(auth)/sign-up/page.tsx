import { Suspense } from "react";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
