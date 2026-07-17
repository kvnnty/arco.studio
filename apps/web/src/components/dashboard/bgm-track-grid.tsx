"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  /** When false, stops any active preview (e.g. modal closed). */
  active?: boolean;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BgmTrackGrid({
  selectedId,
  onSelect,
  showNone = true,
  compact = false,
  active = true,
}: BgmTrackGridProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const [previewId, setPreviewId] = useState<MusicTrackId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (active) return;
    audioRef.current?.pause();
    setPreviewId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [active]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !previewId) return;

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
    setCurrentTime(audio.currentTime);
    setIsPlaying(!audio.paused);

    const onTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [previewId]);

  const ensureAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  };

  const togglePreview = (trackId: MusicTrackId, previewUrl: string) => {
    const audio = ensureAudio();

    if (previewId === trackId) {
      if (isPlaying) {
        audio.pause();
      } else {
        void audio.play();
      }
      return;
    }

    audio.src = previewUrl;
    setPreviewId(trackId);
    setCurrentTime(0);
    setDuration(0);
    void audio.play();
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  };

  return (
    <div
      className={cn(
        "grid gap-2",
        compact
          ? "grid-cols-1"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
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
        const isPreviewing = previewId === track.id;
        const trackPlaying = isPreviewing && isPlaying;
        const seekMax = duration > 0 ? duration : track.durationSec;

        return (
          <div
            key={track.id}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-3 transition-colors",
              isSelected ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <div className="flex items-center gap-2">
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
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {track.description}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {track.durationSec}s
                </p>
              </button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => togglePreview(track.id, track.previewUrl)}
              >
                {trackPlaying ? (
                  <Pause className="size-3.5" />
                ) : (
                  <Play className="size-3.5" />
                )}
              </Button>
            </div>

            {isPreviewing ? (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="w-9 shrink-0 text-[10px] tabular-nums text-muted-foreground">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  className="min-w-0 flex-1"
                  value={[Math.min(currentTime, seekMax)]}
                  min={0}
                  max={seekMax}
                  step={0.1}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    if (typeof next !== "number") return;
                    isSeekingRef.current = true;
                    setCurrentTime(next);
                  }}
                  onValueCommitted={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    if (typeof next === "number") {
                      seekTo(next);
                    }
                    isSeekingRef.current = false;
                  }}
                />
                <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                  {formatTime(seekMax)}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
