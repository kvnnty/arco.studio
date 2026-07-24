"use client";

import type { ExportQuality } from "@arco/project-schema";
import { Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const QUALITIES: {
  id: ExportQuality;
  label: string;
  upgradeHint: string;
}[] = [
  { id: "720p", label: "720p", upgradeHint: "Included on all plans" },
  { id: "1080p", label: "1080p", upgradeHint: "Pro+" },
  { id: "4k", label: "4K", upgradeHint: "Studio" },
];

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
};

type ExportPhase =
  | "idle"
  | "processing"
  | "completed"
  | "failed";

function defaultQualityForPlan(
  allowed: ExportQuality[] | undefined,
): ExportQuality {
  if (!allowed?.length) return "720p";
  if (allowed.includes("1080p")) return "1080p";
  return allowed[allowed.length - 1] ?? "720p";
}

function qualityLabel(quality: ExportQuality): string {
  return quality === "4k" ? "4K" : quality;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: ExportDialogProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<ExportQuality>("1080p");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const queryClient = useQueryClient();
  const { data: billing } = useBillingStatus();
  const createRender = useCreateRenderMutation();
  const { data: job } = useRenderJob(jobId, !!jobId);

  const allowedQualities = billing?.allowedExportQualities ?? [];

  useEffect(() => {
    if (!billing) return;
    setQuality(defaultQualityForPlan(billing.allowedExportQualities));
  }, [billing]);

  useEffect(() => {
    if (phase !== "processing" || !startedAt) return;
    setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  useEffect(() => {
    if (!job) return;

    if (job.status === "completed" && job.outputUrl) {
      setPhase("completed");
      setOutputUrl(job.outputUrl);
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.usage });
      toast.success("Export ready — download your MP4");
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

    setPhase("processing");
  }, [job, queryClient]);

  const isQualityLocked = (id: ExportQuality) => !allowedQualities.includes(id);

  const lockedUpgradeMessage = useMemo(() => {
    if (quality === "4k") {
      return "4K export requires Studio ($59/mo).";
    }
    if (quality === "1080p") {
      return "1080p export requires Pro ($29/mo) or higher.";
    }
    return null;
  }, [quality]);

  const processingHint = useMemo(() => {
    if (elapsedSec < 15) {
      return "Usually ready in under a minute.";
    }
    if (elapsedSec < 60) {
      return "Still rendering — almost there.";
    }
    return "Taking longer than usual. Hang tight.";
  }, [elapsedSec]);

  const startRender = async (renderQuality: ExportQuality) => {
    if (!billing?.canUseProduct) {
      throw new Error("Subscribe to export videos.");
    }
    if (isQualityLocked(renderQuality)) {
      throw new Error(
        lockedUpgradeMessage ?? "Upgrade your plan to export at this resolution.",
      );
    }

    const created = await createRender.mutateAsync({
      projectId,
      quality: renderQuality,
    });
    setJobId(created.id);

    if (created.status === "completed" && created.outputUrl) {
      setPhase("completed");
      setOutputUrl(created.outputUrl);
      toast.success("Export ready — download your MP4");
      return;
    }

    if (created.status === "failed") {
      throw new Error(created.errorMessage ?? "Render failed.");
    }

    setPhase("processing");
  };

  const handleExport = async () => {
    setPhase("processing");
    setError(null);
    setOutputUrl(null);
    setJobId(null);
    setStartedAt(Date.now());
    setElapsedSec(0);

    try {
      await startRender(quality);
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

  const isBusy = phase === "processing";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setJobId(null);
          setPhase("idle");
          setError(null);
          setOutputUrl(null);
          setStartedAt(null);
          setElapsedSec(0);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export video</DialogTitle>
          <DialogDescription>
            Render <strong>{projectTitle}</strong> as MP4. Exports are included
            with your plan — credits are only used for AI and voice.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Resolution</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[quality]}
              onValueChange={(value) => {
                const next = value[0] as ExportQuality | undefined;
                if (!next || isQualityLocked(next)) return;
                setQuality(next);
              }}
              variant="outline"
              spacing={0}
              className="grid w-full grid-cols-3"
              disabled={isBusy || phase === "completed"}
            >
              {QUALITIES.map((item) => {
                const locked = isQualityLocked(item.id);
                return (
                  <ToggleGroupItem
                    key={item.id}
                    value={item.id}
                    disabled={locked}
                    className="h-auto flex-col gap-1 py-3"
                  >
                    <span className="font-mono text-sm">{item.label}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {locked ? item.upgradeHint : "Included"}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {allowedQualities.length > 0 &&
            allowedQualities.length < QUALITIES.length ? (
              <FieldDescription>
                <Link
                  href="/dashboard/billing"
                  className="text-primary hover:underline"
                >
                  Upgrade your plan
                </Link>{" "}
                for higher export resolutions.
              </FieldDescription>
            ) : null}
          </FieldContent>
        </Field>

        {phase === "processing" ? (
          <div className="flex items-start gap-3 rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium text-foreground">
                Processing {qualityLabel(quality)}… {formatElapsed(elapsedSec)}
              </p>
              <p>{processingHint}</p>
            </div>
          </div>
        ) : null}

        {phase === "completed" && outputUrl ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Ready at {qualityLabel(quality)}
            {startedAt
              ? ` · finished in ${formatElapsed(elapsedSec)}`
              : null}
            . Download your MP4 below.
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
            onClick={() => void handleExport()}
            disabled={isBusy || phase === "completed" || createRender.isPending}
          >
            {isBusy ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Download data-icon="inline-start" />
            )}
            {isBusy
              ? "Processing…"
              : phase === "failed"
                ? "Retry export"
                : `Export ${qualityLabel(quality)} MP4`}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
