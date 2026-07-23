import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { resolveAfterSignIn } from "@/lib/auth/return-to";

/**
 * Clerk `finalize()` / `setActive()` navigate callback.
 *
 * @see https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/oauth-connections
 * @see https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/email-links
 * @see https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/session-tasks
 */
export function createAuthNavigate(router: AppRouterInstance) {
  return async ({
    decorateUrl,
    session,
  }: {
    decorateUrl: (url: string) => string;
    session?: { currentTask?: unknown } | null;
  }) => {
    if (session?.currentTask) return;

    const url = decorateUrl(resolveAfterSignIn());
    if (url.startsWith("http")) window.location.href = url;
    else router.push(url);
  };
}
