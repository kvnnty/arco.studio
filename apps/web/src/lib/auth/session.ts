import { cache } from "react";
import { decodeJwt, type JWTPayload } from "jose";

import { ApiError, createApiClient } from "@/lib/api/axios";
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

function decodeAccessToken(token: string): AccessPayload | null {
  try {
    const payload = decodeJwt(token);
    if (payload.type !== "access" || !payload.sub || !payload.email) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Live API check is the source of truth. A JWT can still verify after the
 * server session was revoked (refresh rotation) — never invent a session
 * from claims alone or clients keep calling the API with a dead token.
 */
async function fetchCurrentUser(accessToken: string): Promise<AuthUser | null> {
  try {
    const client = createApiClient(accessToken);
    const { data } = await client.get<AuthUser>("/users/me");
    return data;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return null;
    }
    // Transient network errors: still reject so callers can refresh rather
    // than serving a stale/unverified session.
    return null;
  }
}

export async function buildSessionFromAccessToken(
  accessToken: string,
): Promise<AuthSession | null> {
  const user = await fetchCurrentUser(accessToken);
  if (!user) {
    return null;
  }

  // The API call above already verified the signature and active session. We
  // only decode the same token here to schedule its refresh; the web app does
  // not need a second copy of the API's signing secret.
  const payload = decodeAccessToken(accessToken);

  return {
    user,
    accessToken,
    expiresAt: payload?.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000,
  };
}

async function readServerSession(): Promise<AuthSession | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) return null;
  return buildSessionFromAccessToken(accessToken);
}

// Root and protected layouts both need the session. React's request cache keeps
// those checks on one authoritative API lookup for a render.
export const getServerSession = cache(readServerSession);

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
