"use client";

import { useState } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { SessionsListSkeleton } from "@/components/dashboard/page-skeletons";
import { useDashboardTheme } from "@/components/providers/dashboard-theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogoutMutation } from "@/lib/api/hooks/auth";
import {
  useRevokeSessionMutation,
  useSessions,
  useUpdateProfileMutation,
} from "@/lib/api/hooks/settings";

type SettingsPageClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  const [name, setName] = useState(user.name ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const { theme, setTheme } = useDashboardTheme();

  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const updateProfile = useUpdateProfileMutation();
  const revokeSession = useRevokeSessionMutation();
  const logout = useLogoutMutation();

  function saveProfile() {
    setMessage(null);
    updateProfile.mutate(
      { name: name.trim() || undefined },
      {
        onSuccess: () => setMessage("Profile saved."),
        onError: () => setMessage("Could not save profile."),
      },
    );
  }

  function revoke(id: string) {
    revokeSession.mutate(id);
  }

  const pending =
    updateProfile.isPending || revokeSession.isPending || logout.isPending;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage your account, security, and preferences."
      />

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email ?? ""}
                  disabled
                />
              </div>
              {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
              <Button onClick={saveProfile} disabled={pending}>
                Save changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>
                Choose light or dark for the dashboard. Marketing pages stay in
                light mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Dark mode</p>
                  <p className="text-xs text-muted-foreground">
                    Currently using {theme === "dark" ? "dark" : "light"} theme
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                  aria-label="Toggle dark mode"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Active sessions</CardTitle>
              <CardDescription>
                Devices currently signed in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionsLoading ? (
                <SessionsListSkeleton />
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active sessions.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-4 rounded-xl border p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {session.deviceLabel ?? "Unknown device"}
                        {session.current ? " (this device)" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ipAddress ?? "Unknown IP"} · Last active{" "}
                        {new Date(session.lastUsedAt).toLocaleString()}
                      </p>
                    </div>
                    {!session.current ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revoke(session.id)}
                        disabled={pending}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </div>
                ))
              )}
              <Button
                variant="outline"
                onClick={() => logout.mutate()}
                disabled={pending}
              >
                Sign out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Email notifications</CardTitle>
              <CardDescription>Choose what updates you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  id: "processing",
                  label: "Processing updates",
                  description: "When exports complete or fail",
                  default: true,
                },
                {
                  id: "billing",
                  label: "Billing alerts",
                  description: "Low credits and payment issues",
                  default: true,
                },
                {
                  id: "product",
                  label: "Product updates",
                  description: "New features and improvements",
                  default: false,
                },
              ].map((item, index) => (
                <div key={item.id}>
                  {index > 0 ? <Separator className="mb-6" /> : null}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch defaultChecked={item.default} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
