import { NextResponse } from "next/server";

import { postBackendAuth } from "@/lib/api/auth-server";
import {
  clearAuthCookiesOnResponse,
  getRefreshTokenFromCookies,
} from "@/lib/auth/cookies";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();

  if (refreshToken) {
    try {
      await postBackendAuth("/auth/logout", { refreshToken });
    } catch {
      // ignore logout failures
    }
  }

  return clearAuthCookiesOnResponse(NextResponse.json({ ok: true }));
}
