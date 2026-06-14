import { redirect } from "next/navigation";

import { verifyMagicLinkAction } from "@/app/actions/auth";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyMagicLinkPage({
  searchParams,
}: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login?error=missing-token");
  }

  const result = await verifyMagicLinkAction(token);
  if (result.error) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/dashboard");
}
