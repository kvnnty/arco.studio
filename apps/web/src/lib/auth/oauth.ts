import { getApiUrl } from "@/lib/api/config";

export type OAuthProviderId = "google" | "github";

export function getOAuthStartUrl(
  provider: OAuthProviderId,
  referralCode?: string | null,
): string {
  const url = new URL(`${getApiUrl()}/auth/oauth/${provider}`);
  const normalized = referralCode?.trim();
  if (normalized) {
    url.searchParams.set("ref", normalized);
  }
  return url.toString();
}
