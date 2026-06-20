"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

type WorkspaceSwitcherProps = {
  name?: string | null;
  email?: string | null;
};

export function WorkspaceSwitcher({ name, email }: WorkspaceSwitcherProps) {
  const label = name?.trim() || email?.split("@")[0] || "My workspace";
  const initial = label[0]?.toUpperCase() ?? "A";

  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex size-5 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
        {initial}
      </div>
      <span className="max-w-[140px] truncate text-sm font-medium">{label}</span>
    </div>
  );
}

export function ExportsBadge({
  remaining,
  planActive,
}: {
  remaining: number;
  planActive: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10"
      render={
        <Link href={planActive ? "/dashboard/usage" : "/dashboard/billing?welcome=1"} />
      }
    >
      <Zap className="size-3.5 text-primary" />
      {planActive ? (
        <>
          <span className="font-medium">{remaining}</span>
          <span className="text-muted-foreground">exports</span>
        </>
      ) : (
        <span className="font-medium">Subscribe</span>
      )}
    </Button>
  );
}
