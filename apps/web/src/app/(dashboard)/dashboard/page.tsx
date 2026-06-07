import Link from "next/link";
import { Film, Plus } from "lucide-react";

import { auth } from "@/auth";
import { listProjectsForUser } from "@/lib/projects/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const projects = session?.user?.id
    ? await listProjectsForUser(session.user.id)
    : [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a recording, let Arco add the motion, then export for launch.
          </p>
        </div>
        <Button render={<Link href="/editor" />}>
          <Plus data-icon="inline-start" />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Film className="size-4 text-muted-foreground" />
              No projects yet
            </CardTitle>
            <CardDescription>
              Create your first launch video — upload a screen recording and Arco
              handles the motion design.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/editor" />}>Create first project</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href="/editor">
              <Card className="h-full transition-colors hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base">
                      {project.title}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {project.platform}
                    </Badge>
                  </div>
                  <CardDescription>
                    {project.markerCount} scenes · {project.exportFormat}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {new Date(project.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
