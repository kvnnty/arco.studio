"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useRef, useState } from "react";
import { Sparkles, Upload } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { BriefInput } from "@/components/dashboard/brief-input";
import { ProductUrlInput } from "@/components/dashboard/product-url-input";
import { TemplateStrip } from "@/components/dashboard/template-strip";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createAndUploadProject } from "@/lib/editor/create-from-template";
import { cn } from "@/lib/utils";

export function CreateProjectForm() {
  const router = useRouter();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [intent, setIntent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const { projectId } = await createAndUploadProject({
        accessToken,
        title: name.trim() || undefined,
        platform: "web",
        templateId: selectedTemplateId ?? undefined,
        brief: {
          intent: intent.trim() || undefined,
          productUrl: productUrl.trim() || undefined,
        },
        file,
        onUploadProgress: setUploadProgress,
      });

      router.push(`/editor?projectId=${projectId}`);
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
          <FieldLabel htmlFor="project-name">Project name (optional)</FieldLabel>
          <FieldContent>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Auto-generated from URL if left blank"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="product-url">Product URL</FieldLabel>
          <FieldContent>
            <ProductUrlInput
              id="product-url"
              value={productUrl}
              onChange={setProductUrl}
              inputClassName="h-10"
            />
          </FieldContent>
        </Field>

        <BriefInput
          value={intent}
          onChange={setIntent}
          disabled={submitting}
          showLabel
        />

        <Field>
          <FieldLabel>Template</FieldLabel>
          <FieldContent>
            <TemplateStrip
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
            />
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
                  if (dropped?.type.startsWith("video/")) {
                    setFile(dropped);
                    setError(null);
                  }
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
                    if (picked) {
                      setFile(picked);
                      setError(null);
                    }
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
