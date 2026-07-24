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
import { useManagedAuth } from "@/hooks/use-managed-auth";
import { queryKeys } from "@/lib/api/query-keys";
import type { AccessTokenSource } from "@/lib/auth/constants";

const SESSION_RECOVERY_ERROR =
  "We could not renew your session. Check your connection and try again.";

function useAuthenticatedBillingQuery<T>(
  queryKey: readonly unknown[],
  queryFn: (token: AccessTokenSource) => Promise<T>,
) {
  const { token, loading: authLoading } = useApiClient();
  const { refresh } = useManagedAuth();

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
          throw new Error(SESSION_RECOVERY_ERROR);
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
  const { refresh } = useManagedAuth();

  return useMutation({
    mutationFn: async ({
      plan,
      interval = "annual",
    }: {
      plan: CheckoutPlan;
      interval?: BillingInterval;
    }) => {
      const activeToken =
        token ?? (await refresh({ silent: true }))?.accessToken;
      if (!activeToken) throw new Error("Not authenticated");
      try {
        return await apiCreateBillingCheckout(activeToken, plan, interval);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        const next = await refresh({ silent: true });
        if (!next?.accessToken) throw new Error(SESSION_RECOVERY_ERROR);
        return apiCreateBillingCheckout(next.accessToken, plan, interval);
      }
    },
  });
}

export function useBillingPortalMutation() {
  const { token } = useApiClient();
  const { refresh } = useManagedAuth();

  return useMutation({
    mutationFn: async () => {
      const activeToken =
        token ?? (await refresh({ silent: true }))?.accessToken;
      if (!activeToken) throw new Error("Not authenticated");
      try {
        return await apiCreateBillingPortal(activeToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        const next = await refresh({ silent: true });
        if (!next?.accessToken) throw new Error(SESSION_RECOVERY_ERROR);
        return apiCreateBillingPortal(next.accessToken);
      }
    },
  });
}

export function useTopUpCheckoutMutation() {
  const { token } = useApiClient();
  const { refresh } = useManagedAuth();

  return useMutation({
    mutationFn: async () => {
      const activeToken =
        token ?? (await refresh({ silent: true }))?.accessToken;
      if (!activeToken) throw new Error("Not authenticated");
      try {
        return await apiCreateTopUpCheckout(activeToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        const next = await refresh({ silent: true });
        if (!next?.accessToken) throw new Error(SESSION_RECOVERY_ERROR);
        return apiCreateTopUpCheckout(next.accessToken);
      }
    },
  });
}
