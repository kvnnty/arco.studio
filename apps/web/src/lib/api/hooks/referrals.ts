import { useQuery } from "@tanstack/react-query";

import { apiGetReferrals, type ReferralSummary } from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useReferrals() {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.referrals.summary,
    queryFn: () => apiGetReferrals(token!),
    enabled: !!token && !loading,
  });
}

export type { ReferralSummary };
