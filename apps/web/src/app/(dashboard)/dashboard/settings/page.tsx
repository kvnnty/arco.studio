import { auth } from "@/auth";
import { SettingsPageClient } from "@/components/dashboard/settings-page-client";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <SettingsPageClient
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
    />
  );
}
