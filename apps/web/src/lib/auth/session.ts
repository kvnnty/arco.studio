import { jwtVerify, type JWTPayload } from "jose";

import { getApiUrl } from "@/lib/api/client";
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";
import type { AuthSession, AuthTokensResponse, AuthUser } from "@/lib/auth/constants";

type AccessPayload = JWTPayload & {
  sub?: string;
  email?: string;
  type?: string;
};

function getJwtSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? "arco-dev-secret",
  );
}

async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "access" || !payload.sub || !payload.email) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function refreshTokens(refreshToken: string): Promise<AuthTokensResponse | null> {
  const response = await fetch(`${getApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json() as Promise<AuthTokensResponse>;
}

async function fetchCurrentUser(accessToken: string): Promise<AuthUser | null> {
  const response = await fetch(`${getApiUrl()}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json() as Promise<AuthUser>;
}

export async function getServerSession(): Promise<AuthSession | null> {
  let accessToken = await getAccessTokenFromCookies();
  const refreshToken = await getRefreshTokenFromCookies();

  if (!accessToken && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed) {
      await setAuthCookies(refreshed);
      accessToken = refreshed.accessToken;
    }
  }

  if (!accessToken) return null;

  let payload = await verifyAccessToken(accessToken);
  if (!payload && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (!refreshed) {
      await clearAuthCookies();
      return null;
    }
    await setAuthCookies(refreshed);
    accessToken = refreshed.accessToken;
    payload = await verifyAccessToken(accessToken);
  }

  if (!payload?.sub || !payload.email) {
    await clearAuthCookies();
    return null;
  }

  const user =
    (await fetchCurrentUser(accessToken)) ??
    ({
      id: payload.sub,
      email: String(payload.email),
      name: null,
      emailVerified: true,
      onboardingCompleted: false,
      onboardingStep: "plan",
    } satisfies AuthUser);

  return {
    user,
    accessToken,
    expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000,
  };
}

export async function requireServerSession(): Promise<AuthSession> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session;
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getServerSession();
  return session?.accessToken ?? null;
}
