"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";

import type { AccessTokenProvider } from "@/lib/auth/constants";

type ManagedSession = { accessToken: AccessTokenProvider };

/**
 * Product-facing adapter only. Clerk owns identity, cookies, token refresh,
 * session revocation, and cross-tab coordination.
 */
export function useManagedAuth() {
  const { getToken, isLoaded, isSignedIn } = useClerkAuth();
  const accessToken = useCallback(() => getToken(), [getToken]);
  const session = useMemo<ManagedSession | null>(
    () => (isSignedIn ? { accessToken } : null),
    [accessToken, isSignedIn],
  );

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    void options;
    if (!isSignedIn) return null;
    await getToken({ skipCache: true });
    return { accessToken };
  }, [accessToken, getToken, isSignedIn]);

  return { session, loading: !isLoaded, refresh };
}
