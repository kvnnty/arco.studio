"use client";

import { useConsent } from "@/components/consent/consent-provider";
import { cn } from "@/lib/utils";

type CookieSettingsTriggerProps = {
  className?: string;
  children?: React.ReactNode;
};

export function CookieSettingsTrigger({
  className,
  children = "Cookie settings",
}: CookieSettingsTriggerProps) {
  const { openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={cn(
        "cursor-pointer bg-transparent text-inherit transition-colors hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
