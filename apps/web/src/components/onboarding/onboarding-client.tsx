"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OnboardingOptionGrid } from "@/components/onboarding/onboarding-option-grid";
import { OnboardingPricingStep } from "@/components/onboarding/onboarding-pricing-step";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompleteOnboardingMutation } from "@/lib/api/hooks/auth";
import { useCheckoutMutation } from "@/lib/api/hooks/billing";
import type { CheckoutPlan } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/constants";
import {
  ONBOARDING_GOALS,
  ONBOARDING_PERSONAS,
  ONBOARDING_STEPS,
  resolveOnboardingStep,
  type OnboardingStep,
} from "@/lib/onboarding/constants";

type OnboardingClientProps = {
  user: AuthUser;
};

export function OnboardingClient({ user }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(() =>
    resolveOnboardingStep(user.onboardingStep),
  );
  const [name, setName] = useState(user.name ?? "");
  const [referralSource, setReferralSource] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [persona, setPersona] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = useCompleteOnboardingMutation();
  const checkout = useCheckoutMutation();
  const pending = completeOnboarding.isPending || checkout.isPending;

  const stepIndex = ONBOARDING_STEPS.indexOf(step);

  function advance(nextStep: OnboardingStep, input?: { name?: string }) {
    setError(null);
    completeOnboarding.mutate(
      { name: input?.name, step: nextStep },
      {
        onSuccess: () => setStep(nextStep),
        onError: () => setError("Could not save your progress. Try again."),
      },
    );
  }

  function goBack() {
    if (stepIndex <= 0) return;
    setStep(ONBOARDING_STEPS[stepIndex - 1]!);
    setError(null);
  }

  function finishWithoutCheckout() {
    setError(null);
    completeOnboarding.mutate(
      { step: "completed" },
      {
        onSuccess: () => router.push("/dashboard/billing?welcome=1"),
        onError: () => setError("Could not finish onboarding."),
      },
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

  if (step === "plan") {
    return (
      <OnboardingShell width="xl">
        <OnboardingPricingStep
          pending={pending}
          error={error}
          onSelectPlan={startCheckout}
          onSkip={finishWithoutCheckout}
          onBack={goBack}
        />
      </OnboardingShell>
    );
  }

  if (step === "profile") {
    return (
      <OnboardingShell
        width="sm"
        footer={
          <>
            <Button
              size="lg"
              disabled={!ageConfirmed || pending}
              onClick={() =>
                advance("persona", { name: name.trim() || undefined })
              }
            >
              Next
            </Button>
          </>
        }
      >
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Help us personalize your experience
            </h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="onboarding-name" className="text-muted-foreground">
                What&apos;s your name? (optional)
              </Label>
              <Input
                id="onboarding-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="onboarding-referral"
                className="text-muted-foreground"
              >
                How did you hear about us? (optional)
              </Label>
              <Input
                id="onboarding-referral"
                value={referralSource}
                onChange={(event) => setReferralSource(event.target.value)}
                placeholder="Product Hunt, a friend, Twitter…"
              />
            </div>

            <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Checkbox
                checked={ageConfirmed}
                onCheckedChange={(checked) => setAgeConfirmed(checked === true)}
                className="mt-0.5"
              />
              <span>
                By checking this box, you confirm you have reached the age of 18
                years old (or the age of legal majority where you live).
              </span>
            </label>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </OnboardingShell>
    );
  }

  if (step === "persona") {
    return (
      <OnboardingShell
        width="lg"
        footer={
          <>
            <Button variant="ghost" onClick={goBack} disabled={pending}>
              Back
            </Button>
            <Button
              variant="ghost"
              onClick={() => advance("goals")}
              disabled={pending}
            >
              Skip
            </Button>
            <Button
              size="lg"
              disabled={!persona || pending}
              onClick={() => advance("goals")}
            >
              Next
            </Button>
          </>
        }
      >
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Which one describes you best?
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Arco is built for product owners shipping launch videos themselves.
            </p>
          </div>

          <OnboardingOptionGrid
            options={ONBOARDING_PERSONAS}
            mode="single"
            value={persona}
            onChange={(value) => setPersona(typeof value === "string" ? value : "")}
          />

          {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={goBack} disabled={pending}>
            Back
          </Button>
          <Button variant="ghost" onClick={() => advance("plan")} disabled={pending}>
            Skip
          </Button>
          <Button
            size="lg"
            disabled={goals.length === 0 || pending}
            onClick={() => advance("plan")}
          >
            Next
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What would you like to make with Arco?
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Select all that apply
          </p>
        </div>

        <OnboardingOptionGrid
          options={ONBOARDING_GOALS}
          mode="multi"
          value={goals}
          onChange={(value) => setGoals(Array.isArray(value) ? value : [])}
        />

        {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      </div>
    </OnboardingShell>
  );
}
