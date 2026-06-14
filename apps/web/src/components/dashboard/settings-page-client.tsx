"use client";

import { Copy, Key, Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
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
type SettingsPageClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage your account, workspace, and preferences."
      />

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API keys</TabsTrigger>
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
                <Input id="name" defaultValue={user.name ?? ""} />
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
              <Button>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Workspace</CardTitle>
              <CardDescription>
                General settings for your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input id="workspace-name" defaultValue="Sploy" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-slug">URL slug</Label>
                <Input id="workspace-slug" defaultValue="sploy" disabled />
              </div>
              <Button>Save workspace</Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Default export settings</CardTitle>
              <CardDescription>
                Applied to new projects by default.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-format">Default format</Label>
                <Input id="default-format" defaultValue="16:9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-style">Default style preset</Label>
                <Input id="default-style" defaultValue="Minimal" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Email notifications</CardTitle>
              <CardDescription>
                Choose what updates you receive.
              </CardDescription>
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
                {
                  id: "marketing",
                  label: "Marketing emails",
                  description: "Tips, tutorials, and promotions",
                  default: false,
                },
              ].map((item, i) => (
                <div key={item.id}>
                  {i > 0 ? <Separator className="mb-6" /> : null}
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

        <TabsContent value="api" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">API keys</CardTitle>
                <CardDescription>
                  Programmatic access to Arco (coming soon).
                </CardDescription>
              </div>
              <Button size="sm" disabled>
                <Plus data-icon="inline-start" />
                Create key
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl border border-dashed p-6">
                <div className="flex items-center gap-3">
                  <Key className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">No API keys yet</p>
                    <p className="text-xs text-muted-foreground">
                      API access will be available in a future release.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/30 p-3">
                <code className="flex-1 truncate text-xs text-muted-foreground">
                  arco_sk_live_••••••••••••••••
                </code>
                <Button variant="ghost" size="icon-sm" disabled>
                  <Copy className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
