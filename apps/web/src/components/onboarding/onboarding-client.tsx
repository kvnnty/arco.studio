"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { useCompleteOnboardingMutation } from "@/lib/api/hooks/auth";
import { useCheckoutMutation } from "@/lib/api/hooks/billing";
import type { CheckoutPlan } from "@/lib/api/client";
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

  const completeOnboarding = useCompleteOnboardingMutation();
  const checkout = useCheckoutMutation();

  const pending = completeOnboarding.isPending || checkout.isPending;

  function saveProfile() {
    setError(null);
    completeOnboarding.mutate(
      { name: name.trim() || undefined, step: "plan" },
      {
        onSuccess: () => setStep("plan"),
        onError: () => setError("Could not save profile."),
      },
    );
  }

  function skipToPlan() {
    completeOnboarding.mutate(
      { step: "plan" },
      { onSuccess: () => setStep("plan") },
    );
  }

  function startCheckout(plan: CheckoutPlan) {
    setError(null);
    completeOnboarding.mutate(
      { step: "completed" },
      {
        onSuccess: () => {
          checkout.mutate(plan, {
            onSuccess: ({ url }) => {
              window.location.href = url;
            },
            onError: () => setError("Could not start checkout."),
          });
        },
        onError: () => setError("Could not start checkout."),
      },
    );
  }

  function goToBilling() {
    completeOnboarding.mutate(
      { step: "completed" },
      { onSuccess: () => router.push("/dashboard/billing?welcome=1") },
    );
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
              No free tier. Intro $9, Pro $29, or Studio $59 from day one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border p-4">
              <p className="font-medium">Intro — $9/mo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                5 active projects. Upgrade when you need more slots or social formats.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => startCheckout("trial")}
                disabled={pending}
              >
                Get started — $9/mo
              </Button>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="font-medium">Pro — $29/mo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                15 active projects, all social formats at 1080p, brand from URL,
                custom music, AI assistant.
              </p>
              <Button className="mt-4" onClick={() => startCheckout("pro")} disabled={pending}>
                Start Pro — $29/mo
              </Button>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-medium">Studio — $59/mo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Unlimited projects, 4K export, and batch social format packs.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => startCheckout("studio")}
                disabled={pending}
              >
                Start Studio — $59/mo
              </Button>
            </div>
            <Button variant="ghost" onClick={goToBilling} disabled={pending}>
              Choose later in Billing
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
