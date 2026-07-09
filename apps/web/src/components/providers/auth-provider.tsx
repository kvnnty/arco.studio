"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AuthSession, AuthUser } from "@/lib/auth/constants";
import { createWebApiClient } from "@/lib/api/axios";

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setSessionUser: (user: AuthSession["user"]) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: AuthSession | null;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [loading, setLoading] = useState(!initialSession);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const promise = (async () => {
      setLoading(true);
      try {
        const client = createWebApiClient();
        const { data } = await client.get<{ session: AuthSession | null }>(
          "/api/auth/session",
        );
        setSession(data.session);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
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
