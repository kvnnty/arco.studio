"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { completeOnboardingAction } from "@/app/actions/auth";
import { createCheckoutSessionAction } from "@/app/actions/billing";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthUser } from "@/lib/auth/constants";

type OnboardingClientProps = {
  user: AuthUser;
};

export function OnboardingClient({ user }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "plan">(
    user.onboardingStep === "plan" ? "plan" : "profile",
  );
  const [name, setName] = useState(user.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveProfile() {
    startTransition(async () => {
      setError(null);
      try {
        await completeOnboardingAction({
          name: name.trim() || undefined,
          step: "plan",
        });
        setStep("plan");
      } catch {
        setError("Could not save profile.");
      }
    });
  }

  function skipToPlan() {
    startTransition(async () => {
      await completeOnboardingAction({ step: "plan" });
      setStep("plan");
    });
  }

  function finishFree() {
    startTransition(async () => {
      await completeOnboardingAction({ step: "completed" });
      router.push("/dashboard");
    });
  }

  function startCheckout() {
    startTransition(async () => {
      try {
        await completeOnboardingAction({ step: "completed" });
        const { url } = await createCheckoutSessionAction();
        window.location.href = url;
      } catch {
        setError("Could not start checkout.");
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <PageHeader
        title="Welcome to Arco"
        description="You're in. Finish setup in under a minute."
      />

      {step === "profile" ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Optional profile</CardTitle>
            <CardDescription>
              Add your name now, or skip and do it later from Settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-3">
              <Button onClick={saveProfile} disabled={pending}>
                Continue
              </Button>
              <Button variant="outline" onClick={skipToPlan} disabled={pending}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Choose your plan</CardTitle>
            <CardDescription>
              Explore the dashboard free, or upgrade now to unlock exports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border p-4">
              <p className="font-medium">Pro — Launch Offer</p>
              <p className="mt-1 text-sm text-muted-foreground">
                $9 first month, then $29/mo. 15 exports per month, all aspect
                ratios, AI assistant, brand from URL.
              </p>
              <Button className="mt-4" onClick={startCheckout} disabled={pending}>
                Upgrade and pay
              </Button>
            </div>
            <Button variant="outline" onClick={finishFree} disabled={pending}>
              Continue to dashboard
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
