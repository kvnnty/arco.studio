import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect("/post-auth");

  return <LoginForm />;
}
