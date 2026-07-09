function normalizeApiUrl(url: string): string {
  if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
    return url.replace("://localhost", "://127.0.0.1");
  }
  return url;
}

export function getApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "http://localhost:8000/api";
  return normalizeApiUrl(url);
}
