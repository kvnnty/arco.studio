"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BillingInterval, CheckoutPlan } from "@/lib/api/client";
import { ONBOARDING_PLAN_SUMMARY } from "@/lib/onboarding/constants";
import {
  ANNUAL_SAVINGS_LABEL,
  planAnnualTotal,
  planDisplayPrice,
  planHasAnnualDiscount,
  pricingPlans,
} from "@/lib/marketing/pricing";
import { cn } from "@/lib/utils";

const checkoutPlanById: Record<string, CheckoutPlan> = {
  trial: "trial",
  pro: "pro",
  studio: "studio",
};

type OnboardingPricingStepProps = {
  pending: boolean;
  error: string | null;
  onSelectPlan: (plan: CheckoutPlan, interval: BillingInterval) => void;
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
  const [annual, setAnnual] = useState(true);
  const billingInterval: BillingInterval = annual ? "annual" : "monthly";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Ship launch videos without hiring a motion designer. Annual billing
          saves 17% — cancel anytime.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              annual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 border-primary/20 bg-primary/10 text-primary">
              {ANNUAL_SAVINGS_LABEL}
            </Badge>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            className={cn(
              "relative h-7 w-12 rounded-full border transition-colors",
              annual ? "border-primary bg-primary" : "border-border bg-muted",
            )}
            onClick={() => setAnnual((value) => !value)}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-6 rounded-full bg-background transition-transform",
                annual ? "translate-x-0" : "translate-x-5",
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium",
              !annual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Monthly
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => {
          const checkoutPlan = checkoutPlanById[plan.id];
          const features = plan.features.slice(0, 4);
          const price = planDisplayPrice(plan, annual);
          const hasAnnualDiscount = planHasAnnualDiscount(plan);
          const isTrial = plan.id === "trial";

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

              <div className="mt-5 flex items-baseline gap-2">
                {annual && hasAnnualDiscount ? (
                  <span className="text-lg font-medium text-muted-foreground line-through">
                    ${plan.monthlyPrice}
                  </span>
                ) : null}
                <span className="text-4xl font-semibold tracking-tight">
                  ${price}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>

              {annual && hasAnnualDiscount ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Billed as ${planAnnualTotal(plan)}/year · {ANNUAL_SAVINGS_LABEL.toLowerCase()}
                </p>
              ) : null}

              {isTrial && annual ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Intro is billed monthly only
                </p>
              ) : null}

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
                onClick={() =>
                  checkoutPlan &&
                  onSelectPlan(
                    checkoutPlan,
                    isTrial ? "monthly" : billingInterval,
                  )
                }
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
