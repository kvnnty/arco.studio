"use client";

import Link from "next/link";
import { Bell, HelpCircle } from "lucide-react";

import { ExportsBadge, WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signOutAction } from "@/app/actions/auth";
import { useConsent } from "@/components/consent/consent-provider";
import { LogOut, Settings, User } from "lucide-react";

type AppTopbarProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  exportsRemaining?: number;
  planActive?: boolean;
};

export function AppTopbar({
  user,
  exportsRemaining = 0,
  planActive = false,
}: AppTopbarProps) {
  const { openPreferences } = useConsent();
  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AR";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <WorkspaceSwitcher name={user.name} email={user.email} />
      <div className="flex-1" />
      <ExportsBadge remaining={exportsRemaining} planActive={planActive} />
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
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="font-medium">{user.name ?? "Account"}</p>
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
            onClick={() => void signOutAction()}
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
