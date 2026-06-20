"use client";

import type { Marker } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  createEditorProject,
  loadEditorProject,
  syncProject,
} from "@/app/actions/projects";
import { AnalysisScreen } from "@/components/editor/analysis-screen";
import { CreateProjectScreen } from "@/components/editor/create-project-screen";
import { DraftReadyScreen } from "@/components/editor/draft-ready-screen";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { UploadScreen } from "@/components/editor/upload-screen";
import { buildDraftProject } from "@/lib/editor/analyze-recording";
import { uploadProjectRecording } from "@/lib/editor/upload-project-recording";
import {
  loadEditorSession,
  saveEditorSession,
  type EditorSession,
  type JourneyStep,
  type ProjectPlatform,
} from "@/lib/editor/create-project";

export function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: authSession, status: authStatus } = useSession();

  const [session, setSession] = useState<EditorSession | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStage, setUploadStage] = useState<
    "uploading" | "processing" | null
  >(null);
  const [pendingUpload, setPendingUpload] = useState<{
    url: string;
    durationMs: number;
    width: number;
    height: number;
  } | null>(null);

  const projectIdParam = searchParams.get("projectId");

  useEffect(() => {
    if (authStatus === "loading") return;

    let cancelled = false;

    async function hydrate() {
      setLoadError(null);

      if (projectIdParam) {
        const loaded = await loadEditorProject(projectIdParam);
        if (cancelled) return;

        if (!loaded) {
          setLoadError("Project not found or you do not have access.");
          setSession(null);
          setReady(true);
          return;
        }

        saveEditorSession(loaded);
        setSession(loaded);
        if (loaded.journeyStep === "analyzing" && loaded.recordingUrl) {
          setPendingUpload({
            url: loaded.recordingUrl,
            durationMs: loaded.project.recording.durationMs,
            width: loaded.project.meta.width,
            height: loaded.project.meta.height,
          });
        }
        setReady(true);
        return;
      }

      const cached = loadEditorSession();
      if (cancelled) return;

      if (cached?.projectId) {
        router.replace(`/editor?projectId=${cached.projectId}`);
        return;
      }

      setSession(cached);
      setReady(true);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [authStatus, projectIdParam, router]);

  const goToStep = useCallback(
    (step: JourneyStep, nextSession: EditorSession) => {
      const updated = { ...nextSession, journeyStep: step };
      saveEditorSession(updated);
      setSession(updated);
    },
    [],
  );

  const handleCreateContinue = useCallback(
    async (name: string, platform: ProjectPlatform) => {
      setCreating(true);
      setLoadError(null);

      try {
        const { id } = await createEditorProject({ title: name, platform });
        router.replace(`/editor?projectId=${id}`);
      } catch {
        setLoadError("Could not create project. Please sign in and try again.");
      } finally {
        setCreating(false);
      }
    },
    [router],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!session) return;

      const accessToken = authSession?.accessToken;
      if (!accessToken) {
        throw new Error("You must be signed in to upload recordings.");
      }

      setUploadProgress(0);
      setUploadStage("uploading");

      const result = await uploadProjectRecording({
        accessToken,
        projectId: session.projectId,
        projectName: session.projectName,
        platform: session.platform,
        file,
        onUploadProgress: (percent) => setUploadProgress(percent),
      });

      setUploadStage("processing");
      setUploadProgress(null);

      const analyzingSession: EditorSession = {
        ...session,
        project: result.project,
        recordingUrl: result.recordingUrl,
        journeyStep: "analyzing",
      };

      setPendingUpload({
        url: result.recordingUrl,
        durationMs: result.durationMs,
        width: result.width,
        height: result.height,
      });
      setUploadStage(null);
      goToStep("analyzing", analyzingSession);
    },
    [session, authSession?.accessToken, goToStep],
  );

  const handleAnalysisComplete = useCallback(
    (result: { markers: Marker[]; stylePreset: EditorSession["project"]["stylePreset"] }) => {
      if (!session || !pendingUpload) return;

      const draftProject = buildDraftProject(
        {
          ...session.project,
          recording: {
            src: pendingUpload.url,
            durationMs: pendingUpload.durationMs,
          },
        },
        result.stylePreset ?? session.project.stylePreset ?? "startup",
        result.markers,
      );

      const draftSession: EditorSession = {
        ...session,
        project: draftProject,
        recordingUrl: pendingUpload.url,
        journeyStep: "draft",
      };

      void syncProject({
        projectId: session.projectId,
        project: draftProject,
        platform: session.platform,
        recordingSrc: pendingUpload.url,
      });

      goToStep("draft", draftSession);
    },
    [session, pendingUpload, goToStep],
  );

  const handleDraftContinue = useCallback(() => {
    if (!session) return;
    goToStep("edit", session);
  }, [session, goToStep]);

  const handleStyleOnDraft = useCallback(
    (preset: EditorSession["project"]["stylePreset"]) => {
      if (!session || !preset) return;
      const updated = applyStylePreset(session.project, preset);
      const nextSession = { ...session, project: updated };
      setSession(nextSession);
      saveEditorSession(nextSession);
      void syncProject({
        projectId: session.projectId,
        project: updated,
        platform: session.platform,
        recordingSrc: session.recordingUrl,
      });
    },
    [session],
  );

  if (!ready || authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-destructive">{loadError}</p>
        <button
          type="button"
          className="text-sm text-accent-foreground hover:underline"
          onClick={() => router.push("/editor")}
        >
          Start a new project
        </button>
      </div>
    );
  }

  if (!session || session.journeyStep === "create") {
    return (
      <CreateProjectScreen
        onContinue={handleCreateContinue}
        loading={creating}
      />
    );
  }

  if (session.journeyStep === "upload") {
    return (
      <UploadScreen
        projectName={session.projectName}
        onUpload={handleUpload}
        uploadProgress={uploadProgress}
        uploadStage={uploadStage}
      />
    );
  }

  if (session.journeyStep === "analyzing") {
    return (
      <AnalysisScreen
        projectTitle={session.projectName}
        platform={session.platform}
        durationMs={session.project.recording.durationMs}
        intent={session.project.brief?.intent}
        productUrl={session.project.brief?.productUrl}
        onComplete={handleAnalysisComplete}
      />
    );
  }

  if (session.journeyStep === "draft") {
    return (
      <DraftReadyScreen
        project={session.project}
        onStyleChange={handleStyleOnDraft}
        onContinue={handleDraftContinue}
      />
    );
  }

  return (
    <EditorWorkspace
      session={session}
      onSessionChange={setSession}
    />
  );
}
