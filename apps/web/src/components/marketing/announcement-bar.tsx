import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { announcement } from "@/lib/marketing/site-config";

export function AnnouncementBar() {
  if (!announcement.enabled) return null;

  return (
    <div className="border-b border-[var(--marketing-border)] bg-[var(--marketing-surface)]">
      <div className="marketing-container flex items-center justify-center gap-2 py-2.5 text-center text-[13px]">
        <span className="text-[var(--marketing-muted)]">{announcement.message}</span>
        <Link
          href={announcement.href}
          className="inline-flex items-center gap-1 font-medium text-primary transition-opacity hover:opacity-80"
        >
          {announcement.linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
