"use client";

import { useMemo } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { createApiClient } from "@/lib/api/axios";

export function useAccessToken() {
  const { session, loading } = useAuth();
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
