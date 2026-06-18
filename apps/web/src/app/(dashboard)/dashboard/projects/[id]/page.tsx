import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Download,
  MoreHorizontal,
  Play,
} from "lucide-react";

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
import { getMockProject } from "@/lib/mock/data";
import { listProjectsForUser } from "@/lib/projects/store";
import { auth } from "@/auth";
import { mergeProjectsWithMock } from "@/lib/mock/data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const rawProjects = session?.user?.id
    ? await listProjectsForUser(session.user.id)
    : [];
  const projects = mergeProjectsWithMock(rawProjects);
  const project =
    projects.find((p) => p.id === id) ?? getMockProject(id);

  if (!project) notFound();

  const timelineSteps = [
    { label: "Recording uploaded", done: true, time: "Jun 10, 10:00 AM" },
    { label: "Scenes analyzed", done: true, time: "Jun 10, 10:02 AM" },
    { label: "Motion applied", done: project.status !== "draft", time: project.status !== "draft" ? "Jun 11, 2:30 PM" : undefined },
    { label: "Export ready", done: project.status === "completed", time: project.status === "completed" ? "Jun 11, 2:45 PM" : undefined },
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
              Video preview will appear here once processing completes.
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
                    ? "Preview available"
                    : "Preview unavailable"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {project.status === "processing"
                    ? "Processing your video…"
                    : project.status === "draft"
                      ? "Complete the wizard to generate"
                      : "Ready to download"}
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
              <Button className="w-full" disabled={project.status !== "completed"}>
                <Download data-icon="inline-start" />
                Download export
              </Button>
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
          <CardDescription>Processing progress for this project</CardDescription>
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
