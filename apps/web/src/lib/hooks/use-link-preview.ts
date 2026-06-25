"use client";

import { useEffect, useRef, useState } from "react";

import {
  apiPreviewBrandUrl,
  type BrandKitResponse,
} from "@/lib/api/client";
import { useApiClient } from "@/lib/api/hooks/use-api-client";

export type LinkPreview = BrandKitResponse;

export type LinkPreviewState = "idle" | "loading" | "success" | "error";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function useLinkPreview(url: string, debounceMs = 500) {
  const { token } = useApiClient();
  const [state, setState] = useState<LinkPreviewState>("idle");
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = url.trim();

    if (!trimmed || !isValidHttpUrl(trimmed)) {
      setState("idle");
      setPreview(null);
      return;
    }

    if (!token) {
      setState("idle");
      setPreview(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setState("loading");

    const timeout = window.setTimeout(() => {
      void apiPreviewBrandUrl(token, trimmed)
        .then((result) => {
          if (requestId !== requestIdRef.current) return;
          setPreview(result);
          setState("success");
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setPreview(null);
          setState("error");
        });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [url, token, debounceMs]);

  return { state, preview };
}
