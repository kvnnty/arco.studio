"use client";

import type { Marker } from "@arco/project-schema";
import { Film, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatMs } from "@/lib/editor/format-time";
import { cn } from "@/lib/utils";

type SceneListProps = {
  markers: Marker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
};

export function SceneList({
  markers,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}: SceneListProps) {
  const sorted = [...markers].sort((a, b) => a.startMs - b.startMs);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Film className="size-4 text-muted-foreground" />
          Scenes
          {sorted.length > 0 ? (
            <Badge variant="secondary" className="font-mono">
              {sorted.length}
            </Badge>
          ) : null}
        </div>
        <Button variant="outline" size="xs" onClick={onAdd}>
          <Plus data-icon="inline-start" />
          Add
        </Button>
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          {sorted.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No scenes yet. Play the recording and click Add to mark a moment.
            </p>
          ) : (
            <ul className="space-y-1">
              {sorted.map((marker, index) => (
                <li key={marker.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(marker.id)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      selectedId === marker.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <Badge
                      variant="outline"
                      className="mt-0.5 shrink-0 font-mono text-[10px]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </Badge>
                    <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {marker.label ?? marker.callout?.text ?? "Untitled scene"}
                    </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                        {formatMs(marker.startMs)} ·{" "}
                        {(marker.durationMs / 1000).toFixed(1)}s
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(marker.id);
                      }}
                      aria-label="Delete scene"
                    >
                      <Trash2 />
                    </Button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
