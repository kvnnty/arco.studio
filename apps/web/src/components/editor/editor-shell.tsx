"use client";

import type { ArcoProject, FocusRegion, Marker, StylePreset } from "@arco/project-schema";
import { isScreenshotPipelinePending, isScreenshotProject } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import { getTemplate } from "@arco/project-schema/templates";
import type { PlayerRef } from "@remotion/player";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { Settings2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BrandKit } from "@/lib/api/hooks/brand";
import {
  useChatMutation,
  useRefineProjectMutation,
  useRegenerateMarkerMutation,
} from "@/lib/api/hooks/ai";
import { useSyncProjectMutation } from "@/lib/api/hooks/projects";
import { useBillingStatus } from "@/lib/api/hooks/billing";
import { apiChatStream } from "@/lib/api/client";
import { ChatPanel } from "@/components/editor/chat-panel";
import { CustomizePanel } from "@/components/editor/customize-panel";
import { ExportDialog } from "@/components/editor/export-dialog";
import { PipelinePanel } from "@/components/editor/pipeline-panel";
import { SceneInspector } from "@/components/editor/scene-inspector";
import {
  ScreenshotSceneInspector,
  ScreenshotSceneStrip,
} from "@/components/editor/screenshot-scene-strip";
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
  mergeRefinedScenes,
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
import { getUrlHostname } from "@/lib/editor/chat-types";
import {
  createInitialPipelineState,
  type PipelineState,
} from "@/lib/editor/generation-pipeline";
import { generateVoiceForScreenshotProject } from "@/lib/editor/generate-voice-for-project";
import { getDefaultVoiceId } from "@arco/project-schema/voices";
import { spokenScriptFromScene } from "@arco/project-schema";

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
    initialSession.project.scenes?.[0]?.id ??
      initialSession.project.markers[0]?.id ??
      null,
  );
  const [cameraMode, setCameraMode] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState>(
    createInitialPipelineState(),
  );
  const [pipelineMarkers, setPipelineMarkers] = useState<Marker[]>([]);
  const [pipelineFailureMessage, setPipelineFailureMessage] = useState<
    string | null
  >(null);
  const brandKitRef = useRef<BrandKit | null>(null);
  const playerRef = useRef<PlayerRef>(null);
  const syncProject = useSyncProjectMutation();
  const refineProject = useRefineProjectMutation();
  const regenerateMarker = useRegenerateMarkerMutation();
  const chatMutation = useChatMutation();
  const { data: billing } = useBillingStatus();

  const project = session.project;
  const screenshotMode = isScreenshotProject(project);
  const scenes = project.scenes ?? [];
  const pipelineFailed =
    screenshotMode && project.pipelineStatus === "failed";
  const isAnalyzing =
    !pipelineFailed &&
    (session.journeyStep === "analyzing" ||
      (screenshotMode && isScreenshotPipelinePending(project)));
  /** Theater UI while generating, or after screenshot pipeline failure (retry). */
  const showPipelineTheater = isAnalyzing || pipelineFailed;
  const chatReady = session.journeyStep === "edit" && !isAnalyzing && !pipelineFailed;
  const productHostname = project.brief?.productUrl
    ? getUrlHostname(project.brief.productUrl)
    : undefined;

  const handlePipelineChange = useCallback(
    (nextPipeline: PipelineState, markers: Marker[]) => {
      setPipeline(nextPipeline);
      setPipelineMarkers(markers);
    },
    [],
  );

  const selectedMarker = useMemo(
    () => project.markers.find((marker) => marker.id === selectedId) ?? null,
    [project.markers, selectedId],
  );

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedId) ?? null,
    [scenes, selectedId],
  );

  const selectedSceneIndex = useMemo(() => {
    if (!selectedScene) return undefined;
    return scenes.findIndex((scene) => scene.id === selectedScene.id);
  }, [scenes, selectedScene]);

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
      syncProject.mutate(
        {
          projectId: session.projectId,
          project: session.project,
          platform: session.platform,
          recordingSrc: session.recordingUrl,
        },
        {
          onSuccess: () => setSaveStatus("saved"),
          onError: () => {
            setSaveStatus("error");
            toast.error("Could not save project. Check your connection and try again.");
          },
        },
      );
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [session, isAnalyzing, syncProject]);

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

  const handleBrandAnalyzed = useCallback((kit: BrandKit) => {
    brandKitRef.current = kit;
    const withBrand = mergeBrandIntoProject(session.project, kit);
    persist({ ...session, project: withBrand });
  }, [persist, session]);

  const handleScreenshotPipelinePatch = useCallback(
    (patched: ArcoProject) => {
      persist({
        ...session,
        project: patched,
        journeyStep: "analyzing",
      });
    },
    [persist, session],
  );

  const handleRetryScreenshotPipeline = useCallback(() => {
    setPipelineFailureMessage(null);
    setPipeline(createInitialPipelineState());
    setPipelineMarkers([]);
    const nextProject: ArcoProject = {
      ...session.project,
      pipelineStatus: "pending",
    };
    const nextSession: EditorSession = {
      ...session,
      project: nextProject,
      journeyStep: "analyzing",
    };
    persist(nextSession);
    syncProject.mutate({
      projectId: session.projectId,
      project: nextProject,
      platform: session.platform,
      recordingSrc: session.recordingUrl || "placeholder",
    });
  }, [persist, session, syncProject]);

  const handleScreenshotPipelineComplete = useCallback(
    (nextProject: ArcoProject) => {
      const failed = nextProject.pipelineStatus === "failed";
      const nextSession: EditorSession = {
        ...session,
        project: nextProject,
        journeyStep: failed ? "analyzing" : "edit",
      };

      syncProject.mutate({
        projectId: session.projectId,
        project: nextProject,
        platform: session.platform,
        recordingSrc: session.recordingUrl || "placeholder",
      });

      if (failed) {
        setPipelineFailureMessage(
          "Video generation failed. Retry the pipeline — you do not need to create a new project.",
        );
        toast.error(
          "Video generation failed. Use Retry pipeline to try again.",
        );
        persist(nextSession);
        return;
      }

      setPipelineFailureMessage(null);
      setSelectedId(nextProject.scenes?.[0]?.id ?? null);
      persist(nextSession);
    },
    [persist, session, syncProject],
  );

  const handleAnalysisComplete = useCallback(
    (result: DraftAnalysisResult) => {
      const kit = result.brandKit ?? brandKitRef.current;
      let baseProject = session.project;
      if (kit) {
        baseProject = mergeBrandIntoProject(baseProject, kit);
      }

      const template = session.project.template?.id
        ? getTemplate(session.project.template.id)
        : undefined;

      const suggestedPreset =
        template?.stylePreset ??
        toneToStylePreset(kit?.tone) ??
        result.stylePreset ??
        session.project.stylePreset ??
        "startup";

      let draftProject = buildDraftProject(
        baseProject,
        suggestedPreset,
        result.markers,
      );

      if (template) {
        draftProject = {
          ...draftProject,
          audio: { ...template.audio },
          template: { id: template.id, name: template.name },
        };
      }

      const nextSession: EditorSession = {
        ...session,
        project: draftProject,
        journeyStep: "edit",
      };

      syncProject.mutate({
        projectId: session.projectId,
        project: draftProject,
        platform: session.platform,
        recordingSrc: session.recordingUrl,
      });

      persist(nextSession);
      setSelectedId(draftProject.markers[0]?.id ?? null);
    },
    [persist, session, syncProject],
  );

  const executeChatAction = useCallback(
    async (action: Record<string, unknown>): Promise<ChatAction> => {
      const type = action.type as string;

      if (type === "refine_all_copy") {
        const instruction =
          (action.instruction as string | undefined) ?? "Improve the copy";

        if (screenshotMode) {
          const refined = await refineProject.mutateAsync({
            title: project.meta.title,
            instruction,
            intent: project.brief?.intent,
            productUrl: project.brief?.productUrl,
            scenes: (project.scenes ?? []).map((scene) => ({
              id: scene.id,
              headline: scene.headline,
              subheadline: scene.subheadline,
              voScript: scene.voScript,
            })),
          });
          return {
            type: "refine_all_scenes",
            scenes: mergeRefinedScenes(project, refined.scenes ?? []),
          };
        }

        const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
        const refined = await refineProject.mutateAsync({
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

      if (type === "regenerate_marker" || type === "regenerate_scene") {
        if (screenshotMode) {
          const sceneIndex =
            (action.markerIndex as number | undefined) ??
            (action.sceneIndex as number | undefined) ??
            selectedSceneIndex ??
            0;
          const scene = (project.scenes ?? [])[sceneIndex];
          if (!scene) {
            return { type: "reply", message: "Could not find that scene." };
          }
          const refined = await refineProject.mutateAsync({
            title: project.meta.title,
            instruction: "Regenerate this scene with stronger launch copy",
            intent: project.brief?.intent,
            productUrl: project.brief?.productUrl,
            scenes: [
              {
                id: scene.id,
                headline: scene.headline,
                subheadline: scene.subheadline,
                voScript: scene.voScript,
              },
            ],
          });
          const update = refined.scenes?.[0];
          return {
            type: "regenerate_scene",
            sceneIndex,
            headline: update?.headline ?? scene.headline,
            subheadline: update?.subheadline ?? scene.subheadline,
            voScript: update?.voScript ?? scene.voScript,
          };
        }

        const markerIndex =
          (action.markerIndex as number | undefined) ?? selectedMarkerIndex ?? 0;
        const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
        const marker = sorted[markerIndex];
        if (!marker) {
          return { type: "reply", message: "Could not find that scene." };
        }
        const result = await regenerateMarker.mutateAsync({
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

      if (type === "delete_marker" || type === "delete_scene") {
        if (screenshotMode) {
          return {
            type: "delete_scene",
            sceneIndex:
              (action.markerIndex as number | undefined) ??
              (action.sceneIndex as number | undefined) ??
              0,
          };
        }
        return {
          type: "delete_marker",
          markerIndex: (action.markerIndex as number) ?? 0,
        };
      }

      return { type: "reply", message: "Done." };
    },
    [
      project,
      regenerateMarker,
      refineProject,
      screenshotMode,
      selectedMarkerIndex,
      selectedSceneIndex,
    ],
  );

  const maybeRettsScenes = useCallback(
    async (nextProject: ArcoProject, previous: ArcoProject) => {
      const token = authSession?.accessToken;
      if (!token || !isScreenshotProject(nextProject)) return nextProject;
      if (nextProject.audio?.voiceEnabled === false) return nextProject;

      const prevById = new Map(
        (previous.scenes ?? []).map((scene) => [scene.id, scene]),
      );
      const needsVoice = (nextProject.scenes ?? []).some((scene) => {
        const prev = prevById.get(scene.id);
        const script = spokenScriptFromScene(scene);
        if (!script) return false;
        return (
          !scene.voAudioSrc ||
          (prev &&
            (prev.voScript !== scene.voScript ||
              prev.headline !== scene.headline))
        );
      });

      if (!needsVoice) return nextProject;

      const voiceId =
        nextProject.audio?.voiceId ?? getDefaultVoiceId();
      try {
        const scenes = await generateVoiceForScreenshotProject(
          token,
          nextProject,
          voiceId,
        );
        return { ...nextProject, scenes };
      } catch {
        toast.error("Could not update voice-over. Copy was saved.");
        return nextProject;
      }
    },
    [authSession?.accessToken],
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
          projectMode: project.projectMode,
          markers: screenshotMode
            ? []
            : sorted.map((marker) => ({
                id: marker.id,
                startMs: marker.startMs,
                durationMs: marker.durationMs,
                label: marker.label,
                callout: marker.callout,
              })),
          scenes: screenshotMode
            ? (project.scenes ?? []).map((scene) => ({
                id: scene.id,
                durationMs: scene.durationMs,
                headline: scene.headline,
                subheadline: scene.subheadline,
                voScript: scene.voScript,
              }))
            : undefined,
          selectedMarkerIndex: screenshotMode ? undefined : selectedMarkerIndex,
          selectedSceneIndex: screenshotMode ? selectedSceneIndex : undefined,
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
        chatResult = await chatMutation.mutateAsync(payload);
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

      const withVoice = await maybeRettsScenes(nextProject, project);
      updateProject(withVoice);
      return reply || chatResult.message;
    },
    [
      authSession?.accessToken,
      chatMutation,
      executeChatAction,
      maybeRettsScenes,
      project,
      screenshotMode,
      selectedMarkerIndex,
      selectedSceneIndex,
      session.projectId,
      updateProject,
    ],
  );

  const handleRegenerateScene = useCallback(async () => {
    if (screenshotMode) {
      if (selectedSceneIndex === undefined || selectedSceneIndex < 0) return;
      const chatAction = await executeChatAction({
        type: "regenerate_scene",
        sceneIndex: selectedSceneIndex,
      });
      const { project: nextProject } = applyChatAction(project, chatAction);
      const withVoice = await maybeRettsScenes(nextProject, project);
      updateProject(withVoice);
      return;
    }
    if (selectedMarkerIndex === undefined || selectedMarkerIndex < 0) return;
    const chatAction = await executeChatAction({
      type: "regenerate_marker",
      markerIndex: selectedMarkerIndex,
    });
    const { project: nextProject } = applyChatAction(project, chatAction);
    updateProject(nextProject);
  }, [
    executeChatAction,
    maybeRettsScenes,
    project,
    screenshotMode,
    selectedMarkerIndex,
    selectedSceneIndex,
    updateProject,
  ]);

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

  const reorderScenes = useCallback(
    (orderedIds: string[]) => {
      const sceneList = project.scenes ?? [];
      const byId = new Map(sceneList.map((scene) => [scene.id, scene]));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((scene): scene is NonNullable<typeof scene> => Boolean(scene));
      const remaining = sceneList.filter(
        (scene) => !orderedIds.includes(scene.id),
      );
      const nextScenes = [...reordered, ...remaining];
      const durationMs = nextScenes.reduce((sum, s) => sum + s.durationMs, 0);
      updateProject({
        ...project,
        scenes: nextScenes,
        recording: { ...project.recording, durationMs },
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
              disabled={isAnalyzing}
            />
            <div className="mt-0.5 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {session.platform}
              </Badge>
              <Badge variant="secondary">
                {project.meta.width}×{project.meta.height}
              </Badge>
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

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        <aside className="flex max-h-[42vh] min-h-0 flex-col border-b border-border lg:max-h-none lg:border-b-0 lg:border-r">
          <ChatPanel
            project={project}
            projectTitle={session.projectName}
            platform={session.platform}
            durationMs={project.recording.durationMs}
            intent={project.brief?.intent}
            productUrl={project.brief?.productUrl}
            templateId={project.template?.id}
            isAnalyzing={isAnalyzing}
            chatReady={chatReady}
            selectedMarker={selectedMarker}
            selectedSceneId={selectedScene?.id ?? null}
            pipelineMarkers={pipelineMarkers}
            pipelineFailed={pipelineFailed}
            onBrandAnalyzed={handleBrandAnalyzed}
            onAnalysisComplete={handleAnalysisComplete}
            onScreenshotPipelineComplete={handleScreenshotPipelineComplete}
            onScreenshotPipelinePatch={handleScreenshotPipelinePatch}
            onRetryScreenshotPipeline={
              screenshotMode ? handleRetryScreenshotPipeline : undefined
            }
            onPipelineChange={handlePipelineChange}
            onSendMessage={handleSendMessage}
            onRegenerateScene={handleRegenerateScene}
          />
        </aside>

        <main className="flex min-h-0 flex-col overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            {showPipelineTheater ? (
              <PipelinePanel
                pipeline={pipeline}
                isGenerating={isAnalyzing}
                failed={pipelineFailed}
                failureMessage={pipelineFailureMessage}
                onRetry={
                  pipelineFailed ? handleRetryScreenshotPipeline : undefined
                }
                markers={pipelineMarkers}
                productHostname={productHostname}
              />
            ) : (
              <>
                <VideoPreview
                  project={project}
                  playerRef={playerRef}
                  selectedMarker={selectedMarker}
                  screenshotMode={screenshotMode}
                  cameraMode={cameraMode}
                  onCameraModeChange={setCameraMode}
                  onFocusChange={updateFocus}
                />

            {chatReady && screenshotMode ? (
              <ScreenshotSceneStrip
                scenes={scenes}
                selectedId={selectedId}
                fps={project.meta.fps}
                playerRef={playerRef}
                onSelect={(id) => {
                  setSelectedId(id);
                  setInspectorOpen(true);
                }}
                onDelete={(id) => {
                  if (scenes.length <= 1) return;
                  const nextScenes = scenes.filter((s) => s.id !== id);
                  const durationMs = nextScenes.reduce(
                    (sum, s) => sum + s.durationMs,
                    0,
                  );
                  updateProject({
                    ...project,
                    scenes: nextScenes,
                    recording: { ...project.recording, durationMs },
                  });
                  setSelectedId(nextScenes[0]?.id ?? null);
                }}
                onReorder={reorderScenes}
              />
            ) : null}

            {chatReady && !screenshotMode ? (
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
                disabled={!selectedMarker && !selectedScene}
              >
                <Settings2 data-icon="inline-start" />
                Scene settings
              </Button>
            </div>
              </>
            )}
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
          {screenshotMode ? (
            <ScreenshotSceneInspector
              scene={selectedScene}
              project={project}
              onChange={() => undefined}
              onProjectUpdate={(next) => updateProject(next)}
              maxProjectDurationMs={billing?.maxProjectDurationMs ?? 0}
              plan={billing?.plan ?? null}
            />
          ) : (
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
          )}
        </SheetContent>
      </Sheet>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        projectId={session.projectId}
        projectTitle={project.meta.title}
      />
    </div>
  );
}
