"use client";

import type { ArcoProject, ScreenshotScene } from "@arco/project-schema";
import { msToFrames } from "@arco/project-schema";
import type { PlayerRef } from "@remotion/player";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatMs } from "@/lib/editor/format-time";
import { cn } from "@/lib/utils";

type ScreenshotSceneStripProps = {
  scenes: ScreenshotScene[];
  selectedId: string | null;
  fps: number;
  playerRef: React.RefObject<PlayerRef | null>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function sceneStartMs(scenes: ScreenshotScene[], index: number): number {
  let ms = 0;
  for (let i = 0; i < index; i++) {
    ms += scenes[i]?.durationMs ?? 0;
  }
  return ms;
}

export function ScreenshotSceneStrip({
  scenes,
  selectedId,
  fps,
  playerRef,
  onSelect,
  onDelete,
}: ScreenshotSceneStripProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {scenes.map((scene, index) => {
          const startMs = sceneStartMs(scenes, index);
          const isSelected = scene.id === selectedId;

          return (
            <div
              key={scene.id}
              className={cn(
                "group relative w-36 shrink-0 overflow-hidden rounded-lg border",
                isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
              )}
            >
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => {
                  onSelect(scene.id);
                  playerRef.current?.seekTo(msToFrames(startMs, fps));
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scene.imageSrc}
                  alt={scene.headline ?? `Scene ${index + 1}`}
                  className="aspect-video w-full object-cover"
                />
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-xs font-medium">
                    {scene.headline ?? `Scene ${index + 1}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatMs(startMs)} · {formatMs(scene.durationMs)}
                  </p>
                </div>
              </button>
              {scenes.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1 bg-background/80 opacity-0 group-hover:opacity-100"
                  onClick={() => onDelete(scene.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

type ScreenshotSceneInspectorProps = {
  scene: ScreenshotScene | null;
  onChange: (scene: ScreenshotScene) => void;
  onProjectUpdate: (project: ArcoProject) => void;
  project: ArcoProject;
};

export function ScreenshotSceneInspector({
  scene,
  onChange,
  onProjectUpdate,
  project,
}: ScreenshotSceneInspectorProps) {
  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Select a scene to edit headline and duration.
      </div>
    );
  }

  const applyScene = (nextScene: ScreenshotScene) => {
    const scenes = (project.scenes ?? []).map((s) =>
      s.id === nextScene.id ? nextScene : s,
    );
    const durationMs = scenes.reduce((sum, s) => sum + s.durationMs, 0);
    onProjectUpdate({
      ...project,
      scenes,
      recording: { ...project.recording, durationMs },
    });
    onChange(nextScene);
  };

  return (
    <div className="space-y-4 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scene.imageSrc}
        alt={scene.headline ?? "Scene"}
        className="aspect-video w-full rounded-lg border border-border object-cover"
      />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Headline</span>
        <input
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={scene.headline ?? ""}
          onChange={(event) =>
            applyScene({ ...scene, headline: event.target.value })
          }
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Subheadline</span>
        <input
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={scene.subheadline ?? ""}
          onChange={(event) =>
            applyScene({ ...scene, subheadline: event.target.value })
          }
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Voiceover script</span>
        <textarea
          className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={scene.voScript ?? ""}
          onChange={(event) =>
            applyScene({ ...scene, voScript: event.target.value })
          }
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          Duration ({Math.round(scene.durationMs / 1000)}s)
        </span>
        <input
          type="range"
          min={2000}
          max={12000}
          step={500}
          value={scene.durationMs}
          onChange={(event) => {
            applyScene({ ...scene, durationMs: Number(event.target.value) });
          }}
        />
      </label>
    </div>
  );
}
