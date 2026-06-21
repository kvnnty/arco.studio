import { Suspense } from "react";

import { getServerSession } from "@/lib/auth/session";
import { getBillingStatusAction } from "@/app/actions/billing";
import { EditorPage } from "@/components/editor/editor-page";
import { EditorPaywall } from "@/components/dashboard/editor-paywall";

export const metadata = {
  title: "Editor — Arco",
  description: "Upload a screen recording and add motion design.",
};

export default async function EditorRoute() {
  const session = await getServerSession();
  const billing = session?.accessToken
    ? await getBillingStatusAction().catch(() => null)
    : null;

  return (
    <EditorPaywall canUseProduct={billing?.canUseProduct ?? false}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <EditorPage />
      </Suspense>
    </EditorPaywall>
  );
}
