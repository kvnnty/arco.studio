import { useMutation } from "@tanstack/react-query";

import { apiUpdateProfile } from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";

export function useUpdateProfileMutation() {
  const { token } = useApiClient();
  return useMutation({
    mutationFn: (input: { name?: string }) => {
      if (!token) throw new Error("Not authenticated");
      return apiUpdateProfile(token, input);
    },
  });
}
