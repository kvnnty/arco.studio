import { getApiUrl } from "@/lib/api/client";

export type OAuthProviderId = "google" | "github";

export async function getOAuthProviders(): Promise<OAuthProviderId[]> {
  try {
    const response = await fetch(`${getApiUrl()}/auth/oauth/providers`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { providers?: OAuthProviderId[] };
    return payload.providers ?? [];
  } catch {
    return [];
  }
}

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
