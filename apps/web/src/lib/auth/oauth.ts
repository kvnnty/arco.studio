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

export function getOAuthStartUrl(provider: OAuthProviderId): string {
  return `${getApiUrl()}/auth/oauth/${provider}`;
}
