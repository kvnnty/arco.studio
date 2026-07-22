"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useManagedAuth } from "@/hooks/use-managed-auth";
import { apiPreviewVoice, type ArcoVoice } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type VoiceGridProps = {
  voices: ArcoVoice[];
  selectedId: string | null;
  voiceEnabled: boolean;
  onSelectVoice: (id: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
};

export function VoiceGrid({
  voices,
  selectedId,
  voiceEnabled,
  onSelectVoice,
  onToggleEnabled,
}: VoiceGridProps) {
  const { session } = useManagedAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePreview = async (voice: ArcoVoice) => {
    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    const token = session?.accessToken;
    if (!token) {
      setPreviewError("Sign in to preview voices.");
      return;
    }

    setPreviewError(null);

    try {
      const result = await apiPreviewVoice(token, {
        voiceId: voice.id,
        text: voice.previewText,
      });

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = `data:${result.contentType};base64,${result.audioBase64}`;
      await audioRef.current.play();
      setPlayingId(voice.id);
      audioRef.current.onended = () => setPlayingId(null);
    } catch {
      setPreviewError("Voice preview unavailable. Set ELEVENLABS_API_KEY on the API.");
      setPlayingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border p-3">
        <div>
          <p className="text-sm font-medium">Voiceover</p>
          <p className="text-xs text-muted-foreground">
            AI narration per scene (included in subscription)
          </p>
        </div>
        <Button
          type="button"
          variant={voiceEnabled ? "secondary" : "outline"}
          size="sm"
          onClick={() => onToggleEnabled(!voiceEnabled)}
        >
          {voiceEnabled ? "On" : "Off"}
        </Button>
      </div>

      {previewError ? (
        <p className="text-xs text-destructive">{previewError}</p>
      ) : null}

      {voiceEnabled ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {voices.map((voice) => {
            const isSelected = selectedId === voice.id;
            const isPlaying = playingId === voice.id;

            return (
              <div
                key={voice.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-3",
                  isSelected ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onSelectVoice(voice.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{voice.name}</span>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {voice.accent}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {voice.gender}
                  </p>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => void togglePreview(voice)}
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
      ) : null}
    </div>
  );
}
