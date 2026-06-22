import { NextResponse } from "next/server";

import { loginAndSetCookies } from "@/lib/api/auth-server";
import { ApiError } from "@/lib/api/client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email: string; password: string };
    const tokens = await loginAndSetCookies(body);
    return NextResponse.json({ user: tokens.user });
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
