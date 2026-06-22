import { useMutation, useQuery } from "@tanstack/react-query";

import {
  apiCreateBillingCheckout,
  apiCreateBillingPortal,
  apiGetBillingStatus,
  apiGetBillingUsage,
} from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useBillingStatus() {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.billing.status,
    queryFn: () => apiGetBillingStatus(token!),
    enabled: !!token && !loading,
  });
}

export function useBillingUsage() {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.billing.usage,
    queryFn: () => apiGetBillingUsage(token!),
    enabled: !!token && !loading,
  });
}

export function useCheckoutMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      return apiCreateBillingCheckout(token);
    },
  });
}

export function useBillingPortalMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      return apiCreateBillingPortal(token);
    },
  });
}
