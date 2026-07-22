"use client";

import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { authErrorMessage } from "@/components/auth/auth-flow-utils";
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
import { useLastUsedAuthMethod } from "@/lib/auth/last-used-method";

type LoginMode = "code" | "password";
type Step = "start" | "email-code" | "mfa";
type MfaStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

export function LoginForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lastUsed, remember } = useLastUsedAuthMethod();
  const [mode, setMode] = useState<LoginMode>("password");
  const [step, setStep] = useState<Step>("start");
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lastUsed === "email_code") setMode("code");
    if (lastUsed === "password") setMode("password");
  }, [lastUsed]);

  const finish = useCallback(async () => {
    const result = await signIn.finalize({
      navigate: async ({ decorateUrl }) => {
        const url = decorateUrl("/post-auth");
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
    if (result.error) setError(authErrorMessage(result.error));
  }, [router, signIn]);

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

  const pending = fetchStatus === "fetching";

  if (step === "email-code" || step === "mfa") {
    const isMfa = step === "mfa";
    return (
      <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
        <CardHeader>
          <CardTitle>
            {isMfa ? "Verify it’s you" : "Check your email"}
          </CardTitle>
          <CardDescription>
            {isMfa
              ? mfaStrategy === "totp"
                ? "Enter the code from your authenticator app."
                : mfaStrategy === "backup_code"
                  ? "Enter one of your backup codes."
                  : "Enter the verification code Clerk sent to your trusted contact."
              : `Enter the secure sign-in code sent to ${email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              void (isMfa
                ? verifyMfa()
                : signIn.emailCode.verifyCode({ code }).then(async (result) => {
                    if (result.error) setError(authErrorMessage(result.error));
                    else await continueFromStatus();
                  }));
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
              {!isMfa ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    void signIn.reset();
                    setStep("start");
                    setCode("");
                    setError(null);
                  }}
                >
                  Use a different email
                </Button>
              ) : null}
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
          {mode === "password"
            ? "Sign in with the email and password for your account."
            : "We’ll send a one-time code to your email."}
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

            if (mode === "password") {
              remember("password");
              void signIn
                .password({
                  emailAddress: nextEmail,
                  password: String(formData.get("password") ?? ""),
                })
                .then(async (result) => {
                  if (result.error) setError(authErrorMessage(result.error));
                  else await continueFromStatus();
                })
                .catch((caught) => setError(authErrorMessage(caught)));
              return;
            }

            remember("email_code");
            void signIn.emailCode
              .sendCode({ emailAddress: nextEmail })
              .then((result) => {
                if (result.error) setError(authErrorMessage(result.error));
                else setStep("email-code");
              })
              .catch((caught) => setError(authErrorMessage(caught)));
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
            {mode === "password" ? (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Your password"
                  />
                </FieldContent>
              </Field>
            ) : null}
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
              <LastUsedBadge
                show={
                  lastUsed === (mode === "password" ? "password" : "email_code")
                }
              />
              {pending
                ? mode === "password"
                  ? "Signing in…"
                  : "Sending code…"
                : mode === "password"
                  ? "Sign in with password"
                  : "Email me a sign-in code"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          <p>
            <button
              type="button"
              className="text-accent-foreground hover:underline"
              onClick={() => {
                setMode(mode === "password" ? "code" : "password");
                setError(null);
              }}
            >
              {mode === "password"
                ? "Use an email code instead"
                : "Sign in with password"}
            </button>
          </p>
          {mode === "password" ? (
            <p>
              <Link
                href="/forgot-password"
                className="text-accent-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          ) : null}
          <p>
            No account?{" "}
            <Link
              href="/signup"
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
