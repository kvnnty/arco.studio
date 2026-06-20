"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type EditorPaywallProps = {
  canUseProduct: boolean;
  children: React.ReactNode;
};

export function EditorPaywall({ canUseProduct, children }: EditorPaywallProps) {
  const router = useRouter();

  useEffect(() => {
    if (!canUseProduct) {
      router.replace("/dashboard/billing?welcome=1");
    }
  }, [canUseProduct, router]);

  if (!canUseProduct) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Subscribe to use the editor and export videos.
        </p>
        <Button onClick={() => router.push("/dashboard/billing?welcome=1")}>
          View Launch Offer
        </Button>
      </div>
    );
  }

  return children;
}
