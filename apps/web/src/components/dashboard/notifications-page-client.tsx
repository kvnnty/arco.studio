"use client";

import Link from "next/link";
import { Bell, CreditCard, Film } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardNotification } from "@/lib/dashboard/types";
import { useProjects } from "@/lib/api/hooks/projects";
import { buildProjectNotifications } from "@/lib/dashboard/notifications";

const typeIcons = {
  system: Bell,
  processing: Film,
  billing: CreditCard,
};

export function NotificationsPageClient() {
  const { data: projects = [], isLoading } = useProjects();
  const notifications: DashboardNotification[] =
    buildProjectNotifications(projects);
  const unread = notifications.filter((n) => !n.read);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading notifications…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="Notifications"
        description="Export status and project updates."
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            {notifications.length > 0 ? (
              <Badge variant="secondary" className="ml-1.5">
                {notifications.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unread.length > 0 ? (
              <Badge variant="secondary" className="ml-1.5">
                {unread.length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="py-12 text-center">
                <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="font-medium">No notifications yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Export and processing updates will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              const content = (
                <Card
                  className={`rounded-2xl ${!notification.read ? "border-primary/20 bg-primary/5" : ""}`}
                >
                  <CardHeader className="flex flex-row items-start gap-4 pb-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">
                          {notification.title}
                        </CardTitle>
                        {!notification.read ? (
                          <span className="size-2 rounded-full bg-primary" />
                        ) : null}
                      </div>
                      <CardDescription className="mt-1">
                        {notification.description}
                      </CardDescription>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {notification.type}
                    </Badge>
                  </CardHeader>
                </Card>
              );

              return notification.href ? (
                <Link key={notification.id} href={notification.href}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6 space-y-3">
          {unread.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="py-12 text-center">
                <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="font-medium">All caught up</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No unread notifications.
                </p>
              </CardContent>
            </Card>
          ) : (
            unread.map((notification) => {
              const Icon = typeIcons[notification.type];
              return (
                <Link key={notification.id} href={notification.href ?? "#"}>
                  <Card className="rounded-2xl border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-start gap-4 pb-2">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm">
                          {notification.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {notification.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
