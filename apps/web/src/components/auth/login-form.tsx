"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  magicLinkAction,
  passwordLoginAction,
  type AuthFormState,
} from "@/app/actions/auth";
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
const initialState: AuthFormState = {};

type LoginMode = "magic" | "password";

import type { OAuthProviderId } from "@/lib/auth/oauth";

type LoginFormProps = {
  oauthError?: string;
  resetSuccess?: boolean;
  oauthProviders?: OAuthProviderId[];
};

export function LoginForm({
  oauthError,
  resetSuccess,
  oauthProviders = [],
}: LoginFormProps) {
  const [mode, setMode] = useState<LoginMode>("magic");
  const [magicState, magicAction, magicPending] = useActionState(
    magicLinkAction,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    passwordLoginAction,
    initialState,
  );

  const state = mode === "magic" ? magicState : passwordState;
  const pending = mode === "magic" ? magicPending : passwordPending;

  if (state.sent) {
    return (
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a secure sign-in link. It expires in 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.message ? (
            <Alert>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {process.env.NODE_ENV === "development" && state.devVerifyUrl ? (
            <>
              <Alert>
                <AlertDescription>
                  Email delivery is not configured yet. Use this link during
                  development.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full"
                render={<Link href={state.devVerifyUrl} />}
              >
                Open sign-in link
              </Button>
            </>
          ) : null}
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/login" />}
          >
            Use a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-none ring-0 shadow-none">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          {mode === "magic"
            ? "Enter your email and we'll send you a secure sign-in link."
            : "Sign in with the email and password for your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetSuccess ? (
          <Alert className="mb-4">
            <AlertDescription>
              Password updated. Sign in with your new password.
            </AlertDescription>
          </Alert>
        ) : null}
        {oauthError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{oauthError}</AlertDescription>
          </Alert>
        ) : null}
        <OAuthButtons providers={oauthProviders} />
        {mode === "magic" ? (
          <form action={magicAction} className="mt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="magic-email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    id="magic-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                  />
                </FieldContent>
              </Field>
              {state.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending link…" : "Email me a magic link"}
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <form action={passwordAction} className="mt-6">
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
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    placeholder="Your password"
                  />
                </FieldContent>
              </Field>
              {state.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Signing in…" : "Sign in with password"}
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
                  Sign in with password
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="text-accent-foreground hover:underline"
                  onClick={() => setMode("magic")}
                >
                  Use a magic link instead
                </button>
              </>
            )}
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
            <Link href="/signup" className="text-accent-foreground hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
