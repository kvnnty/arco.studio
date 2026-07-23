"use client";

import { Bell, HelpCircle, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import { useConsent } from "@/components/consent/consent-provider";
import {
  CreditUsageRing,
  ProfileUsageAvatar,
} from "@/components/dashboard/credit-usage-ring";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { ExportsBadge, WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/lib/api/hooks/auth";
import {
  formatCredits,
  getCreditUsage,
} from "@/lib/billing/credit-usage";

type AppTopbarProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  availableCredits?: number;
  planActive?: boolean;
  plan?: string | null;
  credits?: {
    included: number;
    purchased: number;
    available: number;
  } | null;
};

export function AppTopbar({
  user,
  availableCredits = 0,
  planActive = false,
  plan = null,
  credits = null,
}: AppTopbarProps) {
  const { openPreferences } = useConsent();
  const logout = useLogoutMutation();
  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AR";

  const usage = credits
    ? getCreditUsage(credits, plan)
    : { total: 0, remaining: availableCredits, used: 0, usedPercent: 0 };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <WorkspaceSwitcher name={user.name} email={user.email} />
      <div className="flex-1" />
      <ExportsBadge
        availableCredits={availableCredits}
        planActive={planActive}
      />
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon-sm"
        render={<Link href="/dashboard/notifications" />}
      >
        <Bell className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        render={<Link href="/dashboard/help" />}
      >
        <HelpCircle className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="group overflow-visible rounded-full p-0 hover:bg-muted/50 aria-expanded:[&_[data-slot=usage-pct]]:opacity-100"
              aria-label={
                planActive
                  ? `Account menu, ${usage.usedPercent}% credits used`
                  : "Account menu"
              }
            >
              <ProfileUsageAvatar
                initials={initials}
                usedPercent={usage.usedPercent}
                showUsage={planActive}
              />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CreditUsageRing
                  value={planActive ? usage.usedPercent : 0}
                  size={18}
                  strokeWidth={2}
                />
                <span className="text-sm font-medium text-foreground">
                  Balance
                </span>
              </div>
              <Button
                variant="outline"
                size="xs"
                className="h-7 rounded-lg px-2.5 text-xs"
                render={
                  <Link
                    href={
                      planActive
                        ? "/dashboard/billing"
                        : "/dashboard/billing?welcome=1"
                    }
                  />
                }
              >
                {planActive ? "Upgrade" : "Subscribe"}
              </Button>
            </div>
            <div className="mt-2.5 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatCredits(usage.total)} credits
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatCredits(usage.remaining)}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            <p className="font-medium text-foreground">
              {user.name ?? "Account"}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openPreferences}>
            Cookie settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => logout.mutate()}
            className="text-destructive"
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
