"use client";

import Link from "next/link";
import { useActionState } from "react";

import { magicLinkAction, type AuthFormState } from "@/app/actions/auth";
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

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    magicLinkAction,
    initialState,
  );

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
          No password needed — we&apos;ll email you a secure sign-in link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons />
        <form action={formAction} className="mt-6">
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
            {state.error ? (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending link…" : "Send magic link"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="text-accent-foreground hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
