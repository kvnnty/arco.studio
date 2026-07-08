"use client";

import { useEffect, useState } from "react";

import { getOAuthProviders, type OAuthProviderId } from "./oauth";

export function useOAuthProviders(initialProviders: OAuthProviderId[] = []) {
  const [providers, setProviders] =
    useState<OAuthProviderId[]>(initialProviders);

  useEffect(() => {
    let cancelled = false;

    getOAuthProviders().then((fetched) => {
      if (!cancelled) {
        setProviders(fetched);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return providers;
}
