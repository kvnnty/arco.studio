"use client";

import type { ExportQuality } from "@arco/project-schema";
import Link from "next/link";
import { Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ProjectStatus } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBillingStatus } from "@/lib/api/hooks/billing";
import { useCreateRenderMutation, useRenderJob } from "@/lib/api/hooks/renders";

const QUALITIES: ExportQuality[] = ["720p", "1080p", "4k"];

function defaultQualityForPlan(allowed: ExportQuality[] | undefined): ExportQuality {
  if (!allowed?.length) return "720p";
  if (allowed.includes("1080p")) return "1080p";
  return allowed[allowed.length - 1] ?? "720p";
}

type ProjectDetailActionsProps = {
  projectId: string;
  initialStatus: ProjectStatus;
  latestExportUrl: string | null;
  latestRenderJobId: string | null;
  latestRenderError: string | null;
};

export function ProjectDetailActions({
  projectId,
  initialStatus,
  latestExportUrl,
  latestRenderJobId,
  latestRenderError,
}: ProjectDetailActionsProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(
    initialStatus === "processing" ? latestRenderJobId : null,
  );
  const [status, setStatus] = useState(initialStatus);
  const [outputUrl, setOutputUrl] = useState(latestExportUrl);
  const [error, setError] = useState(latestRenderError);
  const [exporting, setExporting] = useState(false);
  const [stageLabel, setStageLabel] = useState<string | null>(null);
  const [quality, setQuality] = useState<ExportQuality>("1080p");

  const { data: billing } = useBillingStatus();
  const createRender = useCreateRenderMutation();
  const { data: job } = useRenderJob(
    jobId,
    !!jobId && (status === "processing" || exporting),
  );

  const allowedQualities = billing?.allowedExportQualities ?? [];

  useEffect(() => {
    if (!billing) return;
    setQuality(defaultQualityForPlan(billing.allowedExportQualities));
  }, [billing]);

  useEffect(() => {
    if (!job) return;

    if (
      job.status === "queued" ||
      job.status === "rendering" ||
      job.status === "processing" ||
      job.status === "uploading"
    ) {
      setStatus("processing");
      setStageLabel(
        job.status === "queued"
          ? "Queued for render…"
          : job.status === "uploading"
            ? "Uploading MP4…"
            : "Rendering video…",
      );
      return;
    }

    if (job.status === "completed" && job.outputUrl) {
      setStatus("completed");
      setOutputUrl(job.outputUrl);
      setExporting(false);
      router.refresh();
      return;
    }

    if (job.status === "failed") {
      const message = job.errorMessage ?? "Export failed.";
      setStatus("failed");
      setError(message);
      setExporting(false);
      toast.error(message);
      router.refresh();
    }
  }, [job, router]);

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const created = await createRender.mutateAsync({
        projectId,
        quality,
      });

      setJobId(created.id);

      if (created.status === "completed" && created.outputUrl) {
        setStatus("completed");
        setOutputUrl(created.outputUrl);
        setExporting(false);
        router.refresh();
        return;
      }

      if (created.status === "failed") {
        setStatus("failed");
        setError(created.errorMessage ?? "Export failed.");
        setExporting(false);
        return;
      }

      setStatus("processing");
    } catch (exportError) {
      setStatus("failed");
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Could not start export.",
      );
      setExporting(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = "export.mp4";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isProcessing = status === "processing" || exporting;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === "failed" && error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {isProcessing ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {stageLabel ?? "Exporting your video…"}
          </p>
        ) : null}

        <ToggleGroup
          value={[quality]}
          onValueChange={(value) => {
            const next = value[0] as ExportQuality | undefined;
            if (!next || !allowedQualities.includes(next)) return;
            setQuality(next);
          }}
          variant="outline"
          spacing={0}
          className="grid w-full grid-cols-3"
          disabled={isProcessing}
        >
          {QUALITIES.map((item) => (
            <ToggleGroupItem
              key={item}
              value={item}
              disabled={!allowedQualities.includes(item)}
              className="font-mono text-sm"
            >
              {item === "4k" ? "4K" : item}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {outputUrl ? (
          <Button className="w-full" onClick={handleDownload}>
            <Download data-icon="inline-start" />
            Download export
          </Button>
        ) : (
          <Button className="w-full" disabled={isProcessing}>
            <Download data-icon="inline-start" />
            Download export
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => void handleExport()}
          disabled={isProcessing || createRender.isPending}
        >
          <RefreshCw data-icon="inline-start" />
          {status === "failed" ? "Retry export" : "Export again"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          render={<Link href={`/editor?projectId=${projectId}`} />}
        >
          Open in editor
        </Button>
      </CardContent>
    </Card>
  );
}
