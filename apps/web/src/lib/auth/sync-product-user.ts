import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { createApiClient } from "@/lib/api/axios";
import { resolveAfterSignIn } from "@/lib/auth/return-to";
import type { ProductUser } from "@/lib/auth/constants";

const DEFAULT_MAX_ATTEMPTS = 8;
const DEFAULT_RETRY_MS = 400;

/**
 * Lazy-provision the Arco user on first authenticated API request.
 * Clerk webhooks are the gold standard at scale; this covers local/dev
 * and the window before a webhook would fire.
 */
export async function ensureProductUser(
  getToken: () => Promise<string | null>,
  options?: { maxAttempts?: number; retryMs?: number },
): Promise<ProductUser> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retryMs = options?.retryMs ?? DEFAULT_RETRY_MS;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const token = await getToken();
    if (token) {
      try {
        const client = createApiClient(token);
        const { data } = await client.get<ProductUser>("/users/me");
        return data;
      } catch {
        // Retry until attempts are exhausted.
      }
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, retryMs));
    }
  }

  throw new Error("Could not provision product user");
}

/**
 * Clerk finalize/setActive navigate — industry pattern:
 * establish session → provision app user → single redirect to return URL.
 * Onboarding vs dashboard is decided by route layouts, not the callback.
 */
export function createAuthNavigate(
  router: AppRouterInstance,
  getToken: () => Promise<string | null>,
) {
  return async ({
    decorateUrl,
    session,
  }: {
    decorateUrl: (url: string) => string;
    session?: { currentTask?: unknown } | null;
  }) => {
    if (session?.currentTask) return;

    await ensureProductUser(getToken);

    const url = decorateUrl(resolveAfterSignIn());
    if (url.startsWith("http")) window.location.href = url;
    else router.replace(url);
  };
}
