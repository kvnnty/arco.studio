"use client";

import type { ArcoTemplate } from "@arco/project-schema/templates";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type TemplateCardProps = {
  template: ArcoTemplate;
  selected?: boolean;
  onSelect?: (templateId: string) => void;
  compact?: boolean;
  showUseButton?: boolean;
  onUse?: (templateId: string) => void;
};

export function TemplateCard({
  template,
  selected = false,
  onSelect,
  compact = false,
  showUseButton = false,
  onUse,
}: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(template.id)}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-xl border text-left transition-all",
        compact ? "w-36" : "w-full",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          compact ? "aspect-[9/16]" : "aspect-video",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.previewPosterUrl}
          alt=""
          className="size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="size-8 text-white/90" />
        </div>
      </div>
      <div className={cn("p-3", compact && "p-2")}>
        <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
          {template.name}
        </p>
        {!compact ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {template.description}
          </p>
        ) : null}
        {showUseButton && onUse ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onUse(template.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.stopPropagation();
                onUse(template.id);
              }
            }}
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          >
            Use template
          </span>
        ) : null}
      </div>
    </button>
  );
}
