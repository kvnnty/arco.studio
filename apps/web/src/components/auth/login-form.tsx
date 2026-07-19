"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
import {
  useLoginMutation,
  useMagicLinkMutation,
} from "@/lib/api/hooks/auth";
import { useLastUsedAuthMethod } from "@/lib/auth/last-used-method";

type LoginMode = "magic" | "password";

type LoginFormProps = {
  oauthError?: string;
  resetSuccess?: boolean;
};

export function LoginForm({
  oauthError,
  resetSuccess,
}: LoginFormProps) {
  const [mode, setMode] = useState<LoginMode>("magic");
  const [magicSent, setMagicSent] = useState(false);
  const { lastUsed, remember } = useLastUsedAuthMethod();

  const magicLink = useMagicLinkMutation();
  const login = useLoginMutation();

  useEffect(() => {
    if (lastUsed === "magic" || lastUsed === "password") {
      setMode(lastUsed);
    }
  }, [lastUsed]);

  const pending = mode === "magic" ? magicLink.isPending : login.isPending;
  const error =
    mode === "magic"
      ? magicLink.error?.message
      : login.error?.message;

  if (magicSent) {
    return (
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a secure sign-in link. It expires in 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setMagicSent(false)}
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
        <OAuthButtons />
        {mode === "magic" ? (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              remember("magic");
              const formData = new FormData(event.currentTarget);
              const email = String(formData.get("email") ?? "");
              magicLink.mutate(email, {
                onSuccess: () => {
                  setMagicSent(true);
                },
              });
            }}
          >
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
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="relative w-full" disabled={pending}>
                <LastUsedBadge show={lastUsed === "magic"} />
                {pending ? "Sending link…" : "Email me a magic link"}
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              remember("password");
              const formData = new FormData(event.currentTarget);
              login.mutate({
                email: String(formData.get("email") ?? ""),
                password: String(formData.get("password") ?? ""),
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
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="relative w-full" disabled={pending}>
                <LastUsedBadge show={lastUsed === "password"} />
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
              <button
                type="button"
                className="text-accent-foreground hover:underline"
                onClick={() => setMode("magic")}
              >
                Use a magic link instead
              </button>
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
