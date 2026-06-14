"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  CreditCard,
  Film,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  Library,
  Plus,
  Settings,
  Users,
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
import { MOCK_CREDITS } from "@/lib/mock/data";

const mainNav = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { title: "Assets", href: "/dashboard/assets", icon: Library },
];

const accountNav = [
  { title: "Usage", href: "/dashboard/usage", icon: Zap },
  { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { title: "Team", href: "/dashboard/team", icon: Users },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Help", href: "/dashboard/help", icon: HelpCircle },
];

function NavItem({
  item,
}: {
  item: (typeof mainNav)[number] & { exact?: boolean };
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
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
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
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
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
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Credits</span>
            <span className="font-semibold text-primary">
              {MOCK_CREDITS.balance}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${(MOCK_CREDITS.balance / MOCK_CREDITS.monthlyAllowance) * 100}%`,
              }}
            />
          </div>
          <Link
            href="/dashboard/usage"
            className="mt-2 block text-xs text-accent-foreground hover:underline"
          >
            Buy more credits
          </Link>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
