"use client";

import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  authErrorMessage,
  CLERK_SIGN_IN_PATH,
  CLERK_SIGN_IN_CONTINUE_PATH,
  CLERK_SIGN_UP_VERIFY_PATH,
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
import { createAuthNavigate } from "@/lib/auth/auth-navigate";

export function SignupForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  useCaptureReturnTo();
  const { lastUsed } = useLastUsedAuthMethod();
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    const result = await signUp.finalize({
      navigate: createAuthNavigate(router),
    });
    if (result.error) {
      setError(authErrorMessage(result.error));
      return;
    }
    commitAuthMethod("email_link");
  };

  const sendMagicLink = async (nextEmail: string) => {
    setVerifying(true);
    setError(null);

    const created = await signUp.create({ emailAddress: nextEmail });
    if (created.error) {
      setError(authErrorMessage(created.error));
      setVerifying(false);
      return;
    }

    const sent = await signUp.verifications.sendEmailLink({
      verificationUrl: emailLinkVerificationUrl(CLERK_SIGN_UP_VERIFY_PATH),
    });
    if (sent.error) {
      setError(authErrorMessage(sent.error));
      setVerifying(false);
      return;
    }

    const waited = await signUp.verifications.waitForEmailLinkVerification();
    if (waited.error) {
      setError(authErrorMessage(waited.error));
      setVerifying(false);
      return;
    }

    if (signUp.status === "complete") {
      await finish();
      return;
    }

    if (signUp.status === "missing_requirements") {
      router.push(CLERK_SIGN_IN_CONTINUE_PATH);
      return;
    }

    setError(
      `Account setup still requires: ${signUp.missingFields.join(", ") || "an additional step"}.`,
    );
    setVerifying(false);
  };

  const pending = fetchStatus === "fetching";

  if (verifying) {
    return (
      <>
        <Card className="w-full max-w-md border border-border/60 shadow-sm">
          <CardHeader className="items-center space-y-3 pb-2 text-center">
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription className="text-balance leading-relaxed">
              {error
                ? error
                : `We sent an account verification link to ${email}. Open it to continue — this page will finish sign-up automatically.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                void signUp.reset();
                setVerifying(false);
                setError(null);
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
        <div id="clerk-captcha" />
      </>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Use Google, GitHub, or verify your email with a secure magic link.
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
              {pending ? "Sending link…" : "Continue with magic link"}
            </Button>
            <div id="clerk-captcha" />
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={CLERK_SIGN_IN_PATH}
            className="text-accent-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
