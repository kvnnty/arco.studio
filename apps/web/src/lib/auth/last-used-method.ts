"use client";

import { useCallback, useEffect, useState } from "react";

import type { OAuthProviderId } from "@/lib/auth/oauth";

export type AuthMethod = OAuthProviderId | "magic" | "password";

const STORAGE_KEY = "arco_last_auth_method";

const AUTH_METHODS = new Set<AuthMethod>([
  "google",
  "github",
  "magic",
  "password",
]);

function isAuthMethod(value: string | null): value is AuthMethod {
  return value !== null && AUTH_METHODS.has(value as AuthMethod);
}

export function getLastUsedAuthMethod(): AuthMethod | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isAuthMethod(value) ? value : null;
  } catch {
    return null;
  }
}

export function setLastUsedAuthMethod(method: AuthMethod) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, method);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function useLastUsedAuthMethod() {
  const [lastUsed, setLastUsed] = useState<AuthMethod | null>(null);

  useEffect(() => {
    setLastUsed(getLastUsedAuthMethod());
  }, []);

  const remember = useCallback((method: AuthMethod) => {
    setLastUsedAuthMethod(method);
  }, []);

  return { lastUsed, remember };
}
