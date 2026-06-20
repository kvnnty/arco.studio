"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PricingPlan } from "@/lib/marketing/pricing";
import { cn } from "@/lib/utils";

type PricingCardsProps = {
  plans: PricingPlan[];
};

export function PricingCards({ plans }: PricingCardsProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div className="mb-12 flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-[14px] font-medium",
            !annual ? "text-foreground" : "text-[var(--marketing-muted)]",
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
          className={cn(
            "relative h-7 w-12 rounded-full border border-[var(--marketing-border)] transition-colors",
            annual ? "bg-primary" : "bg-[var(--marketing-surface)]",
          )}
          onClick={() => setAnnual(!annual)}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-6 rounded-full bg-foreground transition-transform",
              annual && "translate-x-5 bg-primary-foreground",
            )}
          />
        </button>
        <span
          className={cn(
            "text-[14px] font-medium",
            annual ? "text-foreground" : "text-[var(--marketing-muted)]",
          )}
        >
          Annual
          <span className="ml-1.5 text-[12px] text-primary">Save 17%</span>
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = annual ? plan.annualPrice : plan.monthlyPrice;
          const isFree = price === 0;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 sm:p-8",
                plan.popular
                  ? "border-primary/40 bg-[var(--marketing-surface)] ring-1 ring-primary/20"
                  : "border-[var(--marketing-border)] bg-[var(--marketing-surface)]",
              )}
            >
              {plan.popular ? (
                <Badge className="absolute -top-3 left-6">Most popular</Badge>
              ) : null}

              <h3 className="text-[18px] font-semibold">{plan.name}</h3>
              <p className="mt-2 text-[14px] text-[var(--marketing-muted)]">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                {isFree ? (
                  <span className="text-[3rem] font-semibold leading-none tracking-tight">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-[3rem] font-semibold leading-none tracking-tight">
                      ${price}
                    </span>
                    <span className="text-[14px] text-[var(--marketing-muted)]">/mo</span>
                  </>
                )}
              </div>

              {plan.id === "pro" && !annual ? (
                <p className="mt-2 text-[12px] text-primary">
                  $9 first month launch offer
                </p>
              ) : null}

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[14px] text-[var(--marketing-muted)]"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={plan.popular ? "default" : "outline"}
                render={<Link href={plan.href} />}
              >
                {plan.cta}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
