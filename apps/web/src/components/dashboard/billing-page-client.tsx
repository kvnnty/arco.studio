"use client";

import { CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";
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

const PRO_FEATURES = [
  "15 MP4 exports per month",
  "Full editor + AI assistant",
  "Brand from URL + customize panel",
  "1080p in 16:9, 1:1, and 9:16",
  "Music bed + logo overlay",
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
          description="Launch Offer — first month $9, then $29/month. Cancel anytime."
        />
        <p className="text-sm text-muted-foreground">Loading billing…</p>
      </div>
    );
  }

  const isActive = status.planStatus === "active";

  const handleCheckout = () => {
    checkoutMutation.mutate(undefined, {
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
        description="Launch Offer — first month $9, then $29/month. Cancel anytime."
      />

      {welcome && !isActive ? (
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Welcome to Arco</CardTitle>
            <CardDescription>
              Start the Launch Offer to create and export launch videos. No free
              tier — one subscription per account.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {checkout === "success" ? (
        <Card className="rounded-2xl border-[#5fc992]/30 bg-[#5fc992]/5">
          <CardContent className="pt-6 text-sm">
            Payment received. Your Pro access is active — create your first video.
          </CardContent>
        </Card>
      ) : null}

      {checkout === "canceled" ? (
        <Card className="rounded-2xl">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Checkout canceled. You can start the Launch Offer whenever you&apos;re
            ready.
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="text-base">Launch Offer — First month $9</CardTitle>
          </div>
          <CardDescription>
            Full Pro access. Then $29/month. 14-day money-back guarantee.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              $9
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                first month, then $29/mo
              </span>
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              {PRO_FEATURES.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
          </div>
          {isActive ? (
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
          ) : (
            <Button
              disabled={checkoutMutation.isPending}
              onClick={handleCheckout}
            >
              Start Launch Offer — $9
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Pro</CardTitle>
            <CardDescription>$29/month after Launch Offer</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {PRO_FEATURES.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl opacity-80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Team</CardTitle>
              <Badge variant="outline">Coming soon</Badge>
            </div>
            <CardDescription>Shared workspace, seats, priority render</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Pooled exports, shared brand kits, and team billing.
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Enterprise</CardTitle>
          <CardDescription>Custom limits, SSO, invoice billing</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <CreditCard className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Contact us for agency and team deployments.
            </p>
          </div>
          <Button variant="outline" render={<Link href="mailto:hello@arco.video?subject=Arco%20Enterprise" />}>
            Contact us
          </Button>
        </CardContent>
      </Card>

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
