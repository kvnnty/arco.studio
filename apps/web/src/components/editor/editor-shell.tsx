"use client";

import type { ArcoProject, FocusRegion, Marker, StylePreset } from "@arco/project-schema";
import { getExportDimensions } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import type { PlayerRef } from "@remotion/player";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { Settings2, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  chatProjectAction,
  refineProjectAction,
  regenerateMarkerAction,
} from "@/app/actions/ai";
import type { BrandKit } from "@/app/actions/brand";
import { syncProject } from "@/app/actions/projects";
import { apiChatStream } from "@/lib/api/client";
import { ChatPanel } from "@/components/editor/chat-panel";
import { CustomizePanel } from "@/components/editor/customize-panel";
import { ExportDialog } from "@/components/editor/export-dialog";
import { SceneInspector } from "@/components/editor/scene-inspector";
import { SceneThumbnailStrip } from "@/components/editor/scene-thumbnail-strip";
import { StylePresetPicker } from "@/components/editor/style-preset-picker";
import { VideoPreview } from "@/components/editor/video-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  applyChatAction,
  mergeRefinedMarkers,
  type ChatAction,
} from "@/lib/editor/apply-chat-action";
import { buildDraftProject, type DraftAnalysisResult } from "@/lib/editor/analyze-recording";
import {
  mergeBrandIntoProject,
  toneToStylePreset,
} from "@/lib/editor/brand-kit";
import {
  clearEditorSession,
  createDefaultMarker,
  saveEditorSession,
  type EditorSession,
} from "@/lib/editor/create-project";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type EditorShellProps = {
  session: EditorSession;
  onSessionChange: (session: EditorSession) => void;
};

