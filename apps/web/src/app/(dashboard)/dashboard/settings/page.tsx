import { getAuthenticatedUser } from "@/lib/auth/session";
import { SettingsPageClient } from "@/components/dashboard/settings-page-client";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  return (
    <SettingsPageClient
      user={{
        name: user?.name,
        email: user?.email,
      }}
    />
  );
}
