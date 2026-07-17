import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/axios";
import { refreshBackendSession } from "@/lib/api/auth-server";
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  clearAuthCookiesOnResponse,
  setAuthCookiesOnResponse,
} from "@/lib/auth/cookies";
import { buildSessionFromAccessToken } from "@/lib/auth/session";

export async function GET() {
  const accessToken = await getAccessTokenFromCookies();
  if (accessToken) {
    const session = await buildSessionFromAccessToken(accessToken);
    if (session) {
      return NextResponse.json({ session });
    }
  }

  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    return NextResponse.json({ session: null });
  }

  try {
    const tokens = await refreshBackendSession(refreshToken);

    return setAuthCookiesOnResponse(
      NextResponse.json({
        session: {
          user: tokens.user,
          accessToken: tokens.accessToken,
          expiresAt: Date.now() + tokens.expiresIn * 1000,
        },
      }),
      tokens,
    );
  } catch (error) {
    // Only clear cookies on definitive auth failure. Transient API errors
    // should not log the user out.
    if (error instanceof ApiError && error.status === 401) {
      return clearAuthCookiesOnResponse(NextResponse.json({ session: null }));
    }

    if (error instanceof ApiError && error.status === 403) {
      return clearAuthCookiesOnResponse(NextResponse.json({ session: null }));
    }

    return NextResponse.json({ session: null }, { status: 503 });
  }
}
