import { ApiError, getApiUrl } from "@/lib/api/client";
import { setAuthCookies } from "@/lib/auth/cookies";
import type { AuthTokensResponse } from "@/lib/auth/constants";

export async function postBackendAuth<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Something went wrong.";
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (typeof payload.message === "string") message = payload.message;
      if (Array.isArray(payload.message)) message = payload.message.join(", ");
    } catch {
      // ignore
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export async function loginAndSetCookies(input: {
  email: string;
  password: string;
}) {
  const tokens = await postBackendAuth<AuthTokensResponse>("/auth/login", {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  await setAuthCookies(tokens);
  return tokens;
}

export async function verifyMagicLinkAndSetCookies(token: string) {
  const tokens = await postBackendAuth<AuthTokensResponse>(
    "/auth/magic-link/verify",
    { token },
  );
  await setAuthCookies(tokens);
  return tokens;
}

export async function completeOAuthAndSetCookies(token: string) {
  const tokens = await postBackendAuth<AuthTokensResponse>(
    "/auth/oauth/complete",
    { token },
  );
  await setAuthCookies(tokens);
  return tokens;
}
