import { useMutation, useQuery } from "@tanstack/react-query";

import { apiCreateRender, apiGetRender } from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import { queryKeys } from "@/lib/api/query-keys";

const ACTIVE_RENDER_STATUSES = new Set([
  "queued",
  "rendering",
  "processing",
  "uploading",
]);

export function useRenderJob(jobId: string | null, enabled = true) {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.renders.detail(jobId ?? ""),
    queryFn: () => apiGetRender(token!, jobId!),
    enabled: !!token && !loading && !!jobId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || !ACTIVE_RENDER_STATUSES.has(status)) return false;
      return 2000;
    },
  });
}

export function useCreateRenderMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (input: {
      projectId: string;
      quality?: "720p" | "1080p" | "4k";
      format?: string;
    }) => {
      if (!token) throw new Error("Not authenticated");
      return apiCreateRender(token, input);
    },
  });
}
