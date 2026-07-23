"use client";

import { useSignUp } from "@clerk/nextjs";
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
import { createAuthNavigate } from "@/lib/auth/auth-navigate";

/**
 * Clerk OAuth missing-requirements continue step.
 * https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/oauth-connections
 */
export function SignupContinueForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();

    await signUp.update({ firstName, lastName });

    if (signUp.status === "complete") {
      const result = await signUp.finalize({
        navigate: createAuthNavigate(router),
      });
      if (result.error) setError(authErrorMessage(result.error));
      return;
    }

    if (signUp.status !== "missing_requirements") {
      setError(
        `Account setup still requires: ${signUp.missingFields.join(", ") || "an additional step"}.`,
      );
    }
  };

  const pending = fetchStatus === "fetching";

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
      <CardHeader>
        <CardTitle>Finish creating your account</CardTitle>
        <CardDescription>
          Add the remaining details to complete sign-up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="firstName">First name</FieldLabel>
              <FieldContent>
                <Input id="firstName" name="firstName" required autoFocus />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="lastName">Last name</FieldLabel>
              <FieldContent>
                <Input id="lastName" name="lastName" required />
              </FieldContent>
            </Field>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Continue"}
            </Button>
          </FieldGroup>
        </form>
        <div id="clerk-captcha" />
      </CardContent>
    </Card>
  );
}
