"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { stashReturnTo } from "@/lib/auth/return-to";

/** Persist ?redirect_url= from sign-in links before OAuth / magic-link flows. */
export function useCaptureReturnTo() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectUrl = searchParams.get("redirect_url");
    if (redirectUrl) stashReturnTo(redirectUrl);
  }, [searchParams]);
}
