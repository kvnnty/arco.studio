import { useMutation } from "@tanstack/react-query";

import { apiAnalyzeBrandUrl, type BrandKitResponse } from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";

export type BrandKit = BrandKitResponse;

export function useAnalyzeBrandMutation() {
  const { token } = useApiClient();

  return useMutation({
    mutationFn: (url: string) => {
      if (!token) throw new Error("Not authenticated");
      return apiAnalyzeBrandUrl(token, url);
    },
  });
}
