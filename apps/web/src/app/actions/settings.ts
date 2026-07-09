"use server";

import { createApiClient } from "@/lib/api/axios";
import { getAccessToken } from "@/lib/auth/session";

async function requireToken() {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function updateProfileAction(input: { name?: string }) {
  const token = await requireToken();
  const client = createApiClient(token);
  const { data } = await client.patch("/users/me", input);
  return data;
}

export async function listSessionsAction() {
  const token = await requireToken();
  const client = createApiClient(token);
  const { data } = await client.get<
    Array<{
      id: string;
      deviceLabel: string | null;
      ipAddress: string | null;
      lastUsedAt: string;
      createdAt: string;
      current: boolean;
    }>
  >("/auth/sessions");
  return data;
}

export async function revokeSessionAction(sessionId: string) {
  const token = await requireToken();
  const client = createApiClient(token);
  await client.delete(`/auth/sessions/${sessionId}`);
}

export async function logoutAllSessionsAction() {
  const token = await requireToken();
  const refreshToken = (await import("@/lib/auth/cookies")).getRefreshTokenFromCookies();
  const client = createApiClient(token);

  await client.post("/auth/logout-all");

  if (refreshToken) {
    await createApiClient().post("/auth/logout", {
      refreshToken: await refreshToken,
    });
  }

  await (await import("@/lib/auth/cookies")).clearAuthCookies();
}

export async function setPasswordAction(password: string) {
  const token = await requireToken();
  const client = createApiClient(token);
  await client.post("/auth/password/set", { password });
}
