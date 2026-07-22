"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthMethod = "google" | "github" | "email_code" | "password";

const STORAGE_KEY = "arco_last_auth_method";
const METHODS = new Set<AuthMethod>([
  "google",
  "github",
  "email_code",
  "password",
]);

function isAuthMethod(value: string | null): value is AuthMethod {
  return value !== null && METHODS.has(value as AuthMethod);
}

export function useLastUsedAuthMethod() {
  const [lastUsed, setLastUsed] = useState<AuthMethod | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setLastUsed(isAuthMethod(stored) ? stored : null);
    } catch {
      setLastUsed(null);
    }
  }, []);

  const remember = useCallback((method: AuthMethod) => {
    setLastUsed(method);
    try {
      localStorage.setItem(STORAGE_KEY, method);
    } catch {
      // Authentication must continue when browser storage is unavailable.
    }
  }, []);

  return { lastUsed, remember };
}
