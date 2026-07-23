"use client";

import { useAuth, useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  authErrorMessage,
  CLERK_SIGN_IN_CONTINUE_PATH,
  CLERK_SIGN_IN_PATH,
} from "@/components/auth/auth-flow-utils";
import { AuthStatusCard } from "@/components/auth/auth-status-card";
import {
  commitAuthMethod,
  consumeStashedAuthMethod,
} from "@/lib/auth/last-used-method";
import { createAuthNavigate } from "@/lib/auth/sync-product-user";

const CALLBACK_TIMEOUT_MS = 20_000;

/**
 * Clerk Core 3 SSO callback — official custom flow:
 * clerk.com/docs/nextjs/guides/development/custom-flows/authentication/oauth-connections
 */
export function SsoCallback() {
  const clerk = useClerk();
  const { getToken } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;

      const navigate = createAuthNavigate(router, getToken);
      const stash = consumeStashedAuthMethod();

      const rememberSuccess = () => {
        if (stash) commitAuthMethod(stash);
      };

      const finalizeSignIn = async () => {
        try {
          const result = await signIn.finalize({ navigate });
          if (result.error) {
            setError(authErrorMessage(result.error));
            return false;
          }
          rememberSuccess();
          return true;
        } catch {
          setError(
            "We couldn't finish setting up your account. Try signing in again.",
          );
          return false;
        }
      };

      const finalizeSignUp = async () => {
        try {
          const result = await signUp.finalize({ navigate });
          if (result.error) {
            setError(authErrorMessage(result.error));
            return false;
          }
          rememberSuccess();
          return true;
        } catch {
          setError(
            "We couldn't finish setting up your account. Try signing in again.",
          );
          return false;
        }
      };

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (signUp.isTransferable) {
        await signIn.create({ transfer: true });
        const signInStatus = signIn.status as typeof signIn.status | "complete";
        if (signInStatus === "complete") {
          await finalizeSignIn();
          return;
        }
        router.push(CLERK_SIGN_IN_PATH);
        return;
      }

      if (
        signIn.status === "needs_first_factor" &&
        !signIn.supportedFirstFactors?.every(
          (factor) => factor.strategy === "enterprise_sso",
        )
      ) {
        router.push(CLERK_SIGN_IN_PATH);
        return;
      }

      if (signIn.isTransferable) {
        await signUp.create({ transfer: true });
        if (signUp.status === "complete") {
          await finalizeSignUp();
          return;
        }
        router.push(CLERK_SIGN_IN_CONTINUE_PATH);
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_new_password"
      ) {
        router.push(CLERK_SIGN_IN_PATH);
        return;
      }

      if (signIn.existingSession || signUp.existingSession) {
        const sessionId =
          signIn.existingSession?.sessionId ?? signUp.existingSession?.sessionId;
        if (sessionId) {
          await clerk.setActive({ session: sessionId, navigate });
          rememberSuccess();
          return;
        }
      }

      setError(
        "We couldn't finish connecting your account. Try signing in again.",
      );
    })();
  }, [clerk, getToken, router, signIn, signUp]);

  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => {
      router.replace(CLERK_SIGN_IN_PATH);
    }, CALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [error, router]);

  if (error) {
    return (
      <AuthStatusCard
        variant="error"
        title="Sign-in failed"
        description={error}
        restartHref={CLERK_SIGN_IN_PATH}
      />
    );
  }

  return (
    <>
      <AuthStatusCard
        variant="loading"
        title="Finishing sign-in"
        description="Securely connecting your account…"
      />
      <div id="clerk-captcha" className="hidden" aria-hidden />
    </>
  );
}
