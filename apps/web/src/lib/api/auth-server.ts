import { createApiClient } from "@/lib/api/axios";
import type { AuthTokensResponse } from "@/lib/auth/constants";

export async function postBackendAuth<T>(path: string, body: unknown): Promise<T> {
  const client = createApiClient();
  const { data } = await client.post<T>(path, body);
  return data;
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
}) {
  return postBackendAuth<AuthTokensResponse>("/auth/login", {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
}

export async function verifyMagicLink(token: string) {
  return postBackendAuth<AuthTokensResponse>("/auth/magic-link/verify", {
    token,
  });
}

export async function completeOAuth(token: string) {
  return postBackendAuth<AuthTokensResponse>("/auth/oauth/complete", {
    token,
  });
}

export async function refreshBackendSession(refreshToken: string) {
  return postBackendAuth<AuthTokensResponse>("/auth/refresh", {
    refreshToken,
  });
}
