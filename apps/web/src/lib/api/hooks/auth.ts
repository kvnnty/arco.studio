import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import {
  apiCompleteOnboarding,
  apiForgotPassword,
  apiRegister,
  apiRequestMagicLink,
  apiResetPassword,
} from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import { readReferralCode } from "@/lib/referral";

async function postAuthRoute<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : "Something went wrong.",
    );
  }

  return payload;
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
  const { refresh } = useAuth();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      postAuthRoute<{ user: { onboardingCompleted: boolean } }>(
        "/api/auth/login",
        input,
      ),
    onSuccess: async (data) => {
      await refresh();
      router.push(data.user.onboardingCompleted ? "/dashboard" : "/onboarding");
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const { refresh } = useAuth();

  return useMutation({
    mutationFn: () => postAuthRoute("/api/auth/logout", {}),
    onSuccess: async () => {
      await refresh();
      router.push("/login");
    },
  });
}

export function useCompleteOnboardingMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (input: { name?: string; step?: string }) => {
      if (!token) throw new Error("Not authenticated");
      return apiCompleteOnboarding(token, input);
    },
  });
}
