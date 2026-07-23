"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  ArrowUp,
  ChevronDown,
  ImagePlus,
  LayoutTemplate,
  Mic,
  Music2,
  Paperclip,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { getTemplate, listTemplates } from "@arco/project-schema/templates";
import { getVoiceById } from "@arco/project-schema/voices";

import { useManagedAuth } from "@/hooks/use-managed-auth";
import {
  MAX_SCREENSHOTS,
  MIN_SCREENSHOTS,
} from "@/components/dashboard/screenshot-upload-zone";
import { LinkPreviewCard } from "@/components/dashboard/link-preview-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  createAndUploadProject,
  deriveProjectTitle,
} from "@/lib/editor/create-from-template";
import { createScreenshotProject } from "@/lib/editor/create-screenshot-project";
import type { MusicTrackId } from "@/lib/editor/music-tracks";
import { getMusicTrack } from "@/lib/editor/music-tracks";
import type { CustomMusicSelection } from "@/components/dashboard/custom-music-upload";
import {
  extractComposerUrl,
  parseComposerInput,
} from "@/lib/dashboard/parse-composer-input";
import { useLinkPreview } from "@/lib/hooks/use-link-preview";
import { VIDEO_TYPES } from "@/lib/marketing/video-types";
import { cn } from "@/lib/utils";

type CreateMode = "recording" | "screenshots";

type DashboardCreateHeroProps = {
  initialTemplateId?: string | null;
  selectedMusicId?: MusicTrackId | null;
  customMusic?: CustomMusicSelection | null;
  onOpenBgm?: () => void;
  selectedVoiceId?: string | null;
  voiceEnabled?: boolean;
  onOpenVoice?: () => void;
};

