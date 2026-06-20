"use client";

import Link from "next/link";
import { Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { createRenderJob, getRenderJob } from "@/app/actions/renders";
import type { ProjectStatus } from "@/lib/mock/data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState(initialStatus);
  const [outputUrl, setOutputUrl] = useState(latestExportUrl);
  const [renderJobId, setRenderJobId] = useState(latestRenderJobId);
  const [error, setError] = useState(latestRenderError);
  const [exporting, setExporting] = useState(false);
  const [stageLabel, setStageLabel] = useState<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refreshPage = useCallback(() => {
    router.refresh();
  }, [router]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();
      setStatus("processing");
      setError(null);

      pollRef.current = setInterval(() => {
        void (async () => {
          try {
            const job = await getRenderJob(jobId);

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
              stopPolling();
              setStatus("completed");
              setOutputUrl(job.outputUrl);
              setExporting(false);
              refreshPage();
              return;
            }

            if (job.status === "failed") {
              stopPolling();
              setStatus("failed");
              const message = job.errorMessage ?? "Export failed.";
              setError(message);
              setExporting(false);
              toast.error(message);
              refreshPage();
            }
          } catch {
            stopPolling();
            setStatus("failed");
            setError("Could not check export status.");
            setExporting(false);
          }
        })();
      }, 2000);
    },
    [refreshPage, stopPolling],
  );

  useEffect(() => {
    if (
      renderJobId &&
      (initialStatus === "processing" || status === "processing")
    ) {
      pollJob(renderJobId);
    }
    return () => stopPolling();
  }, [initialStatus, pollJob, renderJobId, status, stopPolling]);

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const job = await createRenderJob({
        projectId,
        format: exportFormat,
      });

      setRenderJobId(job.id);

      if (job.status === "completed" && job.outputUrl) {
        setStatus("completed");
        setOutputUrl(job.outputUrl);
        setExporting(false);
        refreshPage();
        return;
      }

      if (job.status === "failed") {
        setStatus("failed");
        setError(job.errorMessage ?? "Export failed.");
        setExporting(false);
        return;
      }

      pollJob(job.id);
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
          onClick={handleExport}
          disabled={isProcessing}
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
