import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiListSessions,
  apiRevokeSession,
  apiUpdateProfile,
} from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useSessions() {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.settings.sessions,
    queryFn: () => apiListSessions(token!),
    enabled: !!token && !loading,
  });
}

export function useUpdateProfileMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (input: { name?: string }) => {
      if (!token) throw new Error("Not authenticated");
      return apiUpdateProfile(token, input);
    },
  });
}

export function useRevokeSessionMutation() {
  const { token } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => {
      if (!token) throw new Error("Not authenticated");
      return apiRevokeSession(token, sessionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.sessions,
      });
    },
  });
}
