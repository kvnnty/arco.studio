"use client";

import Link from "next/link";
import { useState } from "react";

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
import {
  useMagicLinkMutation,
  useRegisterMutation,
} from "@/lib/api/hooks/auth";
import type { OAuthProviderId } from "@/lib/auth/oauth";

type SignupMode = "magic" | "password";

type SignupFormProps = {
  oauthProviders?: OAuthProviderId[];
};

export function SignupForm({ oauthProviders = [] }: SignupFormProps) {
  const [mode, setMode] = useState<SignupMode>("magic");
  const [sent, setSent] = useState<{
    message?: string;
    devVerifyUrl?: string;
  } | null>(null);

  const magicLink = useMagicLinkMutation();
  const register = useRegisterMutation();

  const pending = mode === "magic" ? magicLink.isPending : register.isPending;
  const error =
    mode === "magic"
      ? magicLink.error?.message
      : register.error?.message;

  if (sent) {
    return (
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            {sent.message ??
              "We sent a verification link. Confirm your email to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && sent.devVerifyUrl ? (
            <>
              <Alert>
                <AlertDescription>
                  Development mode: open the verification link below.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full"
                render={<Link href={sent.devVerifyUrl} />}
              >
                Open verification link
              </Button>
            </>
          ) : null}
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/login" />}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-none ring-0 shadow-none">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          {mode === "magic"
            ? "Start with just your email. Add a password later if you want."
            : "Create your account with an email and password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons providers={oauthProviders} />
        {mode === "magic" ? (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              magicLink.mutate(String(formData.get("email") ?? ""), {
                onSuccess: (result) => {
                  setSent({ devVerifyUrl: result.devVerifyUrl });
                },
              });
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
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending link…" : "Continue with email"}
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              register.mutate(
                {
                  email: String(formData.get("email") ?? ""),
                  password: String(formData.get("password") ?? ""),
                },
                {
                  onSuccess: (result) => {
                    setSent({
                      message: result.message,
                      devVerifyUrl: result.devVerifyUrl,
                    });
                  },
                },
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
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creating account…" : "Create account"}
              </Button>
            </FieldGroup>
          </form>
        )}

        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          <p>
            {mode === "magic" ? (
              <>
                Prefer a password?{" "}
                <button
                  type="button"
                  className="text-accent-foreground hover:underline"
                  onClick={() => setMode("password")}
                >
                  Create account with password
                </button>
              </>
            ) : (
              <button
                type="button"
                className="text-accent-foreground hover:underline"
                onClick={() => setMode("magic")}
              >
                Use a magic link instead
              </button>
            )}
          </p>
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-accent-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
