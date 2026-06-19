import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Download,
  MoreHorizontal,
  Play,
} from "lucide-react";

import { getDashboardProject } from "@/app/actions/projects";
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
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getDashboardProject(id);

  if (!project) notFound();

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
      label: "Motion applied",
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
      label: "Export ready",
      done: project.status === "completed",
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
          <Button variant="outline" size="icon-sm" disabled>
            <MoreHorizontal className="size-4" />
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>
              {project.recordingSrc
                ? "Open the editor to preview your recording with motion."
                : "Upload a recording in the editor to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-muted/30">
              <div className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
                  <Play className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  {project.status === "completed"
                    ? "Export ready"
                    : project.recordingSrc
                      ? "Preview in editor"
                      : "No recording yet"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {project.status === "processing"
                    ? "Processing your video…"
                    : project.status === "completed"
                      ? "Download your MP4 below"
                      : project.recordingSrc
                        ? "Continue editing in the editor"
                        : "Start in the editor"}
                </p>
              </div>
            </div>
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

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.latestExportUrl ? (
                <Button
                  className="w-full"
                  render={
                    <a
                      href={project.latestExportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    />
                  }
                >
                  <Download data-icon="inline-start" />
                  Download export
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  <Download data-icon="inline-start" />
                  Download export
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                render={<Link href={`/editor?projectId=${project.id}`} />}
              >
                Open in editor
              </Button>
            </CardContent>
          </Card>
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
                        : "border border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.done ? "✓" : i + 1}
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
