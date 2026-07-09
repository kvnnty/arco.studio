import type { BillingStatus } from "@/lib/api/client";

export function getAvailableCredits(billing?: BillingStatus | null): number {
  return billing?.credits.available ?? 0;
}

export function getReservedCredits(billing?: BillingStatus | null): number {
  return billing?.credits.reserved ?? 0;
}

export function hasEnoughCredits(
  billing: BillingStatus | null | undefined,
  amount: number,
): boolean {
  return getAvailableCredits(billing) >= amount;
}

export const CREDIT_COST_HINTS = {
  ai_draft: 25,
  ai_storyboard: 30,
  ai_chat: 5,
  ai_refine: 10,
  ai_regenerate: 8,
  voice_generate: 20,
  voice_preview: 2,
  export_720p: 50,
  export_1080p: 75,
  export_4k: 100,
} as const;

export function creditCostHint(
  action: keyof typeof CREDIT_COST_HINTS,
): number {
  return CREDIT_COST_HINTS[action];
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
