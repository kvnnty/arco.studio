import Link from "next/link";
import { Plus } from "lucide-react";

import { listDashboardProjects } from "@/app/actions/projects";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsListClient } from "@/components/dashboard/projects-list-client";
import { Button } from "@/components/ui/button";

export default async function ProjectsPage() {
  const projects = await listDashboardProjects();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Projects"
        description="Upload a recording, let Arco add the motion, then export for launch."
      >
        <Button render={<Link href="/dashboard/projects/new" />}>
          <Plus data-icon="inline-start" />
          New project
        </Button>
      </PageHeader>

      <ProjectsListClient projects={projects} />
    </div>
  );
}
