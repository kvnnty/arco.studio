"use client";

import type { ArcoProject, FocusRegion, Marker } from "@arco/project-schema";
import { getExportDimensions } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import type { PlayerRef } from "@remotion/player";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { syncProjectSummary } from "@/app/actions/projects";
import { ExportDialog } from "@/components/editor/export-dialog";
import { JourneyStepper } from "@/components/editor/journey-stepper";
import { SceneInspector } from "@/components/editor/scene-inspector";
import { SceneList } from "@/components/editor/scene-list";
import { StylePresetPicker } from "@/components/editor/style-preset-picker";
import { VideoPreview } from "@/components/editor/video-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  clearEditorSession,
  createDefaultMarker,
  saveEditorSession,
  type EditorSession,
} from "@/lib/editor/create-project";

type EditorWorkspaceProps = {
  session: EditorSession;
  onSessionChange: (session: EditorSession) => void;
};

export function EditorWorkspace({
  session: initialSession,
  onSessionChange,
}: EditorWorkspaceProps) {
  const [session, setSession] = useState(initialSession);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSession.project.markers[0]?.id ?? null,
  );
  const [cameraMode, setCameraMode] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  const project = session.project;
  const selectedMarker = useMemo(
    () => project.markers.find((marker) => marker.id === selectedId) ?? null,
    [project.markers, selectedId],
  );

  const persist = useCallback(
    (next: EditorSession) => {
      setSession(next);
      saveEditorSession(next);
      onSessionChange(next);
    },
    [onSessionChange],
  );

  useEffect(() => {
    saveEditorSession(session);
    void syncProjectSummary({
      id: session.projectId,
      title: session.project.meta.title,
      platform: session.platform,
      exportFormat: session.project.exportFormat ?? "16:9",
      markerCount: session.project.markers.length,
    });
  }, [session]);

  const updateProject = useCallback(
    (next: ArcoProject) => {
      persist({ ...session, project: next, journeyStep: "edit" });
    },
    [persist, session],
  );

  const updateMarker = useCallback(
    (marker: Marker) => {
      updateProject({
        ...project,
        markers: project.markers.map((item) =>
          item.id === marker.id ? marker : item,
        ),
      });
    },
    [project, updateProject],
  );

  const updateFocus = useCallback(
    (focus: FocusRegion) => {
      if (!selectedMarker) return;
      updateMarker({ ...selectedMarker, focus });
    },
    [selectedMarker, updateMarker],
  );

  const addSceneAtPlayhead = useCallback(() => {
    const fps = project.meta.fps;
    const frame = playerRef.current?.getCurrentFrame() ?? 0;
    const startMs = Math.round((frame / fps) * 1000);
    const marker = createDefaultMarker(startMs);

    updateProject({
      ...project,
      markers: [...project.markers, marker],
    });
    setSelectedId(marker.id);
  }, [project, updateProject]);

  const deleteMarker = useCallback(
    (id: string) => {
      const nextMarkers = project.markers.filter((marker) => marker.id !== id);
      updateProject({ ...project, markers: nextMarkers });
      if (selectedId === id) {
        setSelectedId(nextMarkers[0]?.id ?? null);
      }
    },
    [project, selectedId, updateProject],
  );

  const handleStylePreset = useCallback(
    (preset: ArcoProject["stylePreset"]) => {
      if (!preset) return;
      updateProject(applyStylePreset(project, preset));
    },
    [project, updateProject],
  );

  const handleExportFormat = useCallback(
    (format: ArcoProject["exportFormat"]) => {
      if (!format) return;
      const dims = getExportDimensions(format);
      updateProject({
        ...project,
        exportFormat: format,
        meta: { ...project.meta, width: dims.width, height: dims.height },
      });
    },
    [project, updateProject],
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="shrink-0">
            <Image
              src="/arcologo-black.svg"
              alt="Arco"
              width={410}
              height={85}
              className="h-7 w-24"
            />
          </Link>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <div className="hidden min-w-0 sm:block">
            <Input
              className="h-8 max-w-xs border-transparent bg-transparent px-0 font-medium shadow-none focus-visible:border-border"
              value={project.meta.title}
              onChange={(event) =>
                updateProject({
                  ...project,
                  meta: { ...project.meta, title: event.target.value },
                })
              }
            />
            <div className="mt-0.5 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {session.platform}
              </Badge>
              <Badge variant="secondary">{project.exportFormat ?? "16:9"}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearEditorSession();
              window.location.href = "/editor";
            }}
          >
            New project
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            Export
          </Button>
        </div>
      </header>
      <Separator />

      <div className="hidden border-b border-border px-4 py-2 sm:block">
        <JourneyStepper current="edit" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="hidden border-r border-border lg:block">
          <SceneList
            markers={project.markers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={addSceneAtPlayhead}
            onDelete={deleteMarker}
          />
        </aside>

        <main className="flex min-h-0 flex-col overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-5xl space-y-4">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <p className="text-sm font-medium">{project.meta.title}</p>
              <Button variant="outline" size="sm" onClick={addSceneAtPlayhead}>
                Add scene
              </Button>
            </div>
            <VideoPreview
              project={project}
              playerRef={playerRef}
              selectedMarker={selectedMarker}
              cameraMode={cameraMode}
              onCameraModeChange={setCameraMode}
              onFocusChange={updateFocus}
            />
            <StylePresetPicker
              compact
              value={project.stylePreset ?? "startup"}
              onChange={handleStylePreset}
            />
            <p className="text-center text-xs text-muted-foreground">
              Step 5–9: tweak scenes, click effects, camera focus, transitions, and style.
            </p>
          </div>
        </main>

        <aside className="border-t border-border lg:border-t-0 lg:border-l">
          <SceneInspector
            marker={selectedMarker}
            onChange={updateMarker}
            cameraMode={cameraMode}
          />
        </aside>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        format={project.exportFormat ?? "16:9"}
        onFormatChange={handleExportFormat}
        projectTitle={project.meta.title}
      />
    </div>
  );
}
