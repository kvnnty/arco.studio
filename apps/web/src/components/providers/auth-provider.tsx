"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import type { AuthSession, AuthUser } from "@/lib/auth/constants";
import { createWebApiClient } from "@/lib/api/axios";

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<AuthSession | null>;
  establishSession: (session: AuthSession) => void;
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
      const load = async () => {
        const client = createWebApiClient();
        const { data } = await client.get<{ session: AuthSession | null }>(
          "/api/auth/session",
        );
        return data.session;
      };

      // Refresh cookies are shared by tabs. Serialize rotation across tabs so
      // simultaneous 401 recovery cannot reuse the same refresh token.
      if (typeof navigator !== "undefined" && navigator.locks) {
        return await navigator.locks.request("arco-session-refresh", load);
      }
      return await load();
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
  const pathname = usePathname();

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const next = await fetchSessionFromApi();
      setSession(next);
      return next;
    } catch {
      // A network or rate-limit failure is not proof that the session ended.
      // Preserve current state; definitive auth failures return session: null.
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

  const establishSession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!initialSession) {
      void refresh();
    }
  }, [initialSession, refresh]);

  useEffect(() => {
    if (!session) return;

    const refreshAt = Math.max(Date.now(), session.expiresAt - 60_000);
    const timeout = window.setTimeout(
      () => void refresh({ silent: true }),
      refreshAt - Date.now(),
    );
    return () => window.clearTimeout(timeout);
  }, [refresh, session]);

  useEffect(() => {
    const isProtected = ["/dashboard", "/editor", "/onboarding"].some(
      (prefix) => pathname.startsWith(prefix),
    );
    if (!loading && !session && isProtected) {
      window.location.replace(
        `/api/auth/continue?returnTo=${encodeURIComponent(`${pathname}${window.location.search}`)}`,
      );
    }
  }, [loading, pathname, session]);

  const value = useMemo(
    () => ({ session, loading, refresh, establishSession, setSessionUser }),
    [session, loading, refresh, establishSession, setSessionUser],
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
