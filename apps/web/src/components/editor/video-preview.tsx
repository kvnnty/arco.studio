"use client";

import type { ArcoProject, FocusRegion, Marker } from "@arco/project-schema";
import { compileArcoVideo } from "@arco/video";
import type { HyperframesPlayer } from "@hyperframes/player";
import { useEffect, useImperativeHandle, useRef, useState } from "react";

import { FocusRegionOverlay } from "@/components/editor/focus-region-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { VideoPlayerHandle } from "@/lib/editor/video-player";
import { cn } from "@/lib/utils";
import { Crop, ShieldCheck } from "lucide-react";

type VideoPreviewProps = {
  project: ArcoProject;
  playerRef: React.RefObject<VideoPlayerHandle | null>;
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
  const aspect = `${project.meta.width} / ${project.meta.height}`;
  const hostRef = useRef<HTMLDivElement>(null);
  const hyperframesRef = useRef<HyperframesPlayer | null>(null);
  const [compositionUrl, setCompositionUrl] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState(100);

  useEffect(() => {
    const compiled = compileArcoVideo(project, {
      assetBaseUrl: window.location.origin,
      mode: "preview",
    });
    const nextUrl = URL.createObjectURL(
      new Blob([compiled.html], { type: "text/html" }),
    );

    setCompositionUrl(nextUrl);
    setQualityScore(compiled.quality.score);
    return () => URL.revokeObjectURL(nextUrl);
  }, [project]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !compositionUrl) return;

    void import("@hyperframes/player");
    const player = document.createElement(
      "hyperframes-player",
    ) as HyperframesPlayer;
    player.setAttribute("src", compositionUrl);
    player.setAttribute("controls", "");
    player.setAttribute("width", String(project.meta.width));
    player.setAttribute("height", String(project.meta.height));
    player.style.display = "block";
    player.style.width = "100%";
    player.style.aspectRatio = aspect;
    host.replaceChildren(player);
    hyperframesRef.current = player;

    return () => {
      if (hyperframesRef.current === player) {
        hyperframesRef.current = null;
      }
      player.remove();
    };
  }, [aspect, compositionUrl, project.meta.height, project.meta.width]);

  useImperativeHandle(
    playerRef,
    () => ({
      getCurrentFrame: () =>
        Math.round(
          (hyperframesRef.current?.currentTime ?? 0) * project.meta.fps,
        ),
      seekTo: (frame: number) => {
        hyperframesRef.current?.seek(frame / project.meta.fps);
      },
    }),
    [project.meta.fps],
  );

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs text-muted-foreground">Preview</p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Quality {qualityScore}
          </span>
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
      </div>
      <CardContent className="relative p-0">
        <div className={cn("relative mx-auto w-full max-w-full")}>
          <div
            ref={hostRef}
            className="w-full bg-black"
            style={{ aspectRatio: aspect }}
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
