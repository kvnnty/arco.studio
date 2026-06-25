import type { BillingStatus, BillingUsage } from "@/lib/api/client";

const MONTHLY_SCENE_CREDITS: Record<string, number> = {
  trial: 10,
  pro: 50,
  studio: 9999,
};

export function getMonthlySceneAllowance(plan: string | null): number {
  if (!plan) return 5;
  return MONTHLY_SCENE_CREDITS[plan] ?? 10;
}

export function countCreditsUsedThisMonth(usage?: BillingUsage): number {
  if (!usage) return 0;
  return (
    (usage.counts.ai_scene ?? 0) +
    (usage.counts.ai_draft ?? 0) +
    (usage.counts.export ?? 0)
  );
}

export function getAvailableSceneCredits(
  billing?: BillingStatus,
  usage?: BillingUsage,
): number {
  if (!billing?.canUseProduct) return 0;
  if (billing.plan === "studio") return Infinity;

  const allowance = getMonthlySceneAllowance(billing.plan);
  const used = countCreditsUsedThisMonth(usage);
  return Math.max(0, allowance - used);
}

export function sceneCreditsNeeded(sceneCount: number): number {
  return sceneCount;
}

export function hasEnoughSceneCredits(
  sceneCount: number,
  billing?: BillingStatus,
  usage?: BillingUsage,
): boolean {
  const available = getAvailableSceneCredits(billing, usage);
  if (!Number.isFinite(available)) return true;
  return sceneCount <= available;
}

export function inferBrandStyle(tone?: string): {
  fontFamily: string;
  energy: string;
  audience: string;
} {
  if (tone === "technical") {
    return {
      fontFamily: "IBM Plex Sans",
      energy: "precise",
      audience: "developers and technical teams",
    };
  }
  if (tone === "enterprise") {
    return {
      fontFamily: "Inter",
      energy: "confident",
      audience: "enterprise buyers and ops leaders",
    };
  }
  return {
    fontFamily: "Instrument Sans",
    energy: "modern · high energy",
    audience: "app designers and developers",
  };
}
