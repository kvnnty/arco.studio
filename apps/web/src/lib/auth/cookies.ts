import { cookies } from "next/headers";

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  type AuthTokensResponse,
} from "@/lib/auth/constants";

const isProd = process.env.NODE_ENV === "production";

export async function setAuthCookies(tokens: AuthTokensResponse) {
  const jar = await cookies();
  jar.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  jar.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_TOKEN_COOKIE);
  jar.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
