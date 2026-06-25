"use client";

import type { ExportFormat, ExportQuality } from "@arco/project-schema";
import { Download, Layers } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { useQueryClient } from "@tanstack/react-query";

import { useBillingStatus } from "@/lib/api/hooks/billing";
import {
  useCreateRenderMutation,
  useRenderJob,
} from "@/lib/api/hooks/renders";
import { queryKeys } from "@/lib/api/query-keys";

const FORMATS: {
  id: ExportFormat;
  label: string;
  description: string;
}[] = [
  { id: "16:9", label: "16:9", description: "YouTube, website" },
  { id: "1:1", label: "1:1", description: "LinkedIn, PH" },
  { id: "9:16", label: "9:16", description: "TikTok, Reels" },
];

const SOCIAL_FORMATS: ExportFormat[] = ["16:9", "1:1", "9:16"];

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

function phaseFromStatus(status: string): ExportPhase {
  if (status === "rendering" || status === "processing") return "rendering";
  if (status === "uploading") return "uploading";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  return "queued";
}

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
  format,
  onFormatChange,
  projectTitle,
}: ExportDialogProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<ExportQuality>("1080p");
  const [batchProgress, setBatchProgress] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: billing } = useBillingStatus();
  const createRender = useCreateRenderMutation();
  const { data: job } = useRenderJob(jobId, !!jobId);

  useEffect(() => {
    if (!job) return;

    if (job.status === "completed" && job.outputUrl) {
      setPhase("completed");
      setOutputUrl(job.outputUrl);
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.usage });
      toast.success("Export ready");
      return;
    }

    if (job.status === "failed") {
      const message = job.errorMessage ?? "Render failed.";
      setPhase("failed");
      setError(message);
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.usage });
      toast.error(message);
      return;
    }

    setPhase(phaseFromStatus(job.status));
  }, [job, queryClient]);

  const isFormatLocked = (id: ExportFormat) =>
    !billing?.canExportAllFormats && id !== "16:9";

  const startRender = async (
    renderFormat: ExportFormat,
    renderQuality: ExportQuality,
  ) => {
    if (!billing?.canUseProduct) {
      throw new Error("Subscribe to export videos.");
    }
    if (isFormatLocked(renderFormat)) {
      throw new Error(
        "Intro plan exports 16:9 only. Upgrade to Pro for social formats.",
      );
    }
    if (renderQuality === "4k" && !billing.canExport4k) {
      throw new Error("4K export requires Studio ($59/mo).");
    }

    const created = await createRender.mutateAsync({
      projectId,
      format: renderFormat,
      quality: renderQuality,
    });
    setJobId(created.id);

    if (created.status === "completed" && created.outputUrl) {
      setPhase("completed");
      setOutputUrl(created.outputUrl);
      toast.success("Export ready");
      return;
    }

    if (created.status === "failed") {
      throw new Error(created.errorMessage ?? "Render failed.");
    }

    setPhase(phaseFromStatus(created.status));
  };

  const handleExport = async () => {
    setPhase("queued");
    setError(null);
    setOutputUrl(null);
    setJobId(null);
    setBatchProgress(null);

    try {
      await startRender(format, quality);
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

  const handleBatchSocial = async () => {
    setPhase("queued");
    setError(null);
    setOutputUrl(null);
    setJobId(null);

    try {
      if (!billing?.canBatchSocialExport) {
        throw new Error(
          "Social export pack requires Studio ($59/mo).",
        );
      }

      for (let i = 0; i < SOCIAL_FORMATS.length; i += 1) {
        const nextFormat = SOCIAL_FORMATS[i]!;
        setBatchProgress(
          `Rendering ${nextFormat} (${i + 1}/${SOCIAL_FORMATS.length})…`,
        );
        await startRender(nextFormat, quality);
        if (i < SOCIAL_FORMATS.length - 1) {
          setJobId(null);
          setPhase("queued");
        }
      }
      setBatchProgress(null);
      toast.success("Social export pack queued — check each format when ready.");
    } catch (exportError) {
      const message =
        exportError instanceof Error
          ? exportError.message
          : "Could not start batch export.";
      setPhase("failed");
      setError(message);
      setBatchProgress(null);
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

  const qualityLabel = quality === "4k" ? "4K" : "1080p";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setJobId(null);
          setPhase("idle");
          setError(null);
          setOutputUrl(null);
          setBatchProgress(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export video</DialogTitle>
          <DialogDescription>
            Render <strong>{projectTitle}</strong> as MP4. Re-exports are
            unlimited — your plan limits active projects, not export retries.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Format</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[format]}
              onValueChange={(value) => {
                const next = value[0] as ExportFormat | undefined;
                if (!next || isFormatLocked(next)) return;
                onFormatChange(next);
              }}
              variant="outline"
              spacing={0}
              className="grid w-full grid-cols-3"
              disabled={isBusy || phase === "completed"}
            >
              {FORMATS.map((item) => {
                const locked = isFormatLocked(item.id);
                return (
                  <ToggleGroupItem
                    key={item.id}
                    value={item.id}
                    disabled={locked}
                    className="h-auto flex-col gap-1 py-3"
                  >
                    <span className="font-mono text-sm">{item.label}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {locked ? "Pro+" : item.description}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {!billing?.canExportAllFormats ? (
              <FieldDescription>
                <Link href="/dashboard/billing" className="text-primary hover:underline">
                  Upgrade to Pro
                </Link>{" "}
                for 1:1 and 9:16 social formats.
              </FieldDescription>
            ) : null}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Resolution</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[quality]}
              onValueChange={(value) => {
                const next = value[0] as ExportQuality | undefined;
                if (!next) return;
                if (next === "4k" && !billing?.canExport4k) return;
                setQuality(next);
              }}
              variant="outline"
              className="grid w-full grid-cols-2"
              disabled={isBusy || phase === "completed"}
            >
              <ToggleGroupItem value="1080p">1080p</ToggleGroupItem>
              <ToggleGroupItem value="4k" disabled={!billing?.canExport4k}>
                4K {billing?.canExport4k ? "" : "(Studio)"}
              </ToggleGroupItem>
            </ToggleGroup>
          </FieldContent>
        </Field>

        {(phase === "queued" ||
          phase === "rendering" ||
          phase === "uploading") && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {batchProgress ?? `${PHASE_LABELS[phase]} (${qualityLabel})`}
          </p>
        )}

        {phase === "completed" && outputUrl ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Export ready at {qualityLabel}. Download your MP4 below.
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
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => void handleExport()}
              disabled={isBusy || phase === "completed" || createRender.isPending}
            >
              <Download data-icon="inline-start" />
              {isBusy
                ? PHASE_LABELS[phase]
                : phase === "failed"
                  ? "Retry export"
                  : `Export ${qualityLabel} MP4`}
            </Button>
            {billing?.canBatchSocialExport ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isBusy || createRender.isPending}
                onClick={() => void handleBatchSocial()}
              >
                <Layers data-icon="inline-start" />
                Export all social formats
              </Button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
