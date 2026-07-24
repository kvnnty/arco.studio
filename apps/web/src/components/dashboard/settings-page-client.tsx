"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useState } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateProfileMutation } from "@/lib/api/hooks/settings";

type SettingsPageClientProps = {
  user: { name?: string | null; email?: string | null };
};

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  const [name, setName] = useState(user.name ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const { theme, setTheme } = useDashboardTheme();
  const updateProfile = useUpdateProfileMutation();
  const clerk = useClerk();
  const { user: clerkUser } = useUser();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage your Arco profile, account security, and preferences."
      />

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Account & security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Arco profile</CardTitle>
              <CardDescription>
                Product preferences live in Arco. Clerk owns your verified email
                and authentication settings.
              </CardDescription>
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
                <Label htmlFor="email">Verified email</Label>
                <Input id="email" value={user.email ?? ""} disabled />
              </div>
              {message ? (
                <p className="text-sm text-muted-foreground">{message}</p>
              ) : null}
              <Button
                disabled={updateProfile.isPending}
                onClick={() => {
                  setMessage(null);
                  updateProfile.mutate(
                    { name: name.trim() || undefined },
                    {
                      onSuccess: () => setMessage("Profile saved."),
                      onError: () => setMessage("Could not save profile."),
                    },
                  );
                }}
              >
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
                Choose light or dark for the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <span className="text-sm">Dark mode</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Sign-in methods</CardTitle>
                <CardDescription>
                  Your identity remains secured by Clerk while account controls
                  stay inside Arco.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Verified email</Label>
                  <Input
                    value={
                      clerkUser?.primaryEmailAddress?.emailAddress ??
                      user.email ??
                      ""
                    }
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Connected providers</Label>
                  <p className="text-sm text-muted-foreground">
                    {clerkUser?.externalAccounts.length
                      ? clerkUser.externalAccounts
                          .map((account) =>
                            account.provider.replace("oauth_", ""),
                          )
                          .join(", ")
                      : "Email magic link"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Sessions</CardTitle>
                <CardDescription>
                  End every active Clerk session, including this browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => void clerk.signOut({ redirectUrl: "/" })}
                >
                  Sign out everywhere
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
