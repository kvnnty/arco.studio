"use client";

import { Film, Play } from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

type ProjectPosterProps = {
  title: string;
  recordingSrc?: string | null;
  exportUrl?: string | null;
  thumbnailUrl?: string | null;
  className?: string;
  compact?: boolean;
};

export function ProjectPoster({
  title,
  recordingSrc,
  exportUrl,
  thumbnailUrl,
  className,
  compact = false,
}: ProjectPosterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const initial = title.trim().charAt(0).toUpperCase() || "A";
  const videoSrc =
    exportUrl && !recordingSrc ? exportUrl : recordingSrc ?? exportUrl;

  if (thumbnailUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-muted",
          compact ? "aspect-video" : "aspect-video w-full",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="size-full object-cover"
        />
      </div>
    );
  }

  if (videoSrc) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-muted",
          compact ? "aspect-video" : "aspect-video w-full",
          className,
        )}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover"
          onLoadedData={() => {
            const video = videoRef.current;
            if (video && video.currentTime === 0) {
              video.currentTime = Math.min(1, video.duration * 0.05 || 1);
            }
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex size-10 items-center justify-center rounded-full bg-background/90 shadow-sm">
            <Play className="size-4 text-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50",
        className,
      )}
    >
      <div className="text-center">
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-background/80 text-lg font-semibold shadow-sm">
          {initial}
        </div>
        {!compact ? (
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Film className="size-3" />
            No preview yet
          </p>
        ) : null}
      </div>
    </div>
  );
}
