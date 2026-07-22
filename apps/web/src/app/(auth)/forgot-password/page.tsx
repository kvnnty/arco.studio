import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Reset password" };

export default async function ForgotPasswordPage() {
  const { userId } = await auth();
  if (userId) redirect("/post-auth");

  return <ForgotPasswordForm />;
}
