"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MoreHorizontal, Trash2 } from "lucide-react";

import { DeleteProjectTrigger } from "@/components/dashboard/delete-project-dialog";
import { ProjectDetailActions } from "@/components/dashboard/project-detail-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectDetailSkeleton } from "@/components/dashboard/page-skeletons";
import { ProjectPoster } from "@/components/dashboard/project-poster";
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
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/lib/api/hooks/projects";
import type { ProjectStatus } from "@/lib/dashboard/types";

function exportStepDone(status: ProjectStatus): boolean {
  return status === "completed";
}

function exportStepActive(status: ProjectStatus): boolean {
  return status === "processing";
}

export function ProjectDetailClient({ id }: { id: string }) {
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (isError || !project) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <p className="text-sm text-destructive">Project not found.</p>
        <Button variant="outline" render={<Link href="/dashboard/projects" />}>
          Back to projects
        </Button>
      </div>
    );
  }

  const timelineSteps = [
    {
      label: "Recording uploaded",
      done: Boolean(project.recordingSrc),
      time: project.recordingSrc
        ? new Date(project.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : undefined,
    },
    {
      label: "Scenes analyzed",
      done: project.markerCount > 0,
      time:
        project.markerCount > 0
          ? new Date(project.updatedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      label: "Export",
      done: exportStepDone(project.status),
      active: exportStepActive(project.status),
      failed: project.status === "failed",
      time:
        project.status === "completed"
          ? new Date(project.updatedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : undefined,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/dashboard/projects" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader
          title={project.title}
          description={`${project.markerCount} scenes · ${project.exportFormat}`}
          className="flex-1"
        >
          <ProjectStatusBadge status={project.status} />
          <DeleteProjectTrigger
            projectId={project.id}
            projectTitle={project.title}
          >
            {({ onClick }) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Project options"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onClick={onClick}>
                    <Trash2 className="size-4" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </DeleteProjectTrigger>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>
              {project.recordingSrc || project.latestExportUrl
                ? "Recording or latest export preview."
                : "Upload a recording in the editor to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectPoster
              title={project.title}
              recordingSrc={project.recordingSrc}
              exportUrl={project.latestExportUrl}
              thumbnailUrl={project.thumbnailUrl}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <Badge variant="outline" className="capitalize">
                  {project.platform}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span>{project.exportFormat}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scenes</span>
                <span>{project.markerCount}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {new Date(project.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <ProjectDetailActions
            projectId={project.id}
            initialStatus={project.status}
            latestExportUrl={project.latestExportUrl}
            latestRenderJobId={project.latestRenderJobId}
            latestRenderError={project.latestRenderError}
          />
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
          <CardDescription>Progress for this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {timelineSteps.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                      step.done
                        ? "bg-primary text-primary-foreground"
                        : step.failed
                          ? "border border-destructive bg-destructive/10 text-destructive"
                          : step.active
                            ? "border border-[#55b3ff] bg-[#55b3ff]/10 text-[#55b3ff]"
                            : "border border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.done ? "✓" : step.failed ? "!" : i + 1}
                  </div>
                  {i < timelineSteps.length - 1 ? (
                    <div
                      className={`w-px flex-1 min-h-8 ${
                        step.done ? "bg-primary/40" : "bg-border"
                      }`}
                    />
                  ) : null}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-medium">{step.label}</p>
                  {step.time ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {step.time}
                    </p>
                  ) : step.active ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      In progress…
                    </p>
                  ) : step.failed ? (
                    <p className="mt-0.5 text-xs text-destructive">
                      {project.latestRenderError ?? "Export failed"}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Pending
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
