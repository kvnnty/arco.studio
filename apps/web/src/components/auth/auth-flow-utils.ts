/** Clerk custom-flow routes — clerk.com/docs/nextjs/guides/development/custom-flows */
export const CLERK_SIGN_IN_PATH = "/sign-in";
export const CLERK_SIGN_UP_PATH = "/sign-up";
export const CLERK_SIGN_IN_VERIFY_PATH = "/sign-in/verify";
export const CLERK_SIGN_UP_VERIFY_PATH = "/sign-up/verify";
export const CLERK_SIGN_IN_CONTINUE_PATH = "/sign-in/continue";
export const CLERK_SSO_CALLBACK_PATH = "/sso-callback";

export function authErrorMessage(
  error: unknown,
  fallback = "Authentication could not be completed. Try again.",
) {
  if (!error || typeof error !== "object") return fallback;

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  if ("errors" in error && Array.isArray(error.errors)) {
    const first = error.errors[0];
    if (first && typeof first === "object" && "message" in first) {
      return String(first.message);
    }
  }

  return fallback;
}

/** Clerk email-link docs build verificationUrl from protocol + host. */
export function emailLinkVerificationUrl(
  path: typeof CLERK_SIGN_IN_VERIFY_PATH | typeof CLERK_SIGN_UP_VERIFY_PATH,
) {
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}${path}`;
}
