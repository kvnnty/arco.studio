"use client";

import type { ExportFormat } from "@arco/project-schema";
import { Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { createRenderJob, getRenderJob } from "@/app/actions/renders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const FORMATS: { id: ExportFormat; label: string; description: string }[] = [
  { id: "16:9", label: "16:9", description: "YouTube, landing hero" },
  { id: "1:1", label: "1:1", description: "LinkedIn, Product Hunt" },
  { id: "9:16", label: "9:16", description: "TikTok, Reels, Stories" },
];

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  projectTitle: string;
};

type ExportPhase =
  | "idle"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
  format,
  onFormatChange,
  projectTitle,
}: ExportDialogProps) {
  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();

      pollRef.current = setInterval(() => {
        void (async () => {
          try {
            const job = await getRenderJob(jobId);

            if (job.status === "processing") {
              setPhase("processing");
              return;
            }

            if (job.status === "completed" && job.outputUrl) {
              stopPolling();
              setPhase("completed");
              setOutputUrl(job.outputUrl);
              return;
            }

            if (job.status === "failed") {
              stopPolling();
              setPhase("failed");
              setError(job.errorMessage ?? "Render failed.");
            }
          } catch {
            stopPolling();
            setPhase("failed");
            setError("Could not check render status.");
          }
        })();
      }, 2000);
    },
    [stopPolling],
  );

  const handleExport = async () => {
    setPhase("queued");
    setError(null);
    setOutputUrl(null);

    try {
      const job = await createRenderJob({ projectId, format });
      setPhase(job.status === "processing" ? "processing" : "queued");

      if (job.status === "completed" && job.outputUrl) {
        setPhase("completed");
        setOutputUrl(job.outputUrl);
        return;
      }

      if (job.status === "failed") {
        setPhase("failed");
        setError(job.errorMessage ?? "Render failed.");
        return;
      }

      pollJob(job.id);
      void getRenderJob(job.id).then((latest) => {
        if (latest.status === "processing") setPhase("processing");
        if (latest.status === "completed" && latest.outputUrl) {
          stopPolling();
          setPhase("completed");
          setOutputUrl(latest.outputUrl);
        }
        if (latest.status === "failed") {
          stopPolling();
          setPhase("failed");
          setError(latest.errorMessage ?? "Render failed.");
        }
      });
    } catch (exportError) {
      setPhase("failed");
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Could not start export.",
      );
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = `${projectTitle.replace(/\s+/g, "-").toLowerCase()}.mp4`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isBusy = phase === "queued" || phase === "processing";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          stopPolling();
          setPhase("idle");
          setError(null);
          setOutputUrl(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export video</DialogTitle>
          <DialogDescription>
            Render <strong>{projectTitle}</strong> as a 1080p MP4. This may take
            a minute depending on video length.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Format</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[format]}
              onValueChange={(value) => {
                const next = value[0] as ExportFormat | undefined;
                if (next) onFormatChange(next);
              }}
              variant="outline"
              spacing={0}
              className="grid w-full grid-cols-3"
              disabled={isBusy || phase === "completed"}
            >
              {FORMATS.map((item) => (
                <ToggleGroupItem
                  key={item.id}
                  value={item.id}
                  className="h-auto flex-col gap-1 py-3"
                >
                  <span className="font-mono text-sm">{item.label}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {item.description}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldDescription>
              Preview aspect ratio updates when you change format.
            </FieldDescription>
          </FieldContent>
        </Field>

        {phase === "queued" ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Queued — waiting for render worker…
          </p>
        ) : null}

        {phase === "processing" ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Rendering your video…
          </p>
        ) : null}

        {phase === "completed" && outputUrl ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Export ready. Download your MP4 below.
          </p>
        ) : null}

        {phase === "failed" && error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {phase === "completed" && outputUrl ? (
          <Button className="w-full" onClick={handleDownload}>
            <Download data-icon="inline-start" />
            Download MP4
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleExport}
            disabled={isBusy || phase === "completed"}
          >
            <Download data-icon="inline-start" />
            {isBusy
              ? phase === "processing"
                ? "Rendering…"
                : "Starting…"
              : phase === "failed"
                ? "Retry export"
                : "Export MP4"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
