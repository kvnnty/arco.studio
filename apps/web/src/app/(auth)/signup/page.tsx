import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <SignupForm />;
}
