"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signupAction, type AuthFormState } from "@/app/actions/auth";
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

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );

  if (state.sent) {
    return (
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            Your account is ready. We sent a sign-in link to complete setup.
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
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-2xl">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Start turning screen recordings into launch-ready demos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons />
        <form action={formAction} className="mt-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Your name"
                />
              </FieldContent>
            </Field>
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
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
