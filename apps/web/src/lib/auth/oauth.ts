import { createApiClient } from "@/lib/api/axios";
import { getApiUrl } from "@/lib/api/config";

export type OAuthProviderId = "google" | "github";

export async function getOAuthProviders(): Promise<OAuthProviderId[]> {
  try {
    const client = createApiClient();
    const { data } = await client.get<{ providers?: OAuthProviderId[] }>(
      "/auth/oauth/providers",
    );
    return data.providers ?? [];
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
