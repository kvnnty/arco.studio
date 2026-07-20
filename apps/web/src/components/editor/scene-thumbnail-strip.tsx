"use client";

import type { Marker } from "@arco/project-schema";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { captureVideoFrame } from "@/lib/editor/capture-frame";
import { formatMs } from "@/lib/editor/format-time";
import type { VideoPlayerHandle } from "@/lib/editor/video-player";
import { cn } from "@/lib/utils";

type SceneThumbnailStripProps = {
  markers: Marker[];
  selectedId: string | null;
  recordingUrl: string;
  fps: number;
  playerRef: React.RefObject<VideoPlayerHandle | null>;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onReorder?: (orderedIds: string[]) => void;
};

export function SceneThumbnailStrip({
  markers,
  selectedId,
  recordingUrl,
  fps,
  playerRef,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: SceneThumbnailStripProps) {
  const sorted = useMemo(
    () => [...markers].sort((a, b) => a.startMs - b.startMs),
    [markers],
  );
  const [frames, setFrames] = useState<Record<string, string>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingUrl || sorted.length === 0) return;

    let cancelled = false;

    void (async () => {
      for (const marker of sorted) {
        if (cancelled) continue;
        try {
          const dataUrl = await captureVideoFrame(recordingUrl, marker.startMs);
          if (!cancelled) {
            setFrames((prev) =>
              prev[marker.id] ? prev : { ...prev, [marker.id]: dataUrl },
            );
          }
        } catch {
          // placeholder gradient remains
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [recordingUrl, sorted]);

  const handleSelect = (marker: Marker) => {
    onSelect(marker.id);
    const frame = Math.round((marker.startMs / 1000) * fps);
    playerRef.current?.seekTo(frame);
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId || !onReorder) return;

    const ids = sorted.map((marker) => marker.id);
    const fromIndex = ids.indexOf(draggingId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, draggingId);
    onReorder(ids);
    setDraggingId(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Scenes
        </p>
        <Button variant="outline" size="xs" onClick={onAdd}>
          <Plus data-icon="inline-start" />
          Add
        </Button>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {sorted.map((marker, index) => (
            <div
              key={marker.id}
              className="group relative shrink-0"
              draggable={Boolean(onReorder)}
              onDragStart={() => setDraggingId(marker.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(marker.id)}
            >
              <button
                type="button"
                onClick={() => handleSelect(marker)}
                className={cn(
                  "flex w-28 flex-col overflow-hidden rounded-lg border text-left transition-colors",
                  selectedId === marker.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-muted-foreground/40",
                  draggingId === marker.id && "opacity-50",
                )}
              >
                <div className="relative aspect-video w-full bg-gradient-to-br from-muted to-muted/40">
                  {onReorder ? (
                    <span className="absolute left-1 top-1 z-10 rounded bg-background/80 p-0.5 opacity-0 group-hover:opacity-100">
                      <GripVertical className="size-3 text-muted-foreground" />
                    </span>
                  ) : null}
                  {frames[marker.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={frames[marker.id]}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs font-mono text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-[11px] font-medium">
                    {marker.label ?? marker.callout?.text ?? "Scene"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {formatMs(marker.startMs)}
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(marker.id);
                }}
                aria-label="Delete scene"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
