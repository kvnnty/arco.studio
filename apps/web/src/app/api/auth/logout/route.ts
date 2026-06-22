import { NextResponse } from "next/server";

import { postBackendAuth } from "@/lib/api/auth-server";
import {
  clearAuthCookies,
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

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
