"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  CreditCard,
  Film,
  FolderOpen,
  Gift,
  HelpCircle,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  Plus,
  Settings,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import type { BillingStatus } from "@/lib/api/client";

const mainNav = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { title: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { title: "Assets", href: "/dashboard/assets", icon: Library },
];

const accountNav = [
  { title: "Usage", href: "/dashboard/usage", icon: Zap },
  { title: "Referrals", href: "/dashboard/referrals", icon: Gift },
  { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Help", href: "/dashboard/help", icon: HelpCircle },
];

function NavItem({
  item,
}: {
  item: (typeof mainNav)[number] & { exact?: boolean; soon?: boolean };
}) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.href} />}
        tooltip={item.title}
        isActive={isActive}
      >
        <item.icon />
        <span>{item.title}</span>
        {item.soon ? (
          <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Soon
          </span>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ billing }: { billing?: BillingStatus | null }) {
  const isActive = billing?.canUseProduct ?? false;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <Image
                src="/arcologo-black.svg"
                alt="Arco"
                width={410}
                height={85}
                className="h-6 w-20 group-data-[collapsible=icon]:hidden"
              />
              <Film className="hidden size-4 group-data-[collapsible=icon]:block" />
              <span className="sr-only">Arco</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/projects/new" />}
                  tooltip="New project"
                  className="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                >
                  <Plus />
                  <span>New project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 group-data-[collapsible=icon]:hidden">
          {isActive ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Credits available</span>
                <span className="font-semibold text-primary">
                  {billing?.credits.available ?? 0}
                </span>
              </div>
              <Link
                href="/dashboard/billing"
                className="mt-2 block text-xs text-accent-foreground hover:underline"
              >
                Top up credits
              </Link>
              <Link
                href="/dashboard/referrals"
                className="mt-1 block text-xs text-muted-foreground hover:underline"
              >
                Invite friends, earn credits
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pro access</span>
                <span className="font-semibold text-primary">Required</span>
              </div>
              <Link
                href="/dashboard/billing?welcome=1"
                className="mt-2 block text-xs text-accent-foreground hover:underline"
              >
                Intro $9/mo or Pro $29/mo
              </Link>
            </>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
