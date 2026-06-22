"use client";

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
import { useCreateRenderMutation, useRenderJob } from "@/lib/api/hooks/renders";

type ProjectDetailActionsProps = {
  projectId: string;
  exportFormat: string;
  initialStatus: ProjectStatus;
  latestExportUrl: string | null;
  latestRenderJobId: string | null;
  latestRenderError: string | null;
};

export function ProjectDetailActions({
  projectId,
  exportFormat,
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

  const createRender = useCreateRenderMutation();
  const { data: job } = useRenderJob(
    jobId,
    !!jobId && (status === "processing" || exporting),
  );

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
        format: exportFormat,
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
      <CardContent className="space-y-2">
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
