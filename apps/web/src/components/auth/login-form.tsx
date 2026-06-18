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
import { cn } from "@/lib/utils";

const initialState: AuthFormState = {};

type LoginTab = "password" | "magic";

export function LoginForm() {
  const [tab, setTab] = useState<LoginTab>("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(
    passwordLoginAction,
    initialState,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    magicLinkAction,
    initialState,
  );

  const state = tab === "password" ? passwordState : magicState;
  const pending = tab === "password" ? passwordPending : magicPending;

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
          {process.env.NODE_ENV === "development" && state.verifyUrl ? (
            <Alert>
              <AlertDescription>
                Email delivery is not configured yet. Use this link to sign in
                during development.
              </AlertDescription>
            </Alert>
          ) : null}
          {state.verifyUrl ? (
            <Button
              className="w-full"
              render={<Link href={state.verifyUrl} />}
            >
              Open sign-in link
            </Button>
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
    <Card className="w-full max-w-md rounded-2xl">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Sign in with your password or request a magic link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons />
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={tab === "password" ? "default" : "outline"}
            onClick={() => setTab("password")}
          >
            Password
          </Button>
          <Button
            type="button"
            variant={tab === "magic" ? "default" : "outline"}
            onClick={() => setTab("magic")}
          >
            Magic link
          </Button>
        </div>

        {tab === "password" ? (
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
        ) : (
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
        )}

        <p
          className={cn(
            "mt-6 text-center text-sm text-muted-foreground",
            tab === "magic" && "mt-4",
          )}
        >
          No account?{" "}
          <Link href="/signup" className="text-accent-foreground hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
