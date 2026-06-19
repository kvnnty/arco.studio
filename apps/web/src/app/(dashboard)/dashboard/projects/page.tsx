import Link from "next/link";
import { Film, Plus } from "lucide-react";

import { listDashboardProjects } from "@/app/actions/projects";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProjectsPage() {
  const projects = await listDashboardProjects();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Projects"
        description="Upload a recording, let Arco add the motion, then export for launch."
      >
        <Button render={<Link href="/editor" />}>
          <Plus data-icon="inline-start" />
          New project
        </Button>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No projects yet"
          description="Create your first launch video — upload a screen recording and Arco handles the motion design."
          action={{
            label: "Create first project",
            href: "/editor",
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="h-full rounded-2xl transition-colors hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base">
                      {project.title}
                    </CardTitle>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <CardDescription>
                    {project.markerCount} scenes · {project.exportFormat}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {project.platform}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Updated{" "}
                      {new Date(project.updatedAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
