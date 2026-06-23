"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Paperclip, Sparkles, X } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { TemplateStrip } from "@/components/dashboard/template-strip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAndUploadProject,
  deriveProjectTitle,
} from "@/lib/editor/create-from-template";
import { cn } from "@/lib/utils";

type DashboardCreateHeroProps = {
  initialTemplateId?: string | null;
};

export function DashboardCreateHero({
  initialTemplateId = null,
}: DashboardCreateHeroProps) {
  const router = useRouter();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productUrl, setProductUrl] = useState("");
  const [brief, setBrief] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    initialTemplateId,
  );
  const [file, setFile] = useState<File | null>(null);
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

  const canSubmit =
    Boolean(file) && Boolean(productUrl.trim() || brief.trim()) && !submitting;

  const handleSubmit = async () => {
    if (!file) {
      setError("Attach a screen recording to continue.");
      return;
    }

    if (!productUrl.trim() && !brief.trim()) {
      setError("Enter your product URL or describe what you're creating.");
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
      const title = deriveProjectTitle({
        productUrl: productUrl.trim() || undefined,
        intent: brief.trim() || undefined,
      });

      const { projectId } = await createAndUploadProject({
        accessToken,
        title,
        platform: "web",
        templateId: selectedTemplateId ?? undefined,
        brief: {
          productUrl: productUrl.trim() || undefined,
          intent: brief.trim() || undefined,
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
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          What would you like to create?
        </CardTitle>
        <CardDescription>
          Paste your product URL, describe the video, attach a recording, and
          pick a template.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Input
            type="url"
            value={productUrl}
            onChange={(event) => setProductUrl(event.target.value)}
            placeholder="https://yourproduct.com"
            className="h-11"
          />
          <Textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="Product Hunt launch, onboarding demo, feature announcement…"
            rows={3}
            className="min-h-[88px] resize-none"
          />
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3",
            file ? "border-primary/40 bg-primary/5" : "border-border",
          )}
        >
          {file ? (
            <>
              <Paperclip className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={submitting}
                onClick={() => setFile(null)}
              >
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={submitting}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip data-icon="inline-start" />
                Attach screen recording
              </Button>
              <span className="text-xs text-muted-foreground">
                MP4, WebM, or MOV · up to 500MB
              </span>
            </>
          )}
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
        </div>

        {submitting && uploadProgress !== null ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading recording…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        <TemplateStrip
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
        />

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
        >
          <Sparkles data-icon="inline-start" />
          {submitting ? "Creating…" : "Make video"}
        </Button>
      </CardContent>
    </Card>
  );
}
