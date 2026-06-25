"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";

import { MotionCard } from "@/components/marketing/motion/motion-card";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { springSnappy } from "@/lib/motion/presets";
import type { PricingPlan } from "@/lib/marketing/pricing";
import { cn } from "@/lib/utils";

type PricingCardsProps = {
  plans: PricingPlan[];
  showBillingToggle?: boolean;
  featureLimit?: number;
};

export function PricingCards({
  plans,
  showBillingToggle = true,
  featureLimit,
}: PricingCardsProps) {
  const [annual, setAnnual] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div>
      {showBillingToggle ? (
      <MotionStagger className="mb-12 flex items-center justify-center gap-3" stagger={0.05}>
        <MotionStaggerItem>
          <span
            className={cn(
              "text-[14px] font-medium",
              !annual ? "text-foreground" : "text-marketing-muted",
            )}
          >
            Monthly
          </span>
        </MotionStaggerItem>
        <MotionStaggerItem>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            className={cn(
              "relative h-7 w-12 rounded-full border border-marketing-border transition-colors",
              annual ? "bg-primary" : "bg-marketing-surface",
            )}
            onClick={() => setAnnual(!annual)}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 size-6 rounded-full bg-foreground"
              animate={{
                x: annual ? 20 : 0,
                backgroundColor: annual ? "var(--primary-foreground)" : undefined,
              }}
              transition={reduced ? { duration: 0 } : springSnappy}
            />
          </button>
        </MotionStaggerItem>
        <MotionStaggerItem>
          <span
            className={cn(
              "text-[14px] font-medium",
              annual ? "text-foreground" : "text-marketing-muted",
            )}
          >
            Annual
            <span className="ml-1.5 text-[12px] text-primary">Save 17%</span>
          </span>
        </MotionStaggerItem>
      </MotionStagger>
      ) : null}

      <MotionStagger className="grid gap-6 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto" stagger={0.1}>
        {plans.map((plan) => {
          const price = annual ? plan.annualPrice : plan.monthlyPrice;
          const isTrial = plan.id === "trial";
          const features = featureLimit
            ? plan.features.slice(0, featureLimit)
            : plan.features;

          return (
            <MotionStaggerItem key={plan.id}>
              <MotionCard
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-6 sm:p-8",
                  plan.popular
                    ? "border- bg-secondary text-secondary-foreground ring-1 ring-secondary-foreground/20"
                    : "border-marketing-border bg-marketing-surface",
                )}
              >
                {plan.popular ? (
                  <Badge className="absolute -top-3 left-6">Most popular</Badge>
                ) : null}

                <h3 className="text-[18px] font-semibold">{plan.name}</h3>
                <p className={cn("mt-2 text-[14px]", plan.popular ? "text-secondary-foreground" : "text-marketing-muted")}>{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <motion.span
                    key={price}
                    className="text-[3rem] font-semibold leading-none tracking-tight"
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduced ? { duration: 0 } : springSnappy}
                  >
                    ${price}
                  </motion.span>
                  <span className={cn("text-[14px]", plan.popular ? "text-secondary-foreground" : "text-marketing-muted")}>/mo</span>
                </div>

                {plan.priceNote ? (
                  <p className={cn("mt-2 text-[12px]", plan.popular ? "text-secondary-foreground/80" : "text-marketing-muted")}>
                    {plan.priceNote}
                  </p>
                ) : null}

                {isTrial && showBillingToggle && annual ? (
                  <p className="mt-2 text-[12px] text-marketing-muted">Intro is billed monthly only</p>
                ) : null}

                <ul className="mt-8 flex-1 space-y-3">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className={cn("flex items-start gap-2.5 text-[14px]", plan.popular ? "text-secondary-foreground" : "text-marketing-muted")}
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
              </MotionCard>
            </MotionStaggerItem>
          );
        })}
      </MotionStagger>
    </div>
  );
}
