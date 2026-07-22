import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  const { userId } = await auth();
  if (userId) redirect("/post-auth");

  return <SignupForm />;
}
