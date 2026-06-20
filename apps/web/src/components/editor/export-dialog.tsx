"use client";

import type { ExportFormat } from "@arco/project-schema";
import { Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { createRenderJob, getRenderJob } from "@/app/actions/renders";
import { getBillingStatusAction } from "@/app/actions/billing";
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
  | "rendering"
  | "uploading"
  | "completed"
  | "failed";

const PHASE_LABELS: Record<ExportPhase, string> = {
  idle: "Ready to export",
  queued: "Queued for render…",
  rendering: "Rendering video…",
  uploading: "Uploading MP4…",
  completed: "Export complete",
  failed: "Export failed",
};

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

            if (job.status === "rendering" || job.status === "processing") {
              setPhase("rendering");
              return;
            }

            if (job.status === "uploading") {
              setPhase("uploading");
              return;
            }

            if (job.status === "completed" && job.outputUrl) {
              stopPolling();
              setPhase("completed");
              setOutputUrl(job.outputUrl);
              toast.success("Export ready");
              return;
            }

            if (job.status === "failed") {
              stopPolling();
              setPhase("failed");
              const message = job.errorMessage ?? "Render failed.";
              setError(message);
              toast.error(message);
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
      const billing = await getBillingStatusAction();
      if (!billing.canUseProduct) {
        throw new Error("Subscribe to export videos.");
      }
      if (billing.exportsRemaining <= 0) {
        throw new Error("No exports remaining this period. Manage your plan in Billing.");
      }

      const job = await createRenderJob({ projectId, format });
      setPhase(
        job.status === "rendering" || job.status === "processing"
          ? "rendering"
          : job.status === "uploading"
            ? "uploading"
            : "queued",
      );

      if (job.status === "completed" && job.outputUrl) {
        setPhase("completed");
        setOutputUrl(job.outputUrl);
        toast.success("Export ready");
        return;
      }

      if (job.status === "failed") {
        const message = job.errorMessage ?? "Render failed.";
        setPhase("failed");
        setError(message);
        toast.error(message);
        return;
      }

      pollJob(job.id);
    } catch (exportError) {
      const message =
        exportError instanceof Error
          ? exportError.message
          : "Could not start export.";
      setPhase("failed");
      setError(message);
      toast.error(message);
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

  const isBusy =
    phase === "queued" || phase === "rendering" || phase === "uploading";

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

        {(phase === "queued" ||
          phase === "rendering" ||
          phase === "uploading") && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {PHASE_LABELS[phase]}
          </p>
        )}

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
              ? PHASE_LABELS[phase]
              : phase === "failed"
                ? "Retry export"
                : "Export MP4"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
