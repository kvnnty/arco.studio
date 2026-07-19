import { useMutation, useQuery } from "@tanstack/react-query";

import {
  apiCreateBillingCheckout,
  apiCreateBillingPortal,
  apiCreateTopUpCheckout,
  apiGetBillingStatus,
  apiGetBillingUsage,
  ApiError,
  type BillingInterval,
  type CheckoutPlan,
} from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { queryKeys } from "@/lib/api/query-keys";

function useAuthenticatedBillingQuery<T>(
  queryKey: readonly unknown[],
  queryFn: (token: string) => Promise<T>,
) {
  const { token, loading: authLoading } = useApiClient();
  const { refresh } = useAuth();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn(token!);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }
        const next = await refresh({ silent: true });
        if (!next?.accessToken) {
          throw error;
        }
        return queryFn(next.accessToken);
      }
    },
    enabled: !!token && !authLoading,
    retry: false,
  });

  return {
    ...query,
    authLoading,
    isLoading:
      authLoading ||
      query.isFetching ||
      (!!token && query.isPending && !query.isError),
  };
}

export function useBillingStatus() {
  return useAuthenticatedBillingQuery(
    queryKeys.billing.status,
    apiGetBillingStatus,
  );
}

export function useBillingUsage() {
  return useAuthenticatedBillingQuery(
    queryKeys.billing.usage,
    apiGetBillingUsage,
  );
}

export function useCheckoutMutation() {
  const { token } = useApiClient();
  const { refresh } = useAuth();

  return useMutation({
    mutationFn: async ({
      plan,
      interval = "monthly",
    }: {
      plan: CheckoutPlan;
      interval?: BillingInterval;
    }) => {
      const activeToken = token ?? (await refresh({ silent: true }))?.accessToken;
      if (!activeToken) throw new Error("Not authenticated");
      try {
        return await apiCreateBillingCheckout(activeToken, plan, interval);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        const next = await refresh({ silent: true });
        if (!next?.accessToken) throw error;
        return apiCreateBillingCheckout(next.accessToken, plan, interval);
      }
    },
  });
}

export function useBillingPortalMutation() {
  const { token } = useApiClient();
  const { refresh } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const activeToken = token ?? (await refresh({ silent: true }))?.accessToken;
      if (!activeToken) throw new Error("Not authenticated");
      try {
        return await apiCreateBillingPortal(activeToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        const next = await refresh({ silent: true });
        if (!next?.accessToken) throw error;
        return apiCreateBillingPortal(next.accessToken);
      }
    },
  });
}

export function useTopUpCheckoutMutation() {
  const { token } = useApiClient();
  const { refresh } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const activeToken = token ?? (await refresh({ silent: true }))?.accessToken;
      if (!activeToken) throw new Error("Not authenticated");
      try {
        return await apiCreateTopUpCheckout(activeToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        const next = await refresh({ silent: true });
        if (!next?.accessToken) throw error;
        return apiCreateTopUpCheckout(next.accessToken);
      }
    },
  });
}
