/**
 * Public API base URL. Must be identical on server and client so any
 * URL rendered into HTML (e.g. OAuth hrefs) does not cause hydration mismatches.
 */
export function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "http://localhost:8000/api"
  );
}

/**
 * Base URL for outbound HTTP from this process. In local Node SSR, rewrite
 * localhost → 127.0.0.1 so requests hit the IPv4 listener reliably.
 */
export function getRequestApiUrl(): string {
  const url = getApiUrl();
  if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
    return url.replace("://localhost", "://127.0.0.1");
  }
  return url;
}
