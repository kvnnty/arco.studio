"use client";

import Link from "next/link";
import { FolderOpen, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { UsageChart } from "@/components/dashboard/usage-chart";
import {
  useBillingStatus,
  useBillingUsage,
} from "@/lib/api/hooks/billing";
import { buildWeeklyExportChart } from "@/lib/dashboard/usage-chart";

const TYPE_LABELS: Record<string, string> = {
  export: "Video exports",
  ai_draft: "AI drafts",
  ai_regenerate: "Scene regenerations",
  ai_refine: "Copy refinements",
  ai_chat: "Chat messages",
  referral_reward: "Referral rewards",
};

export function UsagePageClient() {
  const { data: status, isLoading: statusLoading } = useBillingStatus();
  const { data: usage, isLoading: usageLoading } = useBillingUsage();

  if (statusLoading || usageLoading || !status || !usage) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader
          title="Usage"
          description="Active projects and activity for your workspace."
        />
        <p className="text-sm text-muted-foreground">Loading usage…</p>
      </div>
    );
  }

  const projectPercent = status.hasUnlimitedProjects
    ? 0
    : status.activeProjectLimit > 0
      ? Math.round(
          (status.activeProjectCount / status.activeProjectLimit) * 100,
        )
      : 0;

  const chartData = buildWeeklyExportChart(usage.events);

  const breakdown = Object.entries(usage.counts)
    .filter(([type]) => type !== "export_refund")
    .map(([type, count]) => ({
      label: TYPE_LABELS[type] ?? type,
      count,
    }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Usage"
        description="Active projects and activity for your workspace."
      >
        {status.planStatus === "active" ? (
          <Button variant="outline" render={<Link href="/dashboard/billing" />}>
            Manage plan
          </Button>
        ) : (
          <Button render={<Link href="/dashboard/billing?welcome=1" />}>
            Choose a plan
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Active projects</CardDescription>
            <CardTitle className="text-3xl">{status.activeProjectCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Slots remaining</CardDescription>
            <CardTitle className="text-3xl">
              {status.hasUnlimitedProjects ? "∞" : status.activeProjectsRemaining}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Plan limit</CardDescription>
            <CardTitle className="text-3xl">
              {status.hasUnlimitedProjects ? "Unlimited" : status.activeProjectLimit}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {status.periodEnd
              ? `Renews ${new Date(status.periodEnd).toLocaleDateString()}`
              : "Subscribe to create projects"}
          </CardContent>
        </Card>
      </div>

      {!status.hasUnlimitedProjects ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="size-4" />
              Project slots
            </CardTitle>
            <CardDescription>
              {projectPercent}% used. Delete a project to create a new one.
              Re-exports are unlimited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, projectPercent)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="size-4" />
            Activity breakdown
          </CardTitle>
          <CardDescription>This calendar month</CardDescription>
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
                <span className="font-mono text-muted-foreground">{item.count}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <UsageChart data={chartData} />

      <Card className="rounded-2xl border-primary/15 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Earn more project slots</CardTitle>
          <CardDescription>
            Invite friends to Arco and earn bonus project slots when they subscribe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" render={<Link href="/dashboard/referrals" />}>
            View referral program
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
