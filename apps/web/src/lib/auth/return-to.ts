/** Default landing route after sign-in — layouts route to onboarding when needed. */
export const DEFAULT_AFTER_SIGN_IN = "/dashboard";

export const RETURN_TO_COOKIE = "arco_return_to";
const RETURN_TO_MAX_AGE_SEC = 300;

const BLOCKED_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/sso-callback",
] as const;

/** Prevent open redirects — relative in-app paths only. */
export function validateReturnTo(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.startsWith("/")) return null;
  if (url.startsWith("//")) return null;
  if (url.includes("@") || url.includes("\\")) return null;
  if (BLOCKED_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`))) {
    return null;
  }
  return url;
}

export function stashReturnTo(url: string) {
  const safe = validateReturnTo(url);
  if (!safe) return;
  document.cookie = `${RETURN_TO_COOKIE}=${encodeURIComponent(safe)}; path=/; max-age=${RETURN_TO_MAX_AGE_SEC}; SameSite=Lax`;
}

export function readReturnTo(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${RETURN_TO_COOKIE}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  return validateReturnTo(decodeURIComponent(match[1]));
}

export function clearReturnTo() {
  if (typeof document === "undefined") return;
  document.cookie = `${RETURN_TO_COOKIE}=; path=/; max-age=0`;
}

export function resolveAfterSignIn(): string {
  const returnTo = readReturnTo();
  clearReturnTo();
  return returnTo ?? DEFAULT_AFTER_SIGN_IN;
}

/** Build sign-in URL preserving intended destination (middleware + layout pattern). */
export function signInUrl(returnTo?: string) {
  const safe = validateReturnTo(returnTo);
  if (!safe) return "/sign-in";
  return `/sign-in?redirect_url=${encodeURIComponent(safe)}`;
}
