"use client";

import { useSignIn } from "@clerk/nextjs";

import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { CLERK_SIGN_IN_PATH } from "@/components/auth/auth-flow-utils";

/**
 * Email link sign-in verify page — display only per Clerk docs.
 * Finalize happens on the sign-in page via waitForVerification().
 *
 * clerk.com/docs/nextjs/guides/development/custom-flows/authentication/email-links
 */
export function MagicLinkSignInVerification() {
  const { signIn } = useSignIn();
  const verification = signIn.emailLink.verification;

  if (!verification) {
    return (
      <AuthStatusCard
        variant="loading"
        title="Verifying your link"
        description="Securely checking your magic link…"
      />
    );
  }

  if (verification.status === "failed") {
    return (
      <AuthStatusCard
        variant="error"
        title="Verify your email"
        description="The email link verification failed."
        restartHref={CLERK_SIGN_IN_PATH}
      />
    );
  }

  if (verification.status === "expired") {
    return (
      <AuthStatusCard
        variant="error"
        title="Verify your email"
        description="The email link has expired."
        restartHref={CLERK_SIGN_IN_PATH}
      />
    );
  }

  if (verification.status === "client_mismatch") {
    return (
      <AuthStatusCard
        variant="error"
        title="Verify your email"
        description="You must complete the email link sign-in on the same device and browser that you started it on."
        restartHref={CLERK_SIGN_IN_PATH}
      />
    );
  }

  return (
    <AuthStatusCard
      variant="success"
      title="Verify your email"
      description="Successfully verified email. You can close this tab."
      restartHref={CLERK_SIGN_IN_PATH}
      restartLabel="Back to sign in"
    />
  );
}
