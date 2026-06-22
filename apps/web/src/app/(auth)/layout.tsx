import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ReferralCapture } from "@/components/auth/referral-capture";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      {children}
    </AuthShell>
  );
}
