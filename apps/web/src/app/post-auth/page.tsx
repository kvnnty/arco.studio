import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function PostAuthPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  redirect(user.onboardingCompleted ? "/dashboard" : "/onboarding");
}
