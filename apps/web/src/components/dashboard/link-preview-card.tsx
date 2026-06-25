"use client";

import { ExternalLink, Globe } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { LinkPreview, LinkPreviewState } from "@/lib/hooks/use-link-preview";
import { cn } from "@/lib/utils";

type LinkPreviewCardProps = {
  url: string;
  state: LinkPreviewState;
  preview: LinkPreview | null;
  className?: string;
};

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function LinkPreviewCard({
  url,
  state,
  preview,
  className,
}: LinkPreviewCardProps) {
  if (state === "idle") return null;

  const hostname = getHostname(url.trim());

  if (state === "loading") {
    return (
      <div
        className={cn(
          "flex gap-3 overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-3",
          className,
        )}
      >
        <Skeleton className="size-16 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border/80 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground",
          className,
        )}
      >
        <Globe className="size-4 shrink-0" />
        <span className="min-w-0 truncate">{hostname}</span>
        <span className="text-xs">Could not load preview</span>
      </div>
    );
  }

  if (!preview) return null;

  const imageUrl = preview.screenshotUrl ?? preview.logoUrl;
  const title = preview.title ?? hostname;
  const description = preview.description;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex gap-3 overflow-hidden rounded-xl border border-border/80 bg-muted/20 p-3 transition-colors hover:bg-muted/40",
        className,
      )}
    >
      {imageUrl ? (
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="size-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Globe className="size-6 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium leading-snug group-hover:text-primary">
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {preview.logoUrl ? (
            <Avatar size="sm" className="size-4">
              <AvatarImage src={preview.logoUrl} alt="" />
              <AvatarFallback className="text-[8px]">
                {hostname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <span className="truncate">{hostname}</span>
          <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </a>
  );
}
