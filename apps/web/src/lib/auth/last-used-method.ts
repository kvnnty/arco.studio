export type AuthMethod = "google" | "github" | "email_link";

const STORAGE_KEY = "arco_last_auth_method";
const PENDING_KEY = "arco_pending_auth_method";
const METHODS = new Set<AuthMethod>(["google", "github", "email_link"]);

function isAuthMethod(value: string | null): value is AuthMethod {
  return value !== null && METHODS.has(value as AuthMethod);
}

/** Remember only after auth succeeds — never on button click. */
export function commitAuthMethod(method: AuthMethod) {
  try {
    localStorage.setItem(STORAGE_KEY, method);
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // Authentication must continue when browser storage is unavailable.
  }
}

/** Stash OAuth provider during redirect; committed in sso-callback on success. */
export function stashAuthMethod(method: AuthMethod) {
  try {
    sessionStorage.setItem(PENDING_KEY, method);
  } catch {
    // Ignore — badge is cosmetic.
  }
}

export function consumeStashedAuthMethod(): AuthMethod | null {
  try {
    const pending = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return isAuthMethod(pending) ? pending : null;
  } catch {
    return null;
  }
}

export function readStoredAuthMethod(): AuthMethod | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isAuthMethod(stored) ? stored : null;
  } catch {
    return null;
  }
}
