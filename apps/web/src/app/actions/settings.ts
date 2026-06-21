"use server";

import { getAccessToken } from "@/lib/auth/session";
import { getApiUrl } from "@/lib/api/client";

async function requireToken() {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function updateProfileAction(input: { name?: string }) {
  const token = await requireToken();
  const response = await fetch(`${getApiUrl()}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not update profile.");
  }

  return response.json();
}

export async function listSessionsAction() {
  const token = await requireToken();
  const response = await fetch(`${getApiUrl()}/auth/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load sessions.");
  }

  return response.json() as Promise<
    Array<{
      id: string;
      deviceLabel: string | null;
      ipAddress: string | null;
      lastUsedAt: string;
      createdAt: string;
      current: boolean;
    }>
  >;
}

export async function revokeSessionAction(sessionId: string) {
  const token = await requireToken();
  const response = await fetch(`${getApiUrl()}/auth/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Could not revoke session.");
  }
}

export async function logoutAllSessionsAction() {
  const token = await requireToken();
  const refreshToken = (await import("@/lib/auth/cookies")).getRefreshTokenFromCookies();

  await fetch(`${getApiUrl()}/auth/logout-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (refreshToken) {
    await fetch(`${getApiUrl()}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: await refreshToken }),
    });
  }

  await (await import("@/lib/auth/cookies")).clearAuthCookies();
}

export async function setPasswordAction(password: string) {
  const token = await requireToken();
  const response = await fetch(`${getApiUrl()}/auth/password/set`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error("Could not set password.");
  }
}
