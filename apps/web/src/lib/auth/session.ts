import { jwtVerify, type JWTPayload } from "jose";

import { createApiClient } from "@/lib/api/axios";
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "@/lib/auth/cookies";
import type { AuthSession, AuthUser } from "@/lib/auth/constants";

type AccessPayload = JWTPayload & {
  sub?: string;
  email?: string;
  type?: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not configured");
    }
    return new TextEncoder().encode("arco-dev-secret");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessPayload | null> {
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

async function fetchCurrentUser(accessToken: string): Promise<AuthUser | null> {
  try {
    const client = createApiClient(accessToken);
    const { data } = await client.get<AuthUser>("/users/me");
    return data;
  } catch {
    return null;
  }
}

function userFromAccessPayload(payload: AccessPayload): AuthUser {
  return {
    id: payload.sub!,
    email: String(payload.email),
    name: null,
    emailVerified: true,
    onboardingCompleted: false,
    onboardingStep: "profile",
  };
}

export async function buildSessionFromAccessToken(
  accessToken: string,
): Promise<AuthSession | null> {
  const payload = await verifyAccessToken(accessToken);
  if (!payload?.sub || !payload.email) {
    return null;
  }

  const user =
    (await fetchCurrentUser(accessToken)) ?? userFromAccessPayload(payload);

  return {
    user,
    accessToken,
    expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000,
  };
}

export async function getServerSession(): Promise<AuthSession | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) return null;
  return buildSessionFromAccessToken(accessToken);
}

export async function hasRefreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshTokenFromCookies();
  return Boolean(refreshToken);
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
