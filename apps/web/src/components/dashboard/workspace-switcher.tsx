"use client";

import Link from "next/link";
import { ChevronsUpDown, Plus, Zap } from "lucide-react";

import { MOCK_WORKSPACES } from "@/lib/mock/data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher() {
  const current = MOCK_WORKSPACES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-2 px-2">
            <div className="flex size-5 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              {current.name[0]}
            </div>
            <span className="max-w-[120px] truncate font-medium">
              {current.name}
            </span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCK_WORKSPACES.map((ws) => (
          <DropdownMenuItem key={ws.id}>
            <div className="flex size-5 items-center justify-center rounded-md bg-muted text-[10px] font-bold">
              {ws.name[0]}
            </div>
            {ws.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

/** @deprecated Use ExportsBadge */
export function CreditsBadge({ balance }: { balance: number }) {
  return <ExportsBadge remaining={balance} planActive={true} />;
}
