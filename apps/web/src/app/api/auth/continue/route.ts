import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/axios";
import { refreshBackendSession } from "@/lib/api/auth-server";
import {
  clearAuthCookiesOnResponse,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookiesOnResponse,
} from "@/lib/auth/cookies";
import { buildSessionFromAccessToken } from "@/lib/auth/session";

const ALLOWED_DESTINATIONS = ["/dashboard", "/editor", "/onboarding"];

function safeReturnTo(request: Request): string {
  const candidate =
    new URL(request.url).searchParams.get("returnTo") ?? "/dashboard";
  const allowed = ALLOWED_DESTINATIONS.some(
    (prefix) =>
      candidate === prefix ||
      candidate.startsWith(`${prefix}/`) ||
      candidate.startsWith(`${prefix}?`),
  );

  return candidate.startsWith("/") && !candidate.startsWith("//") && allowed
    ? candidate
    : "/dashboard";
}

function loginResponse(request: Request, returnTo: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", returnTo);
  url.searchParams.set("reason", "session");
  return clearAuthCookiesOnResponse(NextResponse.redirect(url));
}

export async function GET(request: Request) {
  const returnTo = safeReturnTo(request);
  const accessToken = await getAccessTokenFromCookies();

  if (accessToken) {
    const session = await buildSessionFromAccessToken(accessToken);
    if (session && session.expiresAt > Date.now() + 30_000) {
      return NextResponse.redirect(new URL(returnTo, request.url));
    }
  }

  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) return loginResponse(request, returnTo);

  try {
    const tokens = await refreshBackendSession(refreshToken);
    return setAuthCookiesOnResponse(
      NextResponse.redirect(new URL(returnTo, request.url)),
      tokens,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return loginResponse(request, returnTo);
    }

    return NextResponse.json(
      { message: "Authentication is temporarily unavailable. Please retry." },
      { status: 503, headers: { "Retry-After": "2" } },
    );
  }
}
