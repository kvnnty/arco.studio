"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { createMagicLink } from "@/lib/auth/magic-link";
import { createUser, getUserByEmail } from "@/lib/auth/users";

export type AuthFormState = {
  error?: string;
  sent?: boolean;
  verifyUrl?: string;
};

export async function magicLinkAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Email is required." };
  }

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

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

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

  try {
    await signIn("email", { email, redirectTo: "/dashboard" });
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
