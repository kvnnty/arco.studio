"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckoutPlan } from "@/lib/api/client";
import { ONBOARDING_PLAN_SUMMARY } from "@/lib/onboarding/constants";
import { pricingPlans } from "@/lib/marketing/pricing";
import { cn } from "@/lib/utils";

const checkoutPlanById: Record<string, CheckoutPlan> = {
  trial: "trial",
  pro: "pro",
  studio: "studio",
};

type OnboardingPricingStepProps = {
  pending: boolean;
  error: string | null;
  onSelectPlan: (plan: CheckoutPlan) => void;
  onSkip: () => void;
  onBack: () => void;
};

export function OnboardingPricingStep({
  pending,
  error,
  onSelectPlan,
  onSkip,
  onBack,
}: OnboardingPricingStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Ship launch videos without hiring a motion designer. Pick a plan to
          start — cancel anytime.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => {
          const checkoutPlan = checkoutPlanById[plan.id];
          const features = plan.features.slice(0, 4);

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                plan.popular
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card",
              )}
            >
              {plan.popular ? (
                <Badge className="absolute -top-3 left-6">Most popular</Badge>
              ) : null}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-2 min-h-[40px] text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  ${plan.monthlyPrice}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>

              {plan.priceNote ? (
                <p className="mt-2 text-xs text-muted-foreground">{plan.priceNote}</p>
              ) : null}

              <ul className="mt-6 flex-1 space-y-2.5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                variant={plan.popular ? "default" : "outline"}
                disabled={pending || !checkoutPlan}
                onClick={() => checkoutPlan && onSelectPlan(checkoutPlan)}
              >
                Select plan
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {ONBOARDING_PLAN_SUMMARY}
      </p>

      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <Button variant="outline" onClick={onSkip} disabled={pending}>
          Choose later
        </Button>
        <Button variant="ghost" render={<Link href="/pricing" />} disabled={pending}>
          Explore all plans
        </Button>
      </div>
    </div>
  );
}
