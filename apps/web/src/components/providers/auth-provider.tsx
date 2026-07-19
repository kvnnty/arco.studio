"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthSession, AuthUser } from "@/lib/auth/constants";
import { createWebApiClient } from "@/lib/api/axios";

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<AuthSession | null>;
  setSessionUser: (user: AuthSession["user"]) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Module-level mutex so React Strict Mode remounts (and any concurrent callers)
 * share one in-flight /api/auth/session request. Parallel refresh-token rotations
 * trigger reuse detection and wipe the session.
 */
let sharedSessionRequest: Promise<AuthSession | null> | null = null;

async function fetchSessionFromApi(): Promise<AuthSession | null> {
  if (sharedSessionRequest) {
    return sharedSessionRequest;
  }

  sharedSessionRequest = (async () => {
    try {
      const client = createWebApiClient();
      const { data } = await client.get<{ session: AuthSession | null }>(
        "/api/auth/session",
      );
      return data.session;
    } catch {
      throw new Error("SESSION_FETCH_FAILED");
    } finally {
      sharedSessionRequest = null;
    }
  })();

  return sharedSessionRequest;
}

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: AuthSession | null;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [loading, setLoading] = useState(!initialSession);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const next = await fetchSessionFromApi();
      setSession(next);
      return next;
    } catch {
      // Network failure: do not wipe an existing session on silent recovery.
      if (!options?.silent) {
        setSession(null);
      }
      return null;
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  const setSessionUser = useCallback((user: AuthUser) => {
    setSession((current) => (current ? { ...current, user } : current));
  }, []);

  useEffect(() => {
    if (!initialSession) {
      void refresh();
    }
  }, [initialSession, refresh]);

  const value = useMemo(
    () => ({ session, loading, refresh, setSessionUser }),
    [session, loading, refresh, setSessionUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
