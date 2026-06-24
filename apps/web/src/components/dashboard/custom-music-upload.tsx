"use client";

import Link from "next/link";
import { Pause, Play, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { uploadMusic } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export type CustomMusicSelection = {
  url: string;
  filename: string;
};

type CustomMusicUploadProps = {
  accessToken?: string;
  canUpload: boolean;
  selected: CustomMusicSelection | null;
  onSelect: (selection: CustomMusicSelection | null) => void;
  compact?: boolean;
};

export function CustomMusicUpload({
  accessToken,
  canUpload,
  selected,
  onSelect,
  compact = false,
}: CustomMusicUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePreview = () => {
    if (!selected) return;

    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = selected.url;
    void audioRef.current.play();
    setPlaying(true);
    audioRef.current.onended = () => setPlaying(false);
  };

  const handleUpload = async (file: File) => {
    if (!accessToken) {
      toast.error("Sign in to upload custom music.");
      return;
    }

    if (!canUpload) {
      toast.error("Custom music requires Pro ($29/mo).");
      return;
    }

    if (!rightsConfirmed) {
      toast.error("Confirm you have rights to use this track.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMusic(accessToken, file);
      onSelect({ url: result.url, filename: result.filename });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload music.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4">
        <p className="text-sm font-medium">Upload your own track</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Custom music is available on Pro ($29/mo) and above.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          render={<Link href="/dashboard/billing" />}
        >
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", compact ? "" : "rounded-xl border p-4")}>
      {selected ? (
        <div className="flex items-center gap-2 rounded-xl border border-primary bg-primary/5 p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selected.filename}</p>
            <p className="text-xs text-muted-foreground">Custom upload</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={togglePreview}
          >
            {playing ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <>
          <Field>
            <FieldContent className="flex items-start gap-2">
              <Checkbox
                id="music-rights"
                checked={rightsConfirmed}
                onCheckedChange={(checked) =>
                  setRightsConfirmed(checked === true)
                }
              />
              <FieldLabel htmlFor="music-rights" className="font-normal">
                I confirm I have the rights to use this music in my video.
              </FieldLabel>
            </FieldContent>
            <FieldDescription>
              MP3 or WAV · max 10MB · for promotional use only.
            </FieldDescription>
          </Field>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/mp3,.mp3,.wav"
            className="hidden"
            disabled={uploading || !rightsConfirmed}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={uploading || !rightsConfirmed}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload data-icon="inline-start" />
            {uploading ? "Uploading…" : "Upload MP3 or WAV"}
          </Button>
        </>
      )}
    </div>
  );
}
