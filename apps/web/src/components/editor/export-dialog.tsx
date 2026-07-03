"use client";

import type { ExportQuality } from "@arco/project-schema";
import { Download } from "lucide-react";
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

  const isBusy =
    phase === "queued" || phase === "rendering" || phase === "uploading";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setJobId(null);
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
            Render <strong>{projectTitle}</strong> as MP4 at your project&apos;s
            native aspect ratio. Re-exports are unlimited — your plan limits
            active projects, not export retries.
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
                      {locked ? item.upgradeHint : "HD export"}
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

        {(phase === "queued" ||
          phase === "rendering" ||
          phase === "uploading") && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {`${PHASE_LABELS[phase]} (${qualityLabel(quality)})`}
          </p>
        )}

        {phase === "completed" && outputUrl ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Export ready at {qualityLabel(quality)}. Download your MP4 below.
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
            <Download data-icon="inline-start" />
            {isBusy
              ? PHASE_LABELS[phase]
              : phase === "failed"
                ? "Retry export"
                : `Export ${qualityLabel(quality)} MP4`}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
