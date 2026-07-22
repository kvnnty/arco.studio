"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { BillingPageSkeleton } from "@/components/dashboard/page-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useBillingPortalMutation,
  useBillingStatus,
  useCheckoutMutation,
  useTopUpCheckoutMutation,
} from "@/lib/api/hooks/billing";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import {
  ApiError,
  type BillingInterval,
  type CheckoutPlan,
} from "@/lib/api/client";
import { pricingPlans } from "@/lib/marketing/pricing";
import { cn } from "@/lib/utils";

const TRIAL_FEATURES = [
  "200 credits per month",
  "Unlimited projects",
  "720p export · up to 2 min",
  "Upgrade anytime",
];

const PRO_FEATURES = [
  "1,250 credits per month",
  "Up to 1080p export · 5 min videos",
  "Brand from URL + custom music",
  "AI assistant + voiceover",
];

const STUDIO_FEATURES = [
  "5,000 credits per month",
  "Up to 4K export · 10 min videos",
  "Everything in Pro",
];

const PLAN_PRICES: Record<CheckoutPlan, { monthly: number; annual: number }> = {
  trial: { monthly: 9, annual: 9 },
  pro: { monthly: 29, annual: 24 },
  studio: { monthly: 59, annual: 49 },
};

export function BillingPageClient() {
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const checkout = searchParams.get("checkout");
  const [annual, setAnnual] = useState(false);

  const { token, loading: authLoading } = useApiClient();
  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useBillingStatus();
  const checkoutMutation = useCheckoutMutation();
  const portalMutation = useBillingPortalMutation();
  const topUpMutation = useTopUpCheckoutMutation();

  const billingInterval: BillingInterval = annual ? "annual" : "monthly";

  if (authLoading || isLoading) {
    return <BillingPageSkeleton />;
  }

  if (!token) {
    return <BillingPageSkeleton />;
  }

  if (isError || !status) {
    const unauthorized =
      error instanceof ApiError &&
      (error.status === 401 || /unauthorized/i.test(error.message));

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader
          title="Billing"
          description="Intro $9 · Pro $29 · Studio $59 — for indie hackers and product owners."
        />
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col gap-4 pt-6">
            <p className="text-sm text-destructive">
              {unauthorized
                ? "Your session expired. Sign in again to manage billing."
                : error instanceof Error
                  ? error.message
                  : "Could not load billing details."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void refetch()}>
                Try again
              </Button>
              {unauthorized ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Sign in
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = status.planStatus === "active";

  const handleCheckout = (plan: CheckoutPlan) => {
    checkoutMutation.mutate(
      { plan, interval: billingInterval },
      {
        onSuccess: ({ url }) => {
          window.location.href = url;
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not start checkout.",
          );
        },
      },
    );
  };

  const handlePortal = () => {
    portalMutation.mutate(undefined, {
      onSuccess: ({ url }) => {
        window.location.href = url;
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not open billing portal.",
        );
      },
    });
  };

  const renderPlanActions = (plan: CheckoutPlan, label: string) => {
    if (isActive && status.plan === plan) {
      return (
        <div className="flex flex-col items-start gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Active — {label}
          </Badge>
          <Button
            variant="outline"
            disabled={portalMutation.isPending}
            onClick={handlePortal}
          >
            Manage subscription
          </Button>
        </div>
      );
    }
    if (isActive) return null;
    return (
      <Button
        variant={plan === "pro" ? "default" : "outline"}
        disabled={checkoutMutation.isPending}
        onClick={() => handleCheckout(plan)}
      >
        Start {label}
      </Button>
    );
  };

  const displayPrice = (plan: CheckoutPlan) => {
    const prices = PLAN_PRICES[plan];
    return annual ? prices.annual : prices.monthly;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Billing"
        description="Intro $9 · Pro $29 · Studio $59 — for indie hackers and product owners."
      />

      {welcome && !isActive ? (
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Welcome to Arco</CardTitle>
            <CardDescription>
              Pick Intro, Pro, or Studio. Your plan limits active projects — not
              how many times you can re-export.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {checkout === "success" ? (
        <Card className="rounded-2xl border-[#5fc992]/30 bg-[#5fc992]/5">
          <CardContent className="pt-6 text-sm">
            Payment received. Your subscription is active — create your first
            video.
          </CardContent>
        </Card>
      ) : null}

      {checkout === "canceled" ? (
        <Card className="rounded-2xl">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Checkout canceled. Pick a plan whenever you&apos;re ready.
          </CardContent>
        </Card>
      ) : null}

      {isActive ? (
        <Card className="rounded-2xl border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Your subscription</CardTitle>
              <CardDescription>
                Upgrade, downgrade, cancel, or view invoices in the Polar
                customer portal.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              disabled={portalMutation.isPending}
              onClick={handlePortal}
            >
              Manage subscription
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      {!isActive ? (
        <div className="flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              !annual ? "text-foreground" : "text-muted-foreground",
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
              "relative h-7 w-12 rounded-full border transition-colors",
              annual ? "border-primary bg-primary" : "border-border bg-muted",
            )}
            onClick={() => setAnnual((value) => !value)}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-6 rounded-full bg-background transition-transform",
                annual ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium",
              annual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Annual
            <span className="ml-1.5 text-xs text-primary">Save 17%</span>
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-base">Intro</CardTitle>
            </div>
            <CardDescription>
              Validate your launch at a lower price.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                ${displayPrice("trial")}
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              {annual ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Intro is billed monthly only
                </p>
              ) : null}
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {TRIAL_FEATURES.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            {renderPlanActions("trial", "Intro — $9/mo")}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Pro</CardTitle>
            <CardDescription>
              Full 1080p toolkit for weekly shipping.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                ${displayPrice("pro")}
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              {annual ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Billed annually · {pricingPlans[1]?.cta}
                </p>
              ) : null}
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            {renderPlanActions(
              "pro",
              annual ? "Pro — $24/mo billed annually" : "Pro — $29/mo",
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Studio</CardTitle>
            <CardDescription>
              4K, unlimited projects, social packs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                ${displayPrice("studio")}
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              {annual ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Billed annually · {pricingPlans[2]?.cta}
                </p>
              ) : null}
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {STUDIO_FEATURES.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            {renderPlanActions(
              "studio",
              annual ? "Studio — $49/mo billed annually" : "Studio — $59/mo",
            )}
          </CardContent>
        </Card>
      </div>

      {isActive ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Credit balance</CardTitle>
            <CardDescription>
              {status.credits.available} available · {status.credits.included}{" "}
              included · {status.credits.purchased} purchased ·{" "}
              {status.credits.reserved} reserved
              {status.credits.periodEnd
                ? ` · Period ends ${new Date(status.credits.periodEnd).toLocaleDateString()}`
                : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={topUpMutation.isPending}
                onClick={() => {
                  topUpMutation.mutate(undefined, {
                    onSuccess: ({ url }) => {
                      window.location.href = url;
                    },
                    onError: (error) => {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Could not start top-up.",
                      );
                    },
                  });
                }}
              >
                Top up {status.credits.topUpAmount} credits
              </Button>
              <Button
                variant="outline"
                disabled={portalMutation.isPending}
                onClick={handlePortal}
              >
                Manage subscription
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              AI actions, voice generation, and exports spend credits. Failed
              actions refund reserved credits automatically.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
