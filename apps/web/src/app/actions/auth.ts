"use server";

import { redirect } from "next/navigation";

import { postBackendAuth } from "@/lib/api/auth-server";
import { createApiClient } from "@/lib/api/axios";
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
  message?: string;
};

export async function magicLinkAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(magicLinkSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  try {
    await postBackendAuth<{ sent: boolean }>("/auth/magic-link", {
      email: parsed.data.email,
    });
    return { sent: true };
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
    const tokens = await postBackendAuth<AuthTokensResponse>("/auth/login", parsed.data);
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
    const result = await postBackendAuth<{ sent: boolean; message: string }>(
      "/auth/register",
      parsed.data,
    );
    return {
      sent: true,
      message: result.message,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create account.",
    };
  }
}

export async function verifyMagicLinkAction(token: string) {
  try {
    const tokens = await postBackendAuth<AuthTokensResponse>("/auth/magic-link/verify", {
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
    const tokens = await postBackendAuth<AuthTokensResponse>("/auth/oauth/complete", {
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
    const result = await postBackendAuth<{ sent: boolean; message: string }>(
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
    await postBackendAuth("/auth/password/reset", parsed.data);
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
      await postBackendAuth("/auth/logout", { refreshToken });
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

  const client = createApiClient(session.accessToken);
  const { data } = await client.patch("/auth/onboarding", input);
  return data;
}
