"use client";

import type { Marker } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import { useCallback, useEffect, useState } from "react";

import { AnalysisScreen } from "@/components/editor/analysis-screen";
import { CreateProjectScreen } from "@/components/editor/create-project-screen";
import { DraftReadyScreen } from "@/components/editor/draft-ready-screen";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { UploadScreen } from "@/components/editor/upload-screen";
import { buildDraftProject } from "@/lib/editor/analyze-recording";
import {
  createEmptyProject,
  createProjectId,
  getVideoMetadata,
  loadEditorSession,
  saveEditorSession,
  type EditorSession,
  type JourneyStep,
  type ProjectPlatform,
} from "@/lib/editor/create-project";

export function EditorPage() {
  const [session, setSession] = useState<EditorSession | null>(null);
  const [ready, setReady] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    file: File;
    url: string;
    durationMs: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setSession(loadEditorSession());
    setReady(true);
  }, []);

  const goToStep = useCallback(
    (step: JourneyStep, nextSession: EditorSession) => {
      const updated = { ...nextSession, journeyStep: step };
      saveEditorSession(updated);
      setSession(updated);
    },
    [],
  );

  const handleCreateContinue = useCallback(
    (name: string, platform: ProjectPlatform) => {
      const placeholder: EditorSession = {
        projectId: createProjectId(),
        project: createEmptyProject(name, "pending", 1000),
        platform,
        recordingUrl: "",
        journeyStep: "upload",
        projectName: name,
      };
      goToStep("upload", placeholder);
    },
    [goToStep],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!session) return;
      const recordingUrl = URL.createObjectURL(file);
      const metadata = await getVideoMetadata(file);
      const project = createEmptyProject(
        session.projectName,
        recordingUrl,
        metadata.durationMs,
        metadata.width,
        metadata.height,
      );

      const analyzingSession: EditorSession = {
        ...session,
        project,
        recordingUrl,
        journeyStep: "analyzing",
      };
      setPendingUpload({
        file,
        url: recordingUrl,
        ...metadata,
      });
      goToStep("analyzing", analyzingSession);
    },
    [session, goToStep],
  );

  const handleAnalysisComplete = useCallback(
    (markers: Marker[]) => {
      if (!session || !pendingUpload) return;

      const draftProject = buildDraftProject(
        {
          ...session.project,
          recording: {
            src: pendingUpload.url,
            durationMs: pendingUpload.durationMs,
          },
        },
        session.project.stylePreset ?? "startup",
      );

      draftProject.markers = markers;

      goToStep("draft", {
        ...session,
        project: draftProject,
        recordingUrl: pendingUpload.url,
      });
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
      setSession({ ...session, project: updated });
      saveEditorSession({ ...session, project: updated });
    },
    [session],
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session || session.journeyStep === "create") {
    return <CreateProjectScreen onContinue={handleCreateContinue} />;
  }

  if (session.journeyStep === "upload") {
    return (
      <UploadScreen
        projectName={session.projectName}
        onUpload={handleUpload}
      />
    );
  }

  if (session.journeyStep === "analyzing") {
    return (
      <AnalysisScreen
        durationMs={session.project.recording.durationMs}
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
