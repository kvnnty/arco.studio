import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account and workspace preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Name</span>
            <span>{session?.user?.name ?? "—"}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span>{session?.user?.email ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
          <CardDescription>Founding plan ships in Week 4.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stripe integration coming soon — export limits and team seats will
            live here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
