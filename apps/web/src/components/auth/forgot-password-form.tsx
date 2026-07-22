"use client";

import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authErrorMessage } from "@/components/auth/auth-flow-utils";
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

type Step = "email" | "code" | "password";

export function ForgotPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pending = fetchStatus === "fetching";

  const finish = async () => {
    if (signIn.status === "complete") {
      const result = await signIn.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/post-auth");
          if (url.startsWith("http")) window.location.href = url;
          else router.push(url);
        },
      });
      if (result.error) setError(authErrorMessage(result.error));
      return;
    }
    if (signIn.status === "needs_second_factor") {
      router.push("/login?resume=1");
      return;
    }
    setError("Password changed, but sign-in needs another verification step.");
  };

  const descriptions: Record<Step, string> = {
    email: "Enter your email and we’ll send a secure reset code.",
    code: `Enter the password reset code sent to ${email}.`,
    password:
      "Choose a new password. Other active sessions will be signed out.",
  };

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>{descriptions[step]}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const formData = new FormData(event.currentTarget);

            if (step === "email") {
              const nextEmail = String(formData.get("email") ?? "").trim();
              setEmail(nextEmail);
              void signIn
                .create({ identifier: nextEmail })
                .then(async (created) => {
                  if (created.error) {
                    setError(authErrorMessage(created.error));
                    return;
                  }
                  const sent = await signIn.resetPasswordEmailCode.sendCode();
                  if (sent.error) setError(authErrorMessage(sent.error));
                  else setStep("code");
                })
                .catch((caught) => setError(authErrorMessage(caught)));
              return;
            }

            if (step === "code") {
              void signIn.resetPasswordEmailCode
                .verifyCode({ code })
                .then((result) => {
                  if (result.error) setError(authErrorMessage(result.error));
                  else if (signIn.status === "needs_new_password")
                    setStep("password");
                  else
                    setError("The reset code could not advance this request.");
                })
                .catch((caught) => setError(authErrorMessage(caught)));
              return;
            }

            void signIn.resetPasswordEmailCode
              .submitPassword({
                password: String(formData.get("password") ?? ""),
                signOutOfOtherSessions: true,
              })
              .then(async (result) => {
                if (result.error) setError(authErrorMessage(result.error));
                else await finish();
              })
              .catch((caught) => setError(authErrorMessage(caught)));
          }}
        >
          <FieldGroup>
            {step === "email" ? (
              <Field>
                <FieldLabel htmlFor="recovery-email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                  />
                </FieldContent>
              </Field>
            ) : null}
            {step === "code" ? (
              <Field>
                <FieldLabel htmlFor="recovery-code">Reset code</FieldLabel>
                <FieldContent>
                  <Input
                    id="recovery-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    required
                    autoFocus
                  />
                </FieldContent>
              </Field>
            ) : null}
            {step === "password" ? (
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <FieldContent>
                  <Input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    autoFocus
                  />
                </FieldContent>
              </Field>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "Working…"
                : step === "email"
                  ? "Send reset code"
                  : step === "code"
                    ? "Verify code"
                    : "Set new password"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="text-accent-foreground hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
