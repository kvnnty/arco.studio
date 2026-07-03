"use client";

import { AlertCircle, Upload } from "lucide-react";
import { useCallback, useState } from "react";

import { JourneyStepper } from "@/components/editor/journey-stepper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { useBillingStatus } from "@/lib/api/hooks/billing";
import { formatDurationLimitLabel } from "@/lib/billing/duration-limits";
import { cn } from "@/lib/utils";

type UploadScreenProps = {
  projectName: string;
  onUpload: (file: File) => Promise<void>;
  uploadProgress?: number | null;
  uploadStage?: "uploading" | "processing" | null;
};

export function UploadScreen({
  projectName,
  onUpload,
  uploadProgress = null,
  uploadStage = null,
}: UploadScreenProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: billing } = useBillingStatus();

  const durationHint =
    billing?.maxProjectDurationMs && billing.maxProjectDurationMs > 0
      ? `MP4, WebM, or MOV · up to 500MB · max ${formatDurationLimitLabel(billing.maxProjectDurationMs)} on your plan`
      : "MP4, WebM, or MOV · up to 500MB";

  const isBusy = loading || uploadStage !== null;

  const statusLabel =
    uploadStage === "uploading"
      ? uploadProgress !== null
        ? `Uploading… ${uploadProgress}%`
        : "Uploading to cloud…"
      : uploadStage === "processing"
        ? "Saving project…"
        : loading
          ? "Processing video…"
          : "Drop your screen recording here";

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a video file (MP4, WebM, or MOV).");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await onUpload(file);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Could not upload that video. Try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [onUpload],
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:px-8">
      <JourneyStepper current="upload" className="mb-8" />

      <Badge variant="outline" className="w-fit text-accent-foreground">
        Step 2 · Upload recording
      </Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em]">
        Upload your recording
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Drop <span className="text-foreground">{projectName}</span>&apos;s screen
        recording. Arco will analyze clicks, pauses, and navigation next.
      </p>

      <Field className="mt-10">
        <FieldLabel>Screen recording</FieldLabel>
        <FieldContent>
          <Card
            className={cn(
              "border-dashed transition-colors",
              dragging && "border-accent-foreground bg-accent/40",
            )}
          >
            <label
              className="flex cursor-pointer flex-col items-center justify-center px-6 py-16 text-center"
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) void handleFile(file);
              }}
            >
              <Upload className="size-8 text-muted-foreground" />
              <CardHeader className="px-0 pb-0 pt-4">
                <CardTitle className="text-sm">{statusLabel}</CardTitle>
                <CardDescription>{durationHint}</CardDescription>
              </CardHeader>
              {uploadStage === "uploading" && uploadProgress !== null ? (
                <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                disabled={isBusy}
              >
                Choose file
              </Button>
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
          </Card>
          <FieldDescription>
            Your recording is saved to cloud storage so you can return anytime.
          </FieldDescription>
        </FieldContent>
      </Field>

      {error ? (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