export function EditorShell({
  session: initialSession,
  onSessionChange,
}: EditorShellProps) {
  const { session: authSession } = useAuth();
  const [session, setSession] = useState(initialSession);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSession.project.markers[0]?.id ?? null,
  );
  const [cameraMode, setCameraMode] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const brandKitRef = useRef<BrandKit | null>(null);
  const playerRef = useRef<PlayerRef>(null);

  const project = session.project;
  const isAnalyzing = session.journeyStep === "analyzing";
  const chatReady = session.journeyStep === "edit";

  const selectedMarker = useMemo(
    () => project.markers.find((marker) => marker.id === selectedId) ?? null,
    [project.markers, selectedId],
  );

  const selectedMarkerIndex = useMemo(() => {
    if (!selectedMarker) return undefined;
    const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
    return sorted.findIndex((m) => m.id === selectedMarker.id);
  }, [project.markers, selectedMarker]);

  const persist = useCallback(
    (next: EditorSession) => {
      setSession(next);
      saveEditorSession(next);
      onSessionChange(next);
    },
    [onSessionChange],
  );

  useEffect(() => {
    if (isAnalyzing) return;

    saveEditorSession(session);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveStatus("saving");

    saveTimerRef.current = setTimeout(() => {
      void syncProject({
        projectId: session.projectId,
        project: session.project,
        platform: session.platform,
        recordingSrc: session.recordingUrl,
      })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [session, isAnalyzing]);

  const updateProject = useCallback(
    (next: ArcoProject, step: EditorSession["journeyStep"] = "edit") => {
      persist({ ...session, project: next, journeyStep: step });
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
    setInspectorOpen(true);
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

  const handleBrandAnalyzed = useCallback((kit: BrandKit) => {
    brandKitRef.current = kit;
    const withBrand = mergeBrandIntoProject(session.project, kit);
    persist({ ...session, project: withBrand });
  }, [persist, session]);

  const handleAnalysisComplete = useCallback(
    (result: DraftAnalysisResult) => {
      const kit = result.brandKit ?? brandKitRef.current;
      let baseProject = session.project;
      if (kit) {
        baseProject = mergeBrandIntoProject(baseProject, kit);
      }

      const suggestedPreset =
        toneToStylePreset(kit?.tone) ??
        result.stylePreset ??
        session.project.stylePreset ??
        "startup";

      const draftProject = buildDraftProject(
        baseProject,
        suggestedPreset,
        result.markers,
      );

      const nextSession: EditorSession = {
        ...session,
        project: draftProject,
        journeyStep: "edit",
      };

      void syncProject({
        projectId: session.projectId,
        project: draftProject,
        platform: session.platform,
        recordingSrc: session.recordingUrl,
      });

      persist(nextSession);
      setSelectedId(draftProject.markers[0]?.id ?? null);
    },
    [persist, session],
  );

  const executeChatAction = useCallback(
    async (action: Record<string, unknown>): Promise<ChatAction> => {
      const type = action.type as string;

      if (type === "refine_all_copy") {
        const instruction =
          (action.instruction as string | undefined) ?? "Improve the copy";
        const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
        const refined = await refineProjectAction({
          title: project.meta.title,
          instruction,
          intent: project.brief?.intent,
          productUrl: project.brief?.productUrl,
          markers: sorted.map((marker) => ({
            label: marker.label,
            callout: marker.callout,
            startMs: marker.startMs,
          })),
        });
        return {
          type: "refine_all_copy",
          markers: mergeRefinedMarkers(project, refined.markers),
        };
      }

      if (type === "regenerate_marker") {
        const markerIndex =
          (action.markerIndex as number | undefined) ?? selectedMarkerIndex ?? 0;
        const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
        const marker = sorted[markerIndex];
        if (!marker) {
          return { type: "reply", message: "Could not find that scene." };
        }
        const result = await regenerateMarkerAction({
          title: project.meta.title,
          durationMs: project.recording.durationMs,
          markerIndex,
          markerCount: sorted.length,
          intent: project.brief?.intent,
          productUrl: project.brief?.productUrl,
          marker: {
            label: marker.label,
            callout: marker.callout,
            startMs: marker.startMs,
          },
        });
        return {
          type: "regenerate_marker",
          markerIndex,
          callout: result.callout,
          label: result.label,
        };
      }

      if (type === "update_style_preset") {
        return {
          type: "update_style_preset",
          stylePreset: (action.stylePreset as StylePreset) ?? "startup",
        };
      }

      if (type === "add_marker_at_ms") {
        return {
          type: "add_marker_at_ms",
          startMs: (action.startMs as number) ?? 0,
        };
      }

      if (type === "delete_marker") {
        return {
          type: "delete_marker",
          markerIndex: (action.markerIndex as number) ?? 0,
        };
      }

      return { type: "reply", message: "Done." };
    },
    [project, selectedMarkerIndex],
  );

  const handleSendMessage = useCallback(
    async (
      message: string,
      options?: { onStream?: (text: string) => void },
    ) => {
      const token = authSession?.accessToken;
      const fps = project.meta.fps;
      const frame = playerRef.current?.getCurrentFrame() ?? 0;
      const playheadMs = Math.round((frame / fps) * 1000);
      const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);

      const payload = {
        projectId: session.projectId,
        message,
        project: {
          title: project.meta.title,
          stylePreset: project.stylePreset,
          durationMs: project.recording.durationMs,
          intent: project.brief?.intent,
          productUrl: project.brief?.productUrl,
          markers: sorted.map((marker) => ({
            id: marker.id,
            startMs: marker.startMs,
            durationMs: marker.durationMs,
            label: marker.label,
            callout: marker.callout,
          })),
          selectedMarkerIndex,
          playheadMs,
        },
      };

      let chatResult: {
        action: Record<string, unknown>;
        message: string;
      };

      if (token) {
        let fullMessage = "";
        let action: Record<string, unknown> = { type: "reply" };

        await apiChatStream(token, payload, (chunk) => {
          if (chunk.error) {
            throw new Error(chunk.error);
          }
          if (chunk.token) {
            fullMessage += chunk.token;
            options?.onStream?.(fullMessage);
          }
          if (chunk.action) {
            action = chunk.action;
          }
        });

        chatResult = {
          action,
          message: fullMessage || "Done.",
        };
      } else {
        chatResult = await chatProjectAction(payload);
        options?.onStream?.(chatResult.message);
      }

      if (chatResult.action.type === "reply") {
        return chatResult.message;
      }

      const chatAction = await executeChatAction(chatResult.action);
      const { project: nextProject, message: reply } = applyChatAction(
        project,
        chatAction.type === "reply"
          ? { type: "reply", message: chatResult.message }
          : chatAction,
      );

      updateProject(nextProject);
      return reply || chatResult.message;
    },
    [
      authSession?.accessToken,
      executeChatAction,
      project,
      selectedMarkerIndex,
      session.projectId,
      updateProject,
    ],
  );

  const reorderMarkers = useCallback(
    (orderedIds: string[]) => {
      const byId = new Map(project.markers.map((marker) => [marker.id, marker]));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((marker): marker is Marker => Boolean(marker));
      const remaining = project.markers.filter(
        (marker) => !orderedIds.includes(marker.id),
      );
      updateProject({
        ...project,
        markers: [...reordered, ...remaining],
      });
    },
    [project, updateProject],
  );

  const handleRegenerateScene = useCallback(async () => {
    if (selectedMarkerIndex === undefined || selectedMarkerIndex < 0) return;
    const chatAction = await executeChatAction({
      type: "regenerate_marker",
      markerIndex: selectedMarkerIndex,
    });
    const { project: nextProject } = applyChatAction(project, chatAction);
    updateProject(nextProject);
  }, [executeChatAction, project, selectedMarkerIndex, updateProject]);

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
              disabled={isAnalyzing}
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
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Saved"
                : saveStatus === "error"
                  ? "Save failed"
                  : null}
          </span>
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
          <Button
            variant="outline"
            size="sm"
            disabled={!chatReady}
            onClick={() => setCustomizeOpen(true)}
          >
            <SlidersHorizontal data-icon="inline-start" />
            Customize
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!chatReady}
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
        </div>
      </header>
      <Separator />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <aside className="hidden min-h-0 border-r border-border lg:flex lg:flex-col">
          <ChatPanel
            projectTitle={session.projectName}
            platform={session.platform}
            durationMs={project.recording.durationMs}
            intent={project.brief?.intent}
            productUrl={project.brief?.productUrl}
            isAnalyzing={isAnalyzing}
            chatReady={chatReady}
            selectedMarker={selectedMarker}
            onBrandAnalyzed={handleBrandAnalyzed}
            onAnalysisComplete={handleAnalysisComplete}
            onSendMessage={handleSendMessage}
            onRegenerateScene={handleRegenerateScene}
          />
        </aside>

        <main className="flex min-h-0 flex-col overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <VideoPreview
              project={project}
              playerRef={playerRef}
              selectedMarker={selectedMarker}
              cameraMode={cameraMode}
              onCameraModeChange={setCameraMode}
              onFocusChange={updateFocus}
            />

            {chatReady ? (
              <SceneThumbnailStrip
                markers={project.markers}
                selectedId={selectedId}
                recordingUrl={session.recordingUrl}
                fps={project.meta.fps}
                playerRef={playerRef}
                onSelect={(id) => {
                  setSelectedId(id);
                  setInspectorOpen(true);
                }}
                onAdd={addSceneAtPlayhead}
                onDelete={deleteMarker}
                onReorder={reorderMarkers}
              />
            ) : null}

            <StylePresetPicker
              compact
              value={project.stylePreset ?? "startup"}
              onChange={handleStylePreset}
            />

            <div className="flex justify-end lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectorOpen(true)}
                disabled={!selectedMarker}
              >
                <Settings2 data-icon="inline-start" />
                Scene settings
              </Button>
            </div>
          </div>
        </main>
      </div>

      <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Customize</SheetTitle>
          </SheetHeader>
          <CustomizePanel
            project={project}
            onChange={(next) => updateProject(next)}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Scene settings</SheetTitle>
          </SheetHeader>
          <SceneInspector
            marker={selectedMarker}
            onChange={updateMarker}
            cameraMode={cameraMode}
            projectTitle={project.meta.title}
            durationMs={project.recording.durationMs}
            markerCount={project.markers.length}
            markerIndex={selectedMarkerIndex ?? 0}
            brief={project.brief}
          />
        </SheetContent>
      </Sheet>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        projectId={session.projectId}
        format={project.exportFormat ?? "16:9"}
        onFormatChange={handleExportFormat}
        projectTitle={project.meta.title}
      />
    </div>
  );
}
