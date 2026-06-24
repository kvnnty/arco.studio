"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MUSIC_TRACKS,
  type MusicTrackId,
} from "@/lib/editor/music-tracks";
import { cn } from "@/lib/utils";

type BgmTrackGridProps = {
  selectedId: MusicTrackId | null;
  onSelect: (id: MusicTrackId | null) => void;
  showNone?: boolean;
  compact?: boolean;
};

export function BgmTrackGrid({
  selectedId,
  onSelect,
  showNone = true,
  compact = false,
}: BgmTrackGridProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<MusicTrackId | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePreview = (trackId: MusicTrackId, previewUrl: string) => {
    if (playingId === trackId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = previewUrl;
    void audioRef.current.play();
    setPlayingId(trackId);
    audioRef.current.onended = () => setPlayingId(null);
  };

  return (
    <div
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {showNone ? (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "flex items-center justify-between rounded-xl border p-3 text-left transition-colors hover:bg-muted/50",
            selectedId === null
              ? "border-primary bg-primary/5"
              : "border-border",
          )}
        >
          <span className="text-sm font-medium">None</span>
          <span className="text-xs text-muted-foreground">No music</span>
        </button>
      ) : null}

      {MUSIC_TRACKS.map((track) => {
        const isSelected = selectedId === track.id;
        const isPlaying = playingId === track.id;

        return (
          <div
            key={track.id}
            className={cn(
              "flex items-center gap-2 rounded-xl border p-3 transition-colors",
              isSelected ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onSelect(track.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{track.label}</span>
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {track.mood}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {track.durationSec}s
              </p>
            </button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => togglePreview(track.id, track.previewUrl)}
            >
              {isPlaying ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5" />
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
