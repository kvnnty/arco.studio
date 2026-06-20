"use client";

import Link from "next/link";
import { Download, Film, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { DashboardProject } from "@/lib/dashboard/projects";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectPoster } from "@/components/dashboard/project-poster";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProjectsListClientProps = {
  projects: DashboardProject[];
};

export function ProjectsListClient({ projects }: ProjectsListClientProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      project.title.toLowerCase().includes(q),
    );
  }, [projects, query]);

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="No projects yet"
        description="Create your first launch video — upload a screen recording and Arco handles the motion design."
        action={{
          label: "Create first project",
          href: "/dashboard/projects/new",
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No projects match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="h-full overflow-hidden rounded-2xl py-0 transition-colors hover:bg-muted/30">
                <div className="relative">
                  <ProjectPoster
                    title={project.title}
                    recordingSrc={project.recordingSrc}
                    exportUrl={project.latestExportUrl}
                    thumbnailUrl={project.thumbnailUrl}
                    compact
                    className="rounded-none rounded-t-2xl"
                  />
                  <div className="absolute right-2 top-2">
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  {project.status === "completed" && project.latestExportUrl ? (
                    <div className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm">
                      <Download className="size-3.5 text-foreground" />
                    </div>
                  ) : null}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base">
                    {project.title}
                  </CardTitle>
                  <CardDescription>
                    {project.markerCount} scenes · {project.exportFormat}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
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
