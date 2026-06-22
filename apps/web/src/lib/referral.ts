const REFERRAL_COOKIE = "arco_ref";
const REFERRAL_MAX_AGE_DAYS = 30;

export function normalizeReferralCode(code: string | null | undefined): string | null {
  const normalized = code?.trim().toUpperCase();
  return normalized ? normalized : null;
}

export function storeReferralCode(code: string | null | undefined): void {
  const normalized = normalizeReferralCode(code);
  if (!normalized || typeof document === "undefined") return;

  const maxAge = REFERRAL_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function readReferralCode(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${REFERRAL_COOKIE}=`));

  if (!match) return null;

  const value = match.slice(REFERRAL_COOKIE.length + 1);
  return normalizeReferralCode(decodeURIComponent(value));
}

export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
