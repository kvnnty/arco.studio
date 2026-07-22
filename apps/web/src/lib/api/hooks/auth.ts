import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import {
  apiForgotPassword,
  apiRegister,
  apiRequestMagicLink,
  apiResetPassword,
} from "@/lib/api/client";
import { createWebApiClient } from "@/lib/api/axios";
import type { AuthUser } from "@/lib/auth/constants";
import { readReferralCode } from "@/lib/referral";

async function requestAuthRoute<T>(
  path: string,
  body: unknown,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  try {
    const client = createWebApiClient();
    const { data } = await client.request<T>({ method, url: path, data: body });
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      const payload = error.response?.data as { message?: string } | undefined;
      throw new Error(
        typeof payload?.message === "string"
          ? payload.message
          : error.code === "ECONNABORTED"
            ? "Arco took too long to respond. Please try again."
            : "Could not reach Arco. Check your connection and try again.",
      );
    }
    throw error;
  }
}

export function useMagicLinkMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      apiRequestMagicLink(email, readReferralCode() ?? undefined),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiRegister({
        ...input,
        referralCode: readReferralCode() ?? undefined,
      }),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => apiForgotPassword(email),
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      apiResetPassword(input),
    onSuccess: () => {
      router.push("/login?reset=1");
    },
  });
}

export function useLoginMutation() {
  const router = useRouter();
  const { establishSession } = useAuth();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      requestAuthRoute<{
        user: { onboardingCompleted: boolean };
        session: import("@/lib/auth/constants").AuthSession;
      }>("/api/auth/login", input),
    onSuccess: (data) => {
      establishSession(data.session);
      router.push(data.user.onboardingCompleted ? "/dashboard" : "/onboarding");
      router.refresh();
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const { refresh } = useAuth();

  return useMutation({
    mutationFn: () => requestAuthRoute("/api/auth/logout", {}),
    onSuccess: async () => {
      await refresh();
      router.push("/login");
    },
  });
}

export function useCompleteOnboardingMutation() {
  const { setSessionUser } = useAuth();

  return useMutation({
    mutationFn: (input: { name?: string; step?: string }) =>
      requestAuthRoute<AuthUser>("/api/auth/onboarding", input, "PATCH"),
    onSuccess: (user) => {
      setSessionUser(user);
    },
  });
}
