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

const TRIAL_FEATURES = [
  "5 active projects",
  "Unlimited re-exports per project",
  "720p export · up to 2 min",
  "Upgrade anytime",
];

const PRO_FEATURES = [
  "15 active projects",
  "Up to 1080p export · 5 min videos",
  "Brand from URL + custom music",
  "AI assistant + voiceover",
];

const STUDIO_FEATURES = [
  "Unlimited active projects",
  "Up to 4K export · 10 min videos",
  "Everything in Pro",
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
          description="Intro $9 · Pro $29 · Studio $59 — for indie hackers and product owners."
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
            Payment received. Your subscription is active — create your first video.
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-base">Intro</CardTitle>
            </div>
            <CardDescription>Validate your launch at a lower price.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
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
            {renderPlanActions("trial", "Intro — $9/mo")}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Pro</CardTitle>
            <CardDescription>Full 1080p toolkit for weekly shipping.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
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
            {renderPlanActions("pro", "Pro — $29/mo")}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Studio</CardTitle>
            <CardDescription>4K, unlimited projects, social packs.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                $59
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {STUDIO_FEATURES.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            {renderPlanActions("studio", "Studio — $59/mo")}
          </CardContent>
        </Card>
      </div>

      {isActive ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Workspace usage</CardTitle>
            <CardDescription>
              {status.hasUnlimitedProjects
                ? `${status.activeProjectCount} active projects · unlimited plan`
                : `${status.activeProjectCount} of ${status.activeProjectLimit} active projects · ${status.activeProjectsRemaining} slots remaining`}
              {status.periodEnd
                ? ` · Renews ${new Date(status.periodEnd).toLocaleDateString()}`
                : null}
            </CardDescription>
          </CardHeader>
          {!status.hasUnlimitedProjects ? (
            <CardContent>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      status.activeProjectLimit > 0
                        ? Math.round(
                            (status.activeProjectCount /
                              status.activeProjectLimit) *
                              100,
                          )
                        : 0,
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Delete a project to free a slot. Re-exports do not count toward this
                limit.
              </p>
            </CardContent>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
