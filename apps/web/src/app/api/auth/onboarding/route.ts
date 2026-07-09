import { NextResponse } from "next/server";

import { refreshBackendSession } from "@/lib/api/auth-server";
import { ApiError, createApiClient } from "@/lib/api/axios";
import {
  clearAuthCookiesOnResponse,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookiesOnResponse,
} from "@/lib/auth/cookies";
import type { AuthTokensResponse } from "@/lib/auth/constants";
import { buildSessionFromAccessToken } from "@/lib/auth/session";

type OnboardingBody = {
  name?: string;
  step?: string;
};

async function resolveAccessToken(): Promise<{
  accessToken: string;
  refreshedTokens: AuthTokensResponse | null;
} | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (accessToken && (await buildSessionFromAccessToken(accessToken))) {
    return { accessToken, refreshedTokens: null };
  }

  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await refreshBackendSession(refreshToken);
    return { accessToken: tokens.accessToken, refreshedTokens: tokens };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as OnboardingBody;

  let auth = await resolveAccessToken();
  if (!auth) {
    return clearAuthCookiesOnResponse(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    );
  }

  try {
    const client = createApiClient(auth.accessToken);
    const { data } = await client.patch("/auth/onboarding", body);

    const response = NextResponse.json(data);
    if (auth.refreshedTokens) {
      return setAuthCookiesOnResponse(response, auth.refreshedTokens);
    }
    return response;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshToken = await getRefreshTokenFromCookies();
      if (refreshToken) {
        try {
          const tokens = await refreshBackendSession(refreshToken);
          auth = { accessToken: tokens.accessToken, refreshedTokens: tokens };
          const client = createApiClient(auth.accessToken);
          const { data } = await client.patch("/auth/onboarding", body);
          return setAuthCookiesOnResponse(NextResponse.json(data), tokens);
        } catch (retryError) {
          if (retryError instanceof ApiError && retryError.status === 401) {
            return clearAuthCookiesOnResponse(
              NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
            );
          }
        }
      }
    }

    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not save onboarding.",
      },
      { status },
    );
  }
}
