"use client";

import type { ExportFormat, StylePreset } from "@arco/project-schema";
import { STYLE_PRESETS } from "@arco/project-schema/style-presets";
import { getExportDimensions } from "@arco/project-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useCallback, useRef, useState } from "react";
import { Sparkles, Upload } from "lucide-react";

import { createEditorProject } from "@/app/actions/projects";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { uploadProjectRecording } from "@/lib/editor/upload-project-recording";
import { cn } from "@/lib/utils";

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "16:9", label: "16:9" },
  { id: "1:1", label: "1:1" },
  { id: "9:16", label: "9:16" },
];

const PRESETS = Object.values(STYLE_PRESETS);

const EXAMPLE_BRANDS = [
  { name: "Linear", url: "https://linear.app", hint: "Linear launch video" },
  { name: "Notion", url: "https://notion.so", hint: "Notion launch video" },
  { name: "Cursor", url: "https://cursor.com", hint: "Cursor launch video" },
  { name: "Framer", url: "https://framer.com", hint: "Framer launch video" },
] as const;

export function CreateProjectForm() {
  const router = useRouter();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("My launch video");
  const [productUrl, setProductUrl] = useState("");
  const [intent, setIntent] = useState("");
  const [stylePreset, setStylePreset] = useState<StylePreset>("startup");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("16:9");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((next: File) => {
    if (!next.type.startsWith("video/")) {
      setError("Please upload a video file (MP4, WebM, or MOV).");
      return;
    }
    setFile(next);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!file) {
      setError("Upload a screen recording to continue.");
      return;
    }

    const accessToken = session?.accessToken;
    if (!accessToken) {
      setError("You must be signed in to create a project.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { id } = await createEditorProject({
        title: name.trim() || "Untitled",
        platform: "web",
      });

      await uploadProjectRecording({
        accessToken,
        projectId: id,
        projectName: name.trim() || "Untitled",
        platform: "web",
        file,
        stylePreset,
        exportFormat,
        brief: {
          intent: intent.trim() || undefined,
          productUrl: productUrl.trim() || undefined,
        },
        onUploadProgress: setUploadProgress,
      });

      router.push(`/editor?projectId=${id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create project.",
      );
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="What would you like to create?"
        description="Upload your screen recording. Arco adds motion, titles, and export-ready polish."
      />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="project-name">Project name</FieldLabel>
          <FieldContent>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sploy launch video"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="product-url">Product URL (optional)</FieldLabel>
          <FieldContent>
            <Input
              id="product-url"
              type="url"
              value={productUrl}
              onChange={(event) => setProductUrl(event.target.value)}
              placeholder="https://yourproduct.com"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLE_BRANDS.map((brand) => (
                <Button
                  key={brand.url}
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => {
                    setProductUrl(brand.url);
                    if (name === "My launch video") {
                      setName(brand.hint);
                    }
                  }}
                >
                  {brand.name}
                </Button>
              ))}
            </div>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="brief">What is this video for?</FieldLabel>
          <FieldContent>
            <Textarea
              id="brief"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="Product Hunt launch, onboarding demo, feature announcement…"
              rows={3}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Style preset</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[stylePreset]}
              onValueChange={(value) => {
                const next = value[0] as StylePreset | undefined;
                if (next) setStylePreset(next);
              }}
              variant="outline"
              spacing={0}
              className="grid w-full grid-cols-2 sm:grid-cols-4"
            >
              {PRESETS.map((preset) => (
                <ToggleGroupItem
                  key={preset.id}
                  value={preset.id}
                  className="h-auto flex-col gap-1 py-3"
                >
                  <span className="text-sm font-medium">{preset.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Export format</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[exportFormat]}
              onValueChange={(value) => {
                const next = value[0] as ExportFormat | undefined;
                if (next) setExportFormat(next);
              }}
              variant="outline"
              spacing={0}
              className="grid w-full grid-cols-3"
            >
              {FORMATS.map((format) => (
                <ToggleGroupItem
                  key={format.id}
                  value={format.id}
                  className="font-mono"
                >
                  {format.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldDescription>
              {getExportDimensions(exportFormat).width}×
              {getExportDimensions(exportFormat).height} output
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Screen recording</FieldLabel>
          <FieldContent>
            <Card
              className={cn(
                "border-dashed transition-colors",
                dragging && "border-accent-foreground bg-accent/40",
              )}
            >
              <label
                className="flex cursor-pointer flex-col items-center justify-center px-6 py-12 text-center"
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  const dropped = event.dataTransfer.files[0];
                  if (dropped) handleFile(dropped);
                }}
              >
                <Upload className="size-8 text-muted-foreground" />
                <CardHeader className="px-0 pb-0 pt-4">
                  <CardTitle className="text-sm">
                    {file
                      ? file.name
                      : submitting && uploadProgress !== null
                        ? `Uploading… ${uploadProgress}%`
                        : "Drop your screen recording here"}
                  </CardTitle>
                  <CardDescription>MP4, WebM, or MOV · up to 500MB</CardDescription>
                </CardHeader>
                {submitting && uploadProgress !== null ? (
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
                  disabled={submitting}
                  onClick={(event) => {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  Choose file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  disabled={submitting}
                  onChange={(event) => {
                    const picked = event.target.files?.[0];
                    if (picked) handleFile(picked);
                  }}
                />
              </label>
            </Card>
          </FieldContent>
        </Field>
      </FieldGroup>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => void handleSubmit()}
          disabled={submitting || !file}
        >
          <Sparkles data-icon="inline-start" />
          {submitting ? "Creating…" : "Make video"}
        </Button>
        <Button variant="outline" render={<Link href="/dashboard/projects" />}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
