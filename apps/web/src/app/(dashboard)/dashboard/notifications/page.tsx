"use client";

import { Bell, CreditCard, Film } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_NOTIFICATIONS } from "@/lib/mock/data";

const typeIcons = {
  system: Bell,
  processing: Film,
  billing: CreditCard,
};

export default function NotificationsPage() {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="Notifications"
        description="Stay updated on your projects and account."
      >
        {unread.length > 0 ? (
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        ) : null}
      </PageHeader>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-1.5">
              {MOCK_NOTIFICATIONS.length}
            </Badge>
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
          {MOCK_NOTIFICATIONS.map((notification) => {
            const Icon = typeIcons[notification.type];
            return (
              <Card
                key={notification.id}
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
          })}
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
                <Card
                  key={notification.id}
                  className="rounded-2xl border-primary/20 bg-primary/5"
                >
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
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
