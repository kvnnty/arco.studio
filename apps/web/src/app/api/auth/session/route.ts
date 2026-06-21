import { NextResponse } from "next/server";

import { getApiUrl } from "@/lib/api/client";
import {
  clearAuthCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/auth/cookies";
import type { AuthTokensResponse } from "@/lib/auth/constants";

export async function GET() {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    return NextResponse.json({ session: null });
  }

  const response = await fetch(`${getApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    await clearAuthCookies();
    return NextResponse.json({ session: null });
  }

  const tokens = (await response.json()) as AuthTokensResponse;
  await setAuthCookies(tokens);

  return NextResponse.json({
    session: {
      user: tokens.user,
      accessToken: tokens.accessToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    },
  });
}
