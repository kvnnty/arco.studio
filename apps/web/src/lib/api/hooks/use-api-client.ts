"use client";

import { useMemo } from "react";

import { useManagedAuth } from "@/hooks/use-managed-auth";
import { createApiClient } from "@/lib/api/axios";

export function useAccessToken() {
  const { session, loading } = useManagedAuth();
  return {
    token: session?.accessToken ?? null,
    loading,
    session,
  };
}

export function useApiClient() {
  const { token, loading, session } = useAccessToken();

  const client = useMemo(
    () => (token ? createApiClient(token) : null),
    [token],
  );

  return {
    client,
    token,
    loading,
    session,
    isAuthenticated: !!token,
  };
}
