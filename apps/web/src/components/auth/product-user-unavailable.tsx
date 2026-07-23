"use client";

import { useClerk } from "@clerk/nextjs";

import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { CLERK_SIGN_IN_PATH } from "@/components/auth/auth-flow-utils";

/** Clerk session is valid but the Arco API user could not be loaded. */
export function ProductUserUnavailable() {
  const { signOut } = useClerk();

  return (
    <AuthStatusCard
      variant="error"
      title="Could not load your account"
      description="You're signed in with Clerk, but Arco couldn't reach the API to set up your account. Make sure the API is running, then sign in again."
      restartHref={CLERK_SIGN_IN_PATH}
      restartLabel="Back to sign in"
      footer={
        <button
          type="button"
          className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          onClick={() => void signOut({ redirectUrl: CLERK_SIGN_IN_PATH })}
        >
          Sign out and try again
        </button>
      }
    />
  );
}
