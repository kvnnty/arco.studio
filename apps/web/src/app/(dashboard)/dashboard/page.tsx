import Link from "next/link";
import { Film, FolderOpen, Plus, Upload, Video, Zap } from "lucide-react";

import { listDashboardProjects } from "@/app/actions/projects";
import { getServerSession } from "@/lib/auth/session";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectPoster } from "@/components/dashboard/project-poster";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildProjectActivity } from "@/lib/dashboard/activity";

export default async function DashboardHomePage() {
  const session = await getServerSession();
  const projects = await listDashboardProjects();
  const recentProjects = projects.slice(0, 3);
  const activity = buildProjectActivity(projects, 8);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title={`Welcome back${session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}`}
        description="Here's what's happening in your account."
      >
        <Button render={<Link href="/dashboard/projects/new" />}>
          <Plus data-icon="inline-start" />
          New project
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total projects"
          value={projects.length}
          icon={FolderOpen}
          description="in workspace"
        />
        <StatsCard
          title="Videos generated"
          value={projects.filter((p) => p.status === "completed").length}
          icon={Video}
          description="all time"
        />
        <StatsCard
          title="Ready to export"
          value={projects.filter((p) => p.status === "draft" && p.markerCount > 0).length}
          icon={Film}
          description="with scenes"
        />
        <StatsCard
          title="In progress"
          value={
            projects.filter((p) =>
              ["analyzing", "processing"].includes(p.status),
            ).length
          }
          icon={Zap}
          description="analyzing or exporting"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent projects</CardTitle>
              <CardDescription>Your latest work</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/projects" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No projects yet"
                description="Create your first launch video — upload a screen recording and Arco handles the motion design."
                action={{
                  label: "Create first project",
                  href: "/dashboard/projects/new",
                }}
                className="border-none shadow-none"
              />
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="hidden w-24 shrink-0 sm:block">
                      <ProjectPoster
                        title={project.title}
                        recordingSrc={project.recordingSrc}
                        exportUrl={project.latestExportUrl}
                        thumbnailUrl={project.thumbnailUrl}
                        compact
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.markerCount} scenes · {project.exportFormat}
                      </p>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Get started fast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              render={<Link href="/dashboard/projects/new" />}
            >
              <Plus data-icon="inline-start" />
              New project
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              render={<Link href="/dashboard/projects/new" />}
            >
              <Upload data-icon="inline-start" />
              Upload recording
            </Button>
          </CardContent>
        </Card>
      </div>

      {activity.length > 0 ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>From your projects and exports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <div>
                    <span className="font-medium">{item.action}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {item.target}
                    </span>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
