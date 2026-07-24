"use client";

import Link from "next/link";
import { Coins, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { UsagePageSkeleton } from "@/components/dashboard/page-skeletons";
import { UsageChart } from "@/components/dashboard/usage-chart";
import {
  useBillingStatus,
  useBillingUsage,
  useTopUpCheckoutMutation,
} from "@/lib/api/hooks/billing";
import { buildWeeklyCreditSpendChart } from "@/lib/dashboard/usage-chart";

const TYPE_LABELS: Record<string, string> = {
  ai_draft: "AI drafts",
  ai_storyboard: "Storyboards",
  ai_regenerate: "Scene regenerations",
  ai_refine: "Copy refinements",
  ai_chat: "Chat messages",
  voice_generate: "Voice generation",
  voice_preview: "Voice previews",
  referral_reward: "Referral rewards",
};

const LEDGER_LABELS: Record<string, string> = {
  monthly_grant: "Monthly credits",
  top_up: "Credit top-up",
  referral_grant: "Referral bonus",
  reservation: "Reserved",
  settlement: "Spent",
  refund: "Refunded",
};

export function UsagePageClient() {
  const { data: status, isLoading: statusLoading } = useBillingStatus();
  const { data: usage, isLoading: usageLoading } = useBillingUsage();
  const topUpMutation = useTopUpCheckoutMutation();

  if (statusLoading || usageLoading) {
    return <UsagePageSkeleton />;
  }

  if (!status || !usage) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader
          title="Usage"
          description="Credit balance and activity for your workspace."
        />
        <p className="text-sm text-destructive">Could not load usage details.</p>
      </div>
    );
  }

  const chartData = buildWeeklyCreditSpendChart(usage.events);
  const credits = status.credits;

  const breakdown = Object.entries(usage.counts).map(([type, count]) => ({
    label: TYPE_LABELS[type] ?? type,
    count,
  }));

  const handleTopUp = () => {
    topUpMutation.mutate(undefined, {
      onSuccess: ({ url }) => {
        window.location.href = url;
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Could not start top-up.",
        );
      },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Usage"
        description="Credit balance and activity for your workspace."
      >
        {status.planStatus === "active" ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTopUp} disabled={topUpMutation.isPending}>
              Top up credits
            </Button>
            <Button variant="outline" render={<Link href="/dashboard/billing" />}>
              Manage plan
            </Button>
          </div>
        ) : (
          <Button render={<Link href="/dashboard/billing?welcome=1" />}>
            Choose a plan
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-3xl">{credits.available}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Included</CardDescription>
            <CardTitle className="text-3xl">{credits.included}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Purchased</CardDescription>
            <CardTitle className="text-3xl">{credits.purchased}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Reserved</CardDescription>
            <CardTitle className="text-3xl">{credits.reserved}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {credits.periodEnd
              ? `Period ends ${new Date(credits.periodEnd).toLocaleDateString()}`
              : "Subscribe to receive monthly credits"}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="size-4" />
            Credits spent
          </CardTitle>
          <CardDescription>
            AI and voice usage over the last 7 days. Exports are included with
            your plan and are not metered here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsageChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Activity breakdown</CardTitle>
            <CardDescription>Credit-backed AI and voice actions this calendar month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              breakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="size-4" />
              Credit ledger
            </CardTitle>
            <CardDescription>Recent grants, reservations, and settlements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usage.ledger.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ledger entries yet.</p>
            ) : (
              usage.ledger.slice(0, 12).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {LEDGER_LABELS[entry.kind] ?? entry.kind}
                      {entry.actionType ? ` · ${entry.actionType}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={
                      entry.amount >= 0 ? "font-medium text-primary" : "font-medium"
                    }
                  >
                    {entry.amount >= 0 ? "+" : ""}
                    {entry.amount}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
