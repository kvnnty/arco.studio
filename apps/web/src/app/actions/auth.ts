"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { apiRegister } from "@/lib/api/client";
import { ensureApiAuthForEmail } from "@/lib/auth/api-provision";
import { createMagicLink } from "@/lib/auth/magic-link";
import { createUser, getUserByEmail } from "@/lib/auth/users";
import {
  magicLinkSchema,
  passwordLoginSchema,
  passwordSignupSchema,
  signupSchema,
} from "@/lib/validations/auth";
import { formatZodError, safeParseFormData } from "@/lib/validations/form-data";

export type AuthFormState = {
  error?: string;
  sent?: boolean;
  verifyUrl?: string;
};

export async function magicLinkAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(magicLinkSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const { email } = parsed.data;

  const user = await getUserByEmail(email);
  if (!user) {
    return { error: "No account found for this email. Create one first." };
  }

  const token = await createMagicLink(email);
  const verifyUrl =
    process.env.NODE_ENV === "development"
      ? `/auth/verify?token=${token}`
      : undefined;

  return { sent: true, verifyUrl };
}

export async function passwordSignupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(passwordSignupSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const { name, email, password } = parsed.data;

  try {
    await apiRegister({ email, password, name });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not create account.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created but sign-in failed. Try logging in." };
    }
    throw error;
  }

  return {};
}

export async function passwordLoginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(passwordLoginSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return {};
}

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = safeParseFormData(signupSchema, formData);
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const { name, email } = parsed.data;

  try {
    await createUser({ name, email });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not create account.",
    };
  }

  const token = await createMagicLink(email);
  const verifyUrl =
    process.env.NODE_ENV === "development"
      ? `/auth/verify?token=${token}`
      : undefined;

  return { sent: true, verifyUrl };
}

export async function verifyMagicLinkAction(token: string) {
  const { consumeMagicLink } = await import("@/lib/auth/magic-link");
  const email = await consumeMagicLink(token);
  if (!email) {
    return { error: "This link is invalid or has expired." };
  }

  let authResult;
  try {
    authResult = await ensureApiAuthForEmail(email);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not connect to your account.",
    };
  }

  try {
    await signIn("credentials", {
      email: authResult.user.email,
      userId: authResult.user.id,
      name: authResult.user.name ?? "",
      accessToken: authResult.access_token,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Could not sign in. Please request a new link." };
    }
    throw error;
  }

  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
