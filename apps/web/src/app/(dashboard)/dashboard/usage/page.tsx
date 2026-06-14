import Link from "next/link";
import { Zap } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CREDIT_PACKS,
  MOCK_CREDITS,
  MOCK_USAGE_BREAKDOWN,
  MOCK_USAGE_DATA,
} from "@/lib/mock/data";

export default function UsagePage() {
  const usagePercent =
    (MOCK_CREDITS.usedThisMonth / MOCK_CREDITS.monthlyAllowance) * 100;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Usage & credits"
        description="Track your credit balance and consumption."
      >
        <Button render={<Link href="/dashboard/billing" />}>
          Buy more credits
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Credits remaining"
          value={MOCK_CREDITS.balance}
          icon={Zap}
        />
        <StatsCard
          title="Used this month"
          value={MOCK_CREDITS.usedThisMonth}
          description={`of ${MOCK_CREDITS.monthlyAllowance} included`}
        />
        <StatsCard
          title="Monthly allowance"
          value={MOCK_CREDITS.monthlyAllowance}
          description="resets on Jul 1"
        />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Monthly usage</CardTitle>
          <CardDescription>
            {Math.round(usagePercent)}% of your monthly allowance used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={usagePercent} className="h-2" />
          <UsageChart data={MOCK_USAGE_DATA} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Consumption breakdown</CardTitle>
            <CardDescription>Where your credits went this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_USAGE_BREAKDOWN.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.credits} credits
                  </span>
                </div>
                <Progress value={item.percentage} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Buy more credits</CardTitle>
            <CardDescription>
              One-time credit packs, never expire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`flex items-center justify-between rounded-xl border p-4 ${
                  pack.popular ? "border-primary/30 bg-primary/5" : ""
                }`}
              >
                <div>
                  <p className="font-medium">
                    {pack.credits} credits
                    {pack.popular ? (
                      <span className="ml-2 text-xs text-primary">
                        Popular
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${pack.price} one-time
                  </p>
                </div>
                <Button size="sm" variant={pack.popular ? "default" : "outline"}>
                  Purchase
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
