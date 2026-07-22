import { NextResponse, type NextRequest } from "next/server";
import { decodeJwt } from "jose";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";

const protectedPrefixes = ["/dashboard", "/editor", "/onboarding"];

function accessTokenNeedsRefresh(token: string): boolean {
  try {
    const payload = decodeJwt(token);
    // This is only an early refresh hint. The API still verifies the signature
    // and backing server session before protected content is rendered.
    return (
      payload.type !== "access" ||
      !payload.exp ||
      payload.exp * 1000 <= Date.now() + 30_000
    );
  } catch {
    return true;
  }
}

function continueSession(request: NextRequest) {
  const url = new URL("/api/auth/continue", request.url);
  url.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    if (refreshToken) return continueSession(request);

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (accessTokenNeedsRefresh(accessToken)) return continueSession(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-arco-pathname",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/onboarding/:path*"],
};
