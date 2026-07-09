import { NextResponse } from "next/server";

import { completeOAuth } from "@/lib/api/auth-server";
import { setAuthCookiesOnResponse } from "@/lib/auth/cookies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=Missing%20OAuth%20completion%20token.", request.url),
    );
  }

  try {
    const tokens = await completeOAuth(token);
    const destination = tokens.user.onboardingCompleted
      ? "/dashboard"
      : "/onboarding";
    return setAuthCookiesOnResponse(
      NextResponse.redirect(new URL(destination, request.url)),
      tokens,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OAuth sign-in failed.";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
