"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

import type { BillingStatus } from "@/lib/api/client";
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
import { buildWeeklyExportChart } from "@/lib/dashboard/usage-chart";

const TYPE_LABELS: Record<string, string> = {
  export: "Video exports",
  ai_draft: "AI drafts",
  ai_regenerate: "Scene regenerations",
  ai_refine: "Copy refinements",
  ai_chat: "Chat messages",
};

type UsagePageClientProps = {
  status: BillingStatus;
  counts: Record<string, number>;
  events: Array<{ type: string; createdAt: string }>;
};

export function UsagePageClient({
  status,
  counts,
  events,
}: UsagePageClientProps) {
  const used = status.exportsUsedThisPeriod;
  const allowance = status.exportAllowance;
  const percent = allowance > 0 ? Math.round((used / allowance) * 100) : 0;
  const chartData = buildWeeklyExportChart(events);

  const breakdown = Object.entries(counts)
    .filter(([type]) => type !== "export_refund")
    .map(([type, count]) => ({
      label: TYPE_LABELS[type] ?? type,
      count,
    }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Usage & exports"
        description="Track exports and activity for this billing period."
      >
        {status.planStatus === "active" ? (
          <Button variant="outline" render={<Link href="/dashboard/billing" />}>
            Manage plan
          </Button>
        ) : (
          <Button render={<Link href="/dashboard/billing?welcome=1" />}>
            Start Launch Offer
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Exports remaining</CardDescription>
            <CardTitle className="text-3xl">{status.exportsRemaining}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Used this period</CardDescription>
            <CardTitle className="text-3xl">{used}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            of {allowance} included
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Monthly allowance</CardDescription>
            <CardTitle className="text-3xl">{allowance}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {status.periodEnd
              ? `Renews ${new Date(status.periodEnd).toLocaleDateString()}`
              : "Subscribe to unlock exports"}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Export usage</CardTitle>
          <CardDescription>{percent}% of monthly allowance used</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
