/** Monthly included credits by plan — keep in sync with API `monthlyIncludedCredits`. */
const PLAN_MONTHLY_CREDITS: Record<string, number> = {
  trial: 200,
  pro: 1250,
  studio: 3000,
};

export type CreditUsageInput = {
  included: number;
  purchased: number;
  available: number;
};

export type CreditUsage = {
  /** Period pool used for the progress denominator. */
  total: number;
  remaining: number;
  used: number;
  /** 0–100 how much of the pool has been consumed. */
  usedPercent: number;
};

export function getCreditUsage(
  credits: CreditUsageInput,
  plan: string | null | undefined,
): CreditUsage {
  const remaining = Math.max(0, credits.available);
  const monthly = plan ? (PLAN_MONTHLY_CREDITS[plan] ?? 0) : 0;
  const wallet = Math.max(0, credits.included) + Math.max(0, credits.purchased);
  const total = Math.max(monthly + Math.max(0, credits.purchased), wallet, remaining);
  const used = Math.max(0, total - remaining);
  const usedPercent =
    total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return { total, remaining, used, usedPercent };
}

export function formatCredits(value: number): string {
  return value.toLocaleString();
}
