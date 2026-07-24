"use client";

import { useSignUp } from "@clerk/nextjs";

import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { CLERK_SIGN_UP_PATH } from "@/components/auth/auth-flow-utils";

/**
 * Email link sign-up verify page — display only per Clerk docs.
 * Finalize happens on the sign-up page via waitForEmailLinkVerification().
 *
 * clerk.com/docs/nextjs/guides/development/custom-flows/authentication/email-links
 */
export function MagicLinkSignUpVerification() {
  const { signUp } = useSignUp();
  const verification = signUp.verifications.emailLinkVerification;

  if (!verification) {
    return (
      <>
        <AuthStatusCard
          variant="loading"
          title="Verifying your link"
          description="Securely checking your magic link…"
        />
        <div id="clerk-captcha" />
      </>
    );
  }

  if (verification.status === "failed") {
    return (
      <AuthStatusCard
        variant="error"
        title="Verify your email"
        description="The email link verification failed."
        restartHref={CLERK_SIGN_UP_PATH}
        restartLabel="Back to sign up"
      />
    );
  }

  if (verification.status === "expired") {
    return (
      <AuthStatusCard
        variant="error"
        title="Verify your email"
        description="The email link has expired."
        restartHref={CLERK_SIGN_UP_PATH}
        restartLabel="Back to sign up"
      />
    );
  }

  if (verification.status === "client_mismatch") {
    return (
      <AuthStatusCard
        variant="error"
        title="Verify your email"
        description="You must complete the email link sign-up on the same device and browser that you started it on."
        restartHref={CLERK_SIGN_UP_PATH}
        restartLabel="Back to sign up"
      />
    );
  }

  return (
    <AuthStatusCard
      variant="success"
      title="Verify your email"
      description="Successfully verified email. You can close this tab."
      restartHref={CLERK_SIGN_UP_PATH}
      restartLabel="Back to sign up"
    />
  );
}
