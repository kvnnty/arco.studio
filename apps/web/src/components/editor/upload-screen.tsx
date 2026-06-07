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
import { cn } from "@/lib/utils";

type UploadScreenProps = {
  projectName: string;
  onUpload: (file: File) => Promise<void>;
};

export function UploadScreen({ projectName, onUpload }: UploadScreenProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        setError("Could not process that video. Try another file.");
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
                <CardTitle className="text-sm">
                  {loading ? "Processing video…" : "Drop sploy-demo.mp4 here"}
                </CardTitle>
                <CardDescription>
                  MP4, WebM, or MOV · or record directly in browser (coming soon)
                </CardDescription>
              </CardHeader>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                disabled={loading}
              >
                Choose file
              </Button>
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                disabled={loading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
          </Card>
          <FieldDescription>
            Your video stays in the browser until export.
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
