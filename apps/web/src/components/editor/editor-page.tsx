"use client";

import type { Marker } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  createEditorProject,
  loadEditorProject,
} from "@/app/actions/projects";
import { CreateProjectScreen } from "@/components/editor/create-project-screen";
import { EditorShell } from "@/components/editor/editor-shell";
import { UploadScreen } from "@/components/editor/upload-screen";
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

      setUploadStage(null);
      goToStep("analyzing", analyzingSession);
    },
    [session, authSession?.accessToken, goToStep],
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

  return (
    <EditorShell session={session} onSessionChange={setSession} />
  );
}
