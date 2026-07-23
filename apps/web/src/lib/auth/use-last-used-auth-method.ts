"use client";

import { useEffect, useState } from "react";

import {
  readStoredAuthMethod,
  type AuthMethod,
} from "@/lib/auth/last-used-method";

export type { AuthMethod };

/** Badge reflects the last successful sign-in from a prior visit only. */
export function useLastUsedAuthMethod() {
  const [lastUsed, setLastUsed] = useState<AuthMethod | null>(null);

  useEffect(() => {
    setLastUsed(readStoredAuthMethod());
  }, []);

  return { lastUsed };
}
