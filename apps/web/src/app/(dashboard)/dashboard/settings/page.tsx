import { getServerSession } from "@/lib/auth/session";
import { SettingsPageClient } from "@/components/dashboard/settings-page-client";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await getServerSession();

  return (
    <SettingsPageClient
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
    />
  );
}
