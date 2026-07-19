"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Download,
  Film,
  FolderOpen,
  MoreHorizontal,
  Search,
  Trash2,
  Video,
  Zap,
} from "lucide-react";

import { DeleteProjectTrigger } from "@/components/dashboard/delete-project-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectsListSkeleton } from "@/components/dashboard/page-skeletons";
import { ProjectPoster } from "@/components/dashboard/project-poster";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjects } from "@/lib/api/hooks/projects";

export function ProjectsListClient() {
  const [query, setQuery] = useState("");
  const { data: projects = [], isLoading } = useProjects();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      project.title.toLowerCase().includes(q),
    );
  }, [projects, query]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      generated: projects.filter((p) => p.status === "completed").length,
      ready: projects.filter((p) => p.status === "draft" && p.markerCount > 0)
        .length,
      inProgress: projects.filter((p) =>
        ["analyzing", "processing"].includes(p.status),
      ).length,
    }),
    [projects],
  );

  if (isLoading) {
    return <ProjectsListSkeleton />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="No projects yet"
        description="Create your first launch video — paste a URL, drop screenshots, and Arco runs the Motion pipeline."
        action={{
          label: "Create first project",
          href: "/dashboard",
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total projects"
          value={stats.total}
          icon={FolderOpen}
          description="in workspace"
          className="rounded-2xl p-4"
        />
        <StatsCard
          title="Videos generated"
          value={stats.generated}
          icon={Video}
          description="all time"
          className="rounded-2xl p-4"
        />
        <StatsCard
          title="Ready to export"
          value={stats.ready}
          icon={Film}
          description="with scenes"
          className="rounded-2xl p-4"
        />
        <StatsCard
          title="In progress"
          value={stats.inProgress}
          icon={Zap}
          description="analyzing or exporting"
          className="rounded-2xl p-4"
        />
      </div>

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
            <Card
              key={project.id}
              className="relative h-full overflow-hidden rounded-2xl py-0 transition-colors hover:bg-muted/30"
            >
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block"
              >
                <div className="relative">
                  <ProjectPoster
                    title={project.title}
                    recordingSrc={project.recordingSrc}
                    exportUrl={project.latestExportUrl}
                    thumbnailUrl={project.thumbnailUrl}
                    compact
                    className="rounded-none rounded-t-2xl"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
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
              </Link>
              <div className="absolute left-2 top-2">
                <DeleteProjectTrigger
                  projectId={project.id}
                  projectTitle={project.title}
                >
                  {({ onClick }) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            className="size-8 bg-background/90 shadow-sm"
                            aria-label={`Options for ${project.title}`}
                            onClick={(event) => event.preventDefault()}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={onClick}
                        >
                          <Trash2 className="size-4" />
                          Delete project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </DeleteProjectTrigger>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
