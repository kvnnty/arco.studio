"use server";

import { redirect } from "next/navigation";

import { ApiError, getApiUrl } from "@/lib/api/client";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import type { AuthTokensResponse } from "@/lib/auth/constants";
import {
  loginSchema,
  magicLinkSchema,
  passwordRegisterSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { formatZodError, safeParseFormData } from "@/lib/validations/form-data";

export type AuthFormState = {
  error?: string;
  sent?: boolean;
  devVerifyUrl?: string;
  message?: string;
};

async function postAuth<T>(path: string, body: unknown): Promise<T> {
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

export async function magicLinkAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(magicLinkSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  try {
    const result = await postAuth<{ sent: boolean; devVerifyUrl?: string }>(
      "/auth/magic-link",
      { email: parsed.data.email },
    );
    return { sent: true, devVerifyUrl: result.devVerifyUrl };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not send magic link.",
    };
  }
}

export async function passwordLoginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(loginSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  try {
    const tokens = await postAuth<AuthTokensResponse>("/auth/login", parsed.data);
    await setAuthCookies(tokens);
    redirect(tokens.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid email or password.",
    };
  }
}

export async function passwordRegisterAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(passwordRegisterSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  try {
    const result = await postAuth<{ sent: boolean; message: string; devVerifyUrl?: string }>(
      "/auth/register",
      parsed.data,
    );
    return {
      sent: true,
      message: result.message,
      devVerifyUrl: result.devVerifyUrl,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create account.",
    };
  }
}

export async function verifyMagicLinkAction(token: string) {
  try {
    const tokens = await postAuth<AuthTokensResponse>("/auth/magic-link/verify", {
      token,
    });
    await setAuthCookies(tokens);
    redirect(tokens.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "This link is invalid or expired.",
    };
  }
}

export async function completeOAuthAction(token: string) {
  try {
    const tokens = await postAuth<AuthTokensResponse>("/auth/oauth/complete", {
      token,
    });
    await setAuthCookies(tokens);
    redirect(tokens.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "OAuth sign-in failed.",
    };
  }
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(magicLinkSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  try {
    const result = await postAuth<{ sent: boolean; message: string }>(
      "/auth/password/forgot",
      { email: parsed.data.email },
    );
    return { sent: true, message: result.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not send reset link.",
    };
  }
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(resetPasswordSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  try {
    await postAuth("/auth/password/reset", parsed.data);
    redirect("/login?reset=1");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not reset password.",
    };
  }
}

export async function signOutAction() {
  const { getRefreshTokenFromCookies } = await import("@/lib/auth/cookies");
  const refreshToken = await getRefreshTokenFromCookies();

  if (refreshToken) {
    try {
      await postAuth("/auth/logout", { refreshToken });
    } catch {
      // ignore logout failures
    }
  }

  await clearAuthCookies();
  redirect("/login");
}

export async function completeOnboardingAction(input: {
  name?: string;
  step?: string;
}) {
  const { requireServerSession } = await import("@/lib/auth/session");
  const session = await requireServerSession();

  const response = await fetch(`${getApiUrl()}/auth/onboarding`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not save onboarding progress.");
  }

  return response.json();
}
