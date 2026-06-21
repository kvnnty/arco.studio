import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getOAuthProviders } from "@/lib/auth/oauth";
import { getServerSession } from "@/lib/auth/session";

type PageProps = {
  searchParams: Promise<{ error?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getServerSession();
  if (session) {
    redirect(session.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  const params = await searchParams;
  const oauthProviders = await getOAuthProviders();

  return (
    <LoginForm
      oauthError={params.error ? decodeURIComponent(params.error) : undefined}
      resetSuccess={params.reset === "1"}
      oauthProviders={oauthProviders}
    />
  );
}
