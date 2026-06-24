"use client";

import {
  ArcoComposition,
  getArcoCompositionDuration,
} from "@arco/remotion/composition";
import type { ArcoProject, FocusRegion, Marker } from "@arco/project-schema";
import { Player, type PlayerRef } from "@remotion/player";
import { useMemo } from "react";

import { FocusRegionOverlay } from "@/components/editor/focus-region-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Crop } from "lucide-react";

type VideoPreviewProps = {
  project: ArcoProject;
  playerRef: React.RefObject<PlayerRef | null>;
  selectedMarker: Marker | null;
  cameraMode: boolean;
  screenshotMode?: boolean;
  onCameraModeChange: (enabled: boolean) => void;
  onFocusChange: (focus: FocusRegion) => void;
};

export function VideoPreview({
  project,
  playerRef,
  selectedMarker,
  cameraMode,
  screenshotMode = false,
  onCameraModeChange,
  onFocusChange,
}: VideoPreviewProps) {
  const durationInFrames = useMemo(
    () => getArcoCompositionDuration(project),
    [project],
  );

  const aspect =
    project.exportFormat === "1:1"
      ? "1 / 1"
      : project.exportFormat === "9:16"
        ? "9 / 16"
        : "16 / 9";

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs text-muted-foreground">Preview</p>
        <Button
          variant={cameraMode ? "secondary" : "outline"}
          size="xs"
          onClick={() => onCameraModeChange(!cameraMode)}
          disabled={!selectedMarker || screenshotMode}
        >
          <Crop data-icon="inline-start" />
          Camera
        </Button>
      </div>
      <CardContent className="relative p-0">
        <div className={cn("relative mx-auto w-full max-w-full")}>
          <Player
            ref={playerRef}
            component={ArcoComposition}
            inputProps={{ project }}
            durationInFrames={Math.max(durationInFrames, 1)}
            compositionWidth={project.meta.width}
            compositionHeight={project.meta.height}
            fps={project.meta.fps}
            style={{
              width: "100%",
              aspectRatio: aspect,
            }}
            controls
            clickToPlay
            spaceKeyToPlayOrPause
          />
          <FocusRegionOverlay
            marker={selectedMarker}
            enabled={cameraMode}
            onChange={onFocusChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
