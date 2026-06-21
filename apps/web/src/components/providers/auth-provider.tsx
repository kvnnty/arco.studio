"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthSession } from "@/lib/auth/constants";

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
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
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const payload = (await response.json()) as { session: AuthSession | null };
      setSession(payload.session);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialSession) {
      void refresh();
    }
  }, [initialSession, refresh]);

  const value = useMemo(
    () => ({ session, loading, refresh }),
    [session, loading, refresh],
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
