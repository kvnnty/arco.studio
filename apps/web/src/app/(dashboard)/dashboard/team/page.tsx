import { Users } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";

export default function TeamPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Team"
        description="Shared workspaces and member roles."
      />
      <EmptyState
        icon={Users}
        title="Team workspaces coming soon"
        description="Invite teammates, share brand kits, and pool exports. Solo Pro accounts work great until then."
        action={{
          label: "Back to projects",
          href: "/dashboard/projects",
        }}
      />
    </div>
  );
}
