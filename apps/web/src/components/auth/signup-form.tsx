"use client";

import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export function SignupForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const { lastUsed, remember } = useLastUsedAuthMethod();
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    const result = await signUp.finalize({
      navigate: async ({ decorateUrl }) => {
        const url = decorateUrl("/post-auth");
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
    if (result.error) setError(authErrorMessage(result.error));
  };

  const pending = fetchStatus === "fetching";

  if (verifying) {
    return (
      <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Enter the verification code Clerk sent to {email}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              void signUp.verifications
                .verifyEmailCode({ code })
                .then(async (result) => {
                  if (result.error) {
                    setError(authErrorMessage(result.error));
                    return;
                  }
                  if (signUp.status === "complete") {
                    await finish();
                    return;
                  }
                  setError(
                    `Account setup still requires: ${signUp.missingFields.join(", ") || "an additional step"}.`,
                  );
                })
                .catch((caught) => setError(authErrorMessage(caught)));
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-code">Verification code</FieldLabel>
                <FieldContent>
                  <Input
                    id="signup-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    autoComplete="one-time-code"
                    inputMode="numeric"
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
                {pending ? "Verifying…" : "Verify and create account"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  void signUp.reset();
                  setVerifying(false);
                  setCode("");
                  setError(null);
                }}
              >
                Use a different email
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
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Create your account with a verified email and secure password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons
          intent="sign-up"
          onError={(message) => setError(message || null)}
        />
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            remember("password");
            const formData = new FormData(event.currentTarget);
            const nextEmail = String(formData.get("email") ?? "").trim();
            setEmail(nextEmail);

            void signUp
              .password({
                emailAddress: nextEmail,
                password: String(formData.get("password") ?? ""),
              })
              .then(async (result) => {
                if (result.error) {
                  setError(authErrorMessage(result.error));
                  return;
                }
                if (signUp.status === "complete") {
                  await finish();
                  return;
                }
                if (signUp.unverifiedFields.includes("email_address")) {
                  const verification =
                    await signUp.verifications.sendEmailCode();
                  if (verification.error) {
                    setError(authErrorMessage(verification.error));
                    return;
                  }
                  setVerifying(true);
                  return;
                }
                setError(
                  `Account setup still requires: ${signUp.missingFields.join(", ") || "an additional step"}.`,
                );
              })
              .catch((caught) => setError(authErrorMessage(caught)));
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <FieldContent>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
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
              <LastUsedBadge show={lastUsed === "password"} />
              {pending ? "Creating account…" : "Create account"}
            </Button>
            <div id="clerk-captcha" />
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
