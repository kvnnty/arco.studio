"use client";

import { Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
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
} from "@/lib/api/hooks/billing";
import type { CheckoutPlan } from "@/lib/api/client";

const PRO_FEATURES = [
  "15 MP4 exports per month",
  "Full editor + AI assistant",
  "Brand from URL + customize panel",
  "1080p in 16:9, 1:1, and 9:16",
  "Music bed + logo overlay",
  "Custom music upload (Pro)",
];

const TRIAL_FEATURES = [
  "5 MP4 exports",
  "Full editor access",
  "1080p export",
  "Upgrade to Pro anytime",
];

export function BillingPageClient() {
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const checkout = searchParams.get("checkout");

  const { data: status, isLoading } = useBillingStatus();
  const checkoutMutation = useCheckoutMutation();
  const portalMutation = useBillingPortalMutation();

  if (isLoading || !status) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader
          title="Billing"
          description="Intro at $9/month or Pro at $29/month — built for indie hackers and product owners."
        />
        <p className="text-sm text-muted-foreground">Loading billing…</p>
      </div>
    );
  }

  const isActive = status.planStatus === "active";

  const handleCheckout = (plan: CheckoutPlan) => {
    checkoutMutation.mutate(plan, {
      onSuccess: ({ url }) => {
        window.location.href = url;
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Could not start checkout.",
        );
      },
    });
  };

  const handlePortal = () => {
    portalMutation.mutate(undefined, {
      onSuccess: ({ url }) => {
        window.location.href = url;
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Could not open billing portal.",
        );
      },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Billing"
        description="Intro at $9/month or Pro at $29/month — built for indie hackers and product owners."
      />

      {welcome && !isActive ? (
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Welcome to Arco</CardTitle>
            <CardDescription>
              Choose Intro at $9/month to get started, or subscribe to Pro at
              $29/month from day one. No free tier.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {checkout === "success" ? (
        <Card className="rounded-2xl border-[#5fc992]/30 bg-[#5fc992]/5">
          <CardContent className="pt-6 text-sm">
            Payment received. Your subscription is active — create your first video.
          </CardContent>
        </Card>
      ) : null}

      {checkout === "canceled" ? (
        <Card className="rounded-2xl">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Checkout canceled. Pick Intro or Pro whenever you&apos;re ready.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-base">Intro</CardTitle>
            </div>
            <CardDescription>
              Get started at a lower price. Upgrade when you&apos;re ready to scale.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                $9
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {TRIAL_FEATURES.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            {isActive && status.plan === "trial" ? (
              <div className="flex flex-col items-start gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Active — Intro
                </Badge>
                <Button
                  variant="outline"
                  disabled={portalMutation.isPending}
                  onClick={handlePortal}
                >
                  Manage subscription
                </Button>
              </div>
            ) : isActive ? null : (
              <Button
                variant="outline"
                disabled={checkoutMutation.isPending}
                onClick={() => handleCheckout("trial")}
              >
                Start Intro — $9/mo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Pro</CardTitle>
            <CardDescription>
              Full access at $29/month from day one — Intro pricing not included.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                $29
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            {isActive && status.plan === "pro" ? (
              <div className="flex flex-col items-start gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Active — Pro
                </Badge>
                <Button
                  variant="outline"
                  disabled={portalMutation.isPending}
                  onClick={handlePortal}
                >
                  Manage subscription
                </Button>
              </div>
            ) : isActive ? null : (
              <Button
                disabled={checkoutMutation.isPending}
                onClick={() => handleCheckout("pro")}
              >
                Start Pro — $29/mo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {isActive && status.plan !== "trial" && status.plan !== "pro" ? (
        <Card className="rounded-2xl">
          <CardContent className="flex items-center justify-between pt-6">
            <Badge variant="outline" className="border-primary/30 text-primary">
              Active — {status.plan}
            </Badge>
            <Button
              variant="outline"
              disabled={portalMutation.isPending}
              onClick={handlePortal}
            >
              Manage subscription
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isActive ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Usage this period</CardTitle>
            <CardDescription>
              {status.exportsRemaining} of {status.exportAllowance} exports remaining
              {status.periodEnd
                ? ` · Renews ${new Date(status.periodEnd).toLocaleDateString()}`
                : null}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
