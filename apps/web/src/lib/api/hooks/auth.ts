import { useClerk } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createApiClient } from "@/lib/api/axios";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import type { ProductUser } from "@/lib/auth/constants";
import { readReferralCode } from "@/lib/referral";

export function useLogoutMutation() {
  const { signOut } = useClerk();
  return useMutation({
    mutationFn: () => signOut({ redirectUrl: "/sign-in" }),
  });
}

export function useCompleteOnboardingMutation() {
  const { token } = useApiClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: { name?: string; step?: string }) => {
      if (!token) throw new Error("Not authenticated");
      const client = createApiClient(token);
      const { data } = await client.patch<ProductUser>(
        "/users/me/onboarding",
        { ...input, referralCode: readReferralCode() ?? undefined },
      );
      return data;
    },
    onSuccess: () => router.refresh(),
  });
}
