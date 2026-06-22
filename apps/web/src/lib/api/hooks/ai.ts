import { useMutation } from "@tanstack/react-query";
import type { Marker, StylePreset } from "@arco/project-schema";

import {
  apiChat,
  apiGenerateDraft,
  apiRefineProject,
  apiRegenerateMarker,
} from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";

export function useGenerateDraftMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      durationMs: number;
      platform?: string;
      intent?: string;
      productUrl?: string;
      brandContext?: {
        title?: string;
        description?: string;
        tone?: string;
        colors?: { primary: string; background: string };
      };
    }): Promise<{
      markers: Marker[];
      stylePreset: StylePreset;
      source: "llm" | "heuristic";
    }> => {
      if (!token) throw new Error("Not authenticated");
      return apiGenerateDraft(token, input);
    },
  });
}

export function useRegenerateMarkerMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (
      input: Parameters<typeof apiRegenerateMarker>[1],
    ) => {
      if (!token) throw new Error("Not authenticated");
      return apiRegenerateMarker(token, input);
    },
  });
}

export function useRefineProjectMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof apiRefineProject>[1]) => {
      if (!token) throw new Error("Not authenticated");
      return apiRefineProject(token, input);
    },
  });
}

export function useChatMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof apiChat>[1]) => {
      if (!token) throw new Error("Not authenticated");
      return apiChat(token, input);
    },
  });
}
