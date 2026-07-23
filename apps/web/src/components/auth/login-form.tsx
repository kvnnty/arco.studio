"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  authErrorMessage,
  CLERK_SIGN_IN_VERIFY_PATH,
  CLERK_SIGN_UP_PATH,
  emailLinkVerificationUrl,
} from "@/components/auth/auth-flow-utils";
import { LastUsedBadge } from "@/components/auth/last-used-badge";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCaptureReturnTo } from "@/hooks/use-capture-return-to";
import { commitAuthMethod } from "@/lib/auth/last-used-method";
import { useLastUsedAuthMethod } from "@/lib/auth/use-last-used-auth-method";
import { createAuthNavigate } from "@/lib/auth/sync-product-user";

type Step = "start" | "email-link" | "mfa";
type MfaStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

export function LoginForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  useCaptureReturnTo();
  const { lastUsed } = useLastUsedAuthMethod();
  const [step, setStep] = useState<Step>("start");
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const finish = useCallback(async () => {
    const result = await signIn.finalize({
      navigate: createAuthNavigate(router, getToken),
    });
    if (result.error) {
      setError(authErrorMessage(result.error));
      return;
    }
    commitAuthMethod("email_link");
  }, [getToken, router, signIn]);

  const prepareMfa = useCallback(async () => {
    const strategies = new Set(
      signIn.supportedSecondFactors.map((factor) => factor.strategy),
    );
    let strategy: MfaStrategy | null = null;
    let result: { error: unknown | null } = { error: null };

    if (
      strategies.has("email_code") ||
      signIn.status === "needs_client_trust"
    ) {
      strategy = "email_code";
      result = await signIn.mfa.sendEmailCode();
    } else if (strategies.has("phone_code")) {
      strategy = "phone_code";
      result = await signIn.mfa.sendPhoneCode();
    } else if (strategies.has("totp")) {
      strategy = "totp";
    } else if (strategies.has("backup_code")) {
      strategy = "backup_code";
    }

    if (result.error) {
      setError(authErrorMessage(result.error));
      return;
    }
    if (!strategy) {
      setError(
        "This account requires a verification method Arco cannot access.",
      );
      return;
    }

    setCode("");
    setMfaStrategy(strategy);
    setStep("mfa");
  }, [signIn]);

  const continueFromStatus = useCallback(async () => {
    if (signIn.status === "complete") {
      await finish();
      return;
    }
    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      await prepareMfa();
      return;
    }
    setError("Sign-in needs an additional authentication step. Try again.");
  }, [finish, prepareMfa, signIn.status]);

  useEffect(() => {
    if (
      searchParams.get("resume") === "1" &&
      (signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust")
    ) {
      void prepareMfa();
    }
  }, [prepareMfa, searchParams, signIn.status]);

  const verifyMfa = async () => {
    if (!mfaStrategy) return;
    const result =
      mfaStrategy === "email_code"
        ? await signIn.mfa.verifyEmailCode({ code })
        : mfaStrategy === "phone_code"
          ? await signIn.mfa.verifyPhoneCode({ code })
          : mfaStrategy === "totp"
            ? await signIn.mfa.verifyTOTP({ code })
            : await signIn.mfa.verifyBackupCode({ code });

    if (result.error) {
      setError(authErrorMessage(result.error));
      return;
    }
    await continueFromStatus();
  };

  const sendMagicLink = async (nextEmail: string) => {
    const sent = await signIn.emailLink.sendLink({
      emailAddress: nextEmail,
      verificationUrl: emailLinkVerificationUrl(CLERK_SIGN_IN_VERIFY_PATH),
    });
    if (sent.error) {
      setError(authErrorMessage(sent.error));
      return;
    }

    setStep("email-link");

    const waited = await signIn.emailLink.waitForVerification();
    if (waited.error) {
      setError(authErrorMessage(waited.error));
      setStep("start");
      return;
    }

    const verification = signIn.firstFactorVerification;
    if (verification.status === "expired") {
      setError("The email link has expired. Request a new one.");
      setStep("start");
      return;
    }

    if (signIn.status === "complete") {
      await finish();
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      await prepareMfa();
      return;
    }

    setError("Sign-in needs an additional authentication step. Try again.");
    setStep("start");
  };

  const pending = fetchStatus === "fetching";
  const firstFactorVerification = signIn.firstFactorVerification;

  if (firstFactorVerification.status === "expired" && step === "start") {
    return (
      <Card className="w-full max-w-md border border-border/60 shadow-sm">
        <CardHeader className="items-center space-y-3 pb-2 text-center">
          <CardTitle className="text-xl">Link expired</CardTitle>
          <CardDescription className="text-balance leading-relaxed">
            The email link has expired. Request a new one to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              void signIn.reset();
              setError(null);
            }}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "email-link") {
    return (
      <Card className="w-full max-w-md border border-border/60 shadow-sm">
        <CardHeader className="items-center space-y-3 pb-2 text-center">
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription className="text-balance leading-relaxed">
            {error
              ? error
              : `We sent a secure sign-in link to ${email}. Open it to continue — this page will finish sign-in automatically.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              void signIn.reset();
              setStep("start");
              setError(null);
            }}
          >
            Use a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "mfa") {
    return (
      <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
        <CardHeader>
          <CardTitle>Verify it’s you</CardTitle>
          <CardDescription>
            {mfaStrategy === "totp"
              ? "Enter the code from your authenticator app."
              : mfaStrategy === "backup_code"
                ? "Enter one of your backup codes."
                : "Enter the verification code Clerk sent to your trusted contact."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              void verifyMfa();
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="code">Verification code</FieldLabel>
                <FieldContent>
                  <Input
                    id="code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    autoComplete="one-time-code"
                    inputMode={
                      mfaStrategy === "backup_code" ? "text" : "numeric"
                    }
                    required
                    autoFocus
                  />
                </FieldContent>
              </Field>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Verifying…" : "Verify and continue"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          We’ll email you a secure link—no password or code required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons
          intent="sign-in"
          onError={(message) => setError(message || null)}
        />
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const formData = new FormData(event.currentTarget);
            const nextEmail = String(formData.get("email") ?? "").trim();
            setEmail(nextEmail);
            void sendMagicLink(nextEmail).catch((caught) =>
              setError(authErrorMessage(caught)),
            );
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                />
              </FieldContent>
            </Field>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              type="submit"
              className="relative w-full"
              disabled={pending}
            >
              <LastUsedBadge show={lastUsed === "email_link"} />
              {pending ? "Sending link…" : "Email me a magic link"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            No account?{" "}
            <Link
              href={CLERK_SIGN_UP_PATH}
              className="text-accent-foreground hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
