"use client";

import Link from "next/link";
import { useState } from "react";
import { Film, FolderOpen, Video, Zap } from "lucide-react";

import { BgmPickerModal } from "@/components/dashboard/bgm-picker-modal";
import { DashboardCreateHero } from "@/components/dashboard/dashboard-create-hero";
import { VoicePickerModal } from "@/components/dashboard/voice-picker-modal";
import { EmptyState } from "@/components/dashboard/empty-state";
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
import { useProjects } from "@/lib/api/hooks/projects";
import { buildProjectActivity } from "@/lib/dashboard/activity";
import type { MusicTrackId } from "@/lib/editor/music-tracks";
import { getMusicTrack } from "@/lib/editor/music-tracks";
import { getDefaultVoiceId } from "@arco/project-schema/voices";

type DashboardHomeClientProps = {
  userName?: string | null;
  initialTemplateId?: string | null;
};

export function DashboardHomeClient({
  userName,
  initialTemplateId = null,
}: DashboardHomeClientProps) {
  const { data: projects = [], isLoading } = useProjects();
  const [bgmOpen, setBgmOpen] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState<MusicTrackId | null>(
    "modern-saas",
  );
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    getDefaultVoiceId(),
  );
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recentProjects = projects.slice(0, 3);
  const activity = buildProjectActivity(projects, 8);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a launch video in one step — or pick up where you left off.
        </p>
      </div>

      <DashboardCreateHero
        initialTemplateId={initialTemplateId}
        selectedMusicId={selectedMusicId}
        onOpenBgm={() => setBgmOpen(true)}
        selectedVoiceId={selectedVoiceId}
        voiceEnabled={voiceEnabled}
        onOpenVoice={() => setVoiceOpen(true)}
      />

      <BgmPickerModal
        open={bgmOpen}
        onOpenChange={setBgmOpen}
        selectedId={selectedMusicId}
        onSelect={setSelectedMusicId}
      />

      <VoicePickerModal
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        selectedVoiceId={selectedVoiceId}
        voiceEnabled={voiceEnabled}
        onSelectVoice={setSelectedVoiceId}
        onToggleEnabled={setVoiceEnabled}
      />

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

      <Card className="rounded-2xl">
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
              description="Use the form above to create your first launch video."
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