function ToolbarChip({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function dataTransferHasMedia(dataTransfer: DataTransfer | null) {
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.types).some(
    (type) => type === "Files" || type.startsWith("image/"),
  );
}

function filesFromClipboard(clipboard: DataTransfer | null): File[] {
  if (!clipboard) return [];

  const fromFiles = Array.from(clipboard.files ?? []).filter(
    (item) =>
      item.type.startsWith("image/") || item.type.startsWith("video/"),
  );
  if (fromFiles.length > 0) return fromFiles;

  const fromItems: File[] = [];
  for (const item of Array.from(clipboard.items ?? [])) {
    if (item.kind !== "file") continue;
    if (!item.type.startsWith("image/") && !item.type.startsWith("video/")) {
      continue;
    }
    const file = item.getAsFile();
    if (file) fromItems.push(file);
  }
  return fromItems;
}

export function DashboardCreateHero({
  initialTemplateId = null,
  selectedMusicId = null,
  customMusic = null,
  onOpenBgm,
  selectedVoiceId = null,
  voiceEnabled = true,
  onOpenVoice,
}: DashboardCreateHeroProps) {
  const router = useRouter();
  const { session } = useManagedAuth();
  const composerId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [mode, setMode] = useState<CreateMode>("screenshots");
  const [prompt, setPrompt] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    initialTemplateId,
  );
  const [file, setFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragDepthRef = useRef(0);

  const detectedUrl = extractComposerUrl(prompt);
  const { state: previewState, preview } = useLinkPreview(detectedUrl ?? "");

  useEffect(() => {
    const urls = screenshotFiles.map((f) => URL.createObjectURL(f));
    setScreenshotUrls(urls);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [screenshotFiles]);

  const templates = listTemplates();
  const selectedTemplate = selectedTemplateId
    ? getTemplate(selectedTemplateId)
    : null;
  const voice = getVoiceById(selectedVoiceId ?? undefined);
  const musicLabel = customMusic
    ? customMusic.filename
    : selectedMusicId
      ? (getMusicTrack(selectedMusicId)?.label ?? selectedMusicId)
      : null;

  const parsed = parseComposerInput(prompt);
  const hasBrief = Boolean(parsed.productUrl || parsed.brief);

  const canSubmitRecording =
    Boolean(file) && hasBrief && !submitting;
  const canSubmitScreenshots =
    screenshotFiles.length >= MIN_SCREENSHOTS && hasBrief && !submitting;
  const canSubmit =
    mode === "recording" ? canSubmitRecording : canSubmitScreenshots;

  const handleFile = useCallback((next: File) => {
    if (!next.type.startsWith("video/")) {
      setError("Please upload a video file (MP4, WebM, or MOV).");
      return;
    }
    setMode("recording");
    setFile(next);
    setScreenshotFiles([]);
    setError(null);
  }, []);

  const handleScreenshots = useCallback((picked: FileList | File[] | null) => {
    if (!picked) return;
    const list = Array.isArray(picked) ? picked : Array.from(picked);
    if (!list.length) return;
    setMode("screenshots");
    setFile(null);
    setScreenshotFiles((prev) => {
      const next = [...prev];
      for (const item of list) {
        if (!item.type.startsWith("image/")) continue;
        if (next.length >= MAX_SCREENSHOTS) break;
        next.push(item);
      }
      return next;
    });
    setError(null);
  }, []);

  const ingestMediaFiles = useCallback(
    (files: File[]) => {
      if (submitting || files.length === 0) return false;

      const images = files.filter((item) => item.type.startsWith("image/"));
      const videos = files.filter((item) => item.type.startsWith("video/"));

      if (images.length > 0) {
        handleScreenshots(images);
        return true;
      }

      if (videos[0]) {
        handleFile(videos[0]);
        return true;
      }

      return false;
    },
    [handleFile, handleScreenshots, submitting],
  );

  const resetDragging = useCallback(() => {
    dragDepthRef.current = 0;
    setDragging(false);
  }, []);

  const submit = async () => {
    const { productUrl, brief } = parseComposerInput(prompt);

    if (!productUrl && !brief) {
      setError("Paste a product URL or describe what you're creating.");
      return;
    }

    const accessToken = session?.accessToken;
    if (!accessToken) {
      setError("You must be signed in to create a project.");
      return;
    }

    if (mode === "recording" && !file) {
      setError("Attach a screen recording to continue.");
      return;
    }

    if (mode === "screenshots" && screenshotFiles.length < MIN_SCREENSHOTS) {
      setError(`Upload at least ${MIN_SCREENSHOTS} screenshots.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      const title = deriveProjectTitle({
        productUrl,
        intent: brief,
      });

      const briefPayload = {
        productUrl,
        intent: brief,
      };

      const { projectId } =
        mode === "recording" && file
          ? await createAndUploadProject({
              accessToken,
              title,
              platform: "web",
              templateId: selectedTemplateId ?? undefined,
              brief: briefPayload,
              musicId: selectedMusicId,
              customMusicSrc: customMusic?.url,
              file,
              onUploadProgress: setUploadProgress,
            })
          : await createScreenshotProject({
              accessToken,
              title,
              platform: "web",
              templateId: selectedTemplateId ?? undefined,
              brief: briefPayload,
              musicId: selectedMusicId,
              customMusicSrc: customMusic?.url,
              voiceId: voiceEnabled ? selectedVoiceId ?? undefined : undefined,
              voiceEnabled,
              files: screenshotFiles.slice(0, MAX_SCREENSHOTS),
              onUploadProgress: setUploadProgress,
            });

      router.push(`/editor?projectId=${projectId}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Could not create project.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Brief your AI motion designer
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste a product URL, describe the launch, then drop or paste
          screenshots. Recording is optional for deeper demos.
        </p>
      </div>

      <div
        className={cn(
          "relative rounded-[28px] border bg-card/80 shadow-sm transition-[box-shadow,border-color,background-color]",
          dragging
            ? "border-primary/50 bg-primary/5 shadow-md ring-3 ring-primary/20"
            : focused
              ? "border-ring/40 bg-card shadow-md ring-3 ring-ring/20"
              : "border-border/80",
        )}
        onDragEnter={(event) => {
          if (submitting || !dataTransferHasMedia(event.dataTransfer)) return;
          event.preventDefault();
          dragDepthRef.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          if (submitting || !dataTransferHasMedia(event.dataTransfer)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(event) => {
          if (!dragging) return;
          event.preventDefault();
          dragDepthRef.current -= 1;
          if (dragDepthRef.current <= 0) resetDragging();
        }}
        onDrop={(event) => {
          if (submitting) return;
          event.preventDefault();
          resetDragging();
          const dropped = Array.from(event.dataTransfer.files ?? []);
          if (!ingestMediaFiles(dropped)) {
            setError("Drop image screenshots or a screen recording.");
          }
        }}
        onPaste={(event) => {
          if (submitting) return;
          const media = filesFromClipboard(event.clipboardData);
          if (media.length === 0) return;
          event.preventDefault();
          ingestMediaFiles(media);
        }}
      >
        {dragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-primary/5">
            <div className="rounded-full border border-primary/30 bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
              Drop screenshots or a recording
            </div>
          </div>
        ) : null}

        <label htmlFor={composerId} className="sr-only">
          Product URL or video brief
        </label>
        <Textarea
          ref={textareaRef}
          id={composerId}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              if (canSubmit) void submit();
            }
          }}
          disabled={submitting}
          placeholder="https://yourproduct.com - 25s Product Hunt launch for founders. Premium, clear, CTA: Join the waitlist."
          rows={3}
          className="min-h-[96px] rounded-[28px] border-0 bg-transparent px-4 pb-2 pt-4 text-base shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-sm"
        />

        {detectedUrl ? (
          <div className="px-3 pb-2">
            <LinkPreviewCard
              url={detectedUrl}
              state={previewState}
              preview={preview}
            />
          </div>
        ) : null}

        {mode === "screenshots" && screenshotFiles.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto px-3 pb-2">
            {screenshotUrls.map((url, index) => (
              <div
                key={`${screenshotFiles[index]?.name}-${index}`}
                className="group relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setScreenshotFiles((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-4" />
                </button>
                <span className="absolute left-1 top-1 rounded bg-background/80 px-1 text-[9px] font-medium">
                  {index + 1}
                </span>
              </div>
            ))}
            {screenshotFiles.length < MAX_SCREENSHOTS ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => imageInputRef.current?.click()}
                className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <ImagePlus className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}

        {mode === "recording" && file ? (
          <div className="mx-3 mb-2 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2">
            <Video className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={submitting}
              onClick={() => setFile(null)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {submitting && uploadProgress !== null ? (
          <div className="space-y-1.5 px-4 pb-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {mode === "recording"
                  ? "Uploading recording…"
                  : "Uploading screenshots…"}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-1 border-t border-border/60 px-2 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <ToolbarChip disabled={submitting}>
                  <Paperclip className="size-3.5" />
                  {mode === "recording" ? "Recording" : "Screenshots"}
                  {mode === "screenshots" && screenshotFiles.length > 0
                    ? ` · ${screenshotFiles.length}`
                    : null}
                  <ChevronDown className="size-3 opacity-60" />
                </ToolbarChip>
              }
            />
            <DropdownMenuContent align="start" className="min-w-56">
              <DropdownMenuLabel>Product truth</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setMode("screenshots");
                  setFile(null);
                  imageInputRef.current?.click();
                }}
              >
                <ImagePlus className="size-4" />
                Screenshots
                <span className="ml-auto text-xs text-muted-foreground">
                  min {MIN_SCREENSHOTS}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMode("recording");
                  setScreenshotFiles([]);
                  videoInputRef.current?.click();
                }}
              >
                <Video className="size-4" />
                Screen recording
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <ToolbarChip disabled={submitting}>
                  <LayoutTemplate className="size-3.5" />
                  {selectedTemplate?.name ?? "Template"}
                  <ChevronDown className="size-3 opacity-60" />
                </ToolbarChip>
              }
            />
            <DropdownMenuContent align="start" className="min-w-52">
              <DropdownMenuLabel>Creative direction</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedTemplateId ?? "blank"}
                onValueChange={(value) =>
                  setSelectedTemplateId(value === "blank" ? null : value)
                }
              >
                <DropdownMenuRadioItem value="blank">
                  Blank
                </DropdownMenuRadioItem>
                {templates.map((template) => (
                  <DropdownMenuRadioItem key={template.id} value={template.id}>
                    {template.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {onOpenBgm ? (
            <ToolbarChip disabled={submitting} onClick={onOpenBgm}>
              <Music2 className="size-3.5" />
              {musicLabel ? (
                <span className="max-w-28 truncate">{musicLabel}</span>
              ) : (
                "BGM"
              )}
              <ChevronDown className="size-3 opacity-60" />
            </ToolbarChip>
          ) : null}

          {onOpenVoice && mode === "screenshots" ? (
            <ToolbarChip disabled={submitting} onClick={onOpenVoice}>
              <Mic className="size-3.5" />
              {voiceEnabled
                ? (voice?.name ?? "Voice")
                : "Voice off"}
              <ChevronDown className="size-3 opacity-60" />
            </ToolbarChip>
          ) : null}

          <div className="ml-auto flex items-center gap-2 pr-1">
            {mode === "screenshots" &&
            screenshotFiles.length > 0 &&
            screenshotFiles.length < MIN_SCREENSHOTS ? (
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                {MIN_SCREENSHOTS - screenshotFiles.length} more needed
              </span>
            ) : (
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                ⌘ Enter
              </span>
            )}
            <Button
              size="icon"
              className="size-9 rounded-full shadow-sm"
              disabled={!canSubmit}
              onClick={() => void submit()}
              aria-label={submitting ? "Creating…" : "Make video"}
            >
              {submitting ? (
                <Sparkles className="size-4 animate-pulse" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="sr-only"
          disabled={submitting}
          onChange={(event) => {
            handleScreenshots(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="sr-only"
          disabled={submitting}
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) handleFile(picked);
            event.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {VIDEO_TYPES.slice(0, 5).map((type) => (
          <button
            key={type.id}
            type="button"
            disabled={submitting}
            title={type.examplePrompt}
            onClick={() => {
              setPrompt((prev) => {
                const { productUrl } = parseComposerInput(prev);
                if (productUrl) {
                  return `${productUrl}\n${type.examplePrompt}`;
                }
                return type.examplePrompt;
              });
              textareaRef.current?.focus();
            }}
            className={cn(
              "rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50 hover:text-foreground",
              prompt.includes(type.examplePrompt) &&
                "border-primary/40 bg-primary/5 text-foreground",
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
