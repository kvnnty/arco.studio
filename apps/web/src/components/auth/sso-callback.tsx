"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

function flowIsComplete(flow: { readonly status: string }) {
  return flow.status === "complete";
}

export function SsoCallback() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clerk.loaded || started.current) return;
    started.current = true;

    const navigate = async ({
      decorateUrl,
    }: {
      decorateUrl: (url: string) => string;
    }) => {
      const url = decorateUrl("/post-auth");
      if (url.startsWith("http")) window.location.href = url;
      else router.push(url);
    };

    const complete = async () => {
      if (signIn.status === "complete") {
        const result = await signIn.finalize({ navigate });
        if (result.error) throw result.error;
        return;
      }
      if (signUp.status === "complete") {
        const result = await signUp.finalize({ navigate });
        if (result.error) throw result.error;
        return;
      }

      if (signUp.isTransferable) {
        const transfer = await signIn.create({ transfer: true });
        if (transfer.error) throw transfer.error;
        if (flowIsComplete(signIn)) {
          const result = await signIn.finalize({ navigate });
          if (result.error) throw result.error;
          return;
        }
      }

      if (signIn.isTransferable) {
        const transfer = await signUp.create({ transfer: true });
        if (transfer.error) throw transfer.error;
        if (flowIsComplete(signUp)) {
          const result = await signUp.finalize({ navigate });
          if (result.error) throw result.error;
          return;
        }
      }

      const existingSessionId =
        signIn.existingSession?.sessionId ?? signUp.existingSession?.sessionId;
      if (existingSessionId) {
        await clerk.setActive({ session: existingSessionId, navigate });
        return;
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        router.replace("/login?resume=1");
        return;
      }

      throw new Error(
        signUp.missingFields.length > 0
          ? `Account setup requires: ${signUp.missingFields.join(", ")}.`
          : "The social sign-in could not be completed.",
      );
    };

    void complete().catch((caught) => setError(authErrorMessage(caught)));
  }, [clerk, router, signIn, signUp]);

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
      <CardHeader>
        <CardTitle>
          {error ? "Couldn’t finish sign-in" : "Finishing sign-in"}
        </CardTitle>
        <CardDescription>
          {error
            ? "Your provider returned successfully, but the account could not be activated."
            : "Securely connecting your account…"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground" />
          </div>
        )}
        <div id="clerk-captcha" />
        {error ? (
          <Button className="w-full" render={<Link href="/login" />}>
            Back to sign in
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
