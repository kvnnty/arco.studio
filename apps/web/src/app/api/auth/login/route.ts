import { NextResponse } from "next/server";

import { loginWithPassword } from "@/lib/api/auth-server";
import { ApiError } from "@/lib/api/client";
import { setAuthCookiesOnResponse } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email: string; password: string };
    const tokens = await loginWithPassword(body);
    return setAuthCookiesOnResponse(
      NextResponse.json({
        user: tokens.user,
        session: {
          user: tokens.user,
          accessToken: tokens.accessToken,
          expiresAt: Date.now() + tokens.expiresIn * 1000,
        },
      }),
      tokens,
    );
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 400;
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Invalid email or password.",
      },
      { status },
    );
  }
}
