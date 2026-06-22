"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { storeReferralCode } from "@/lib/referral";

export function ReferralCapture() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  useEffect(() => {
    if (referralCode) {
      storeReferralCode(referralCode);
    }
  }, [referralCode]);

  return null;
}
