"use client";

import {
  createHeuristicSoundDesign,
  getMotionSound,
  MOTION_SOUNDS,
  resolveSoundCueStartMs,
  type ArcoProject,
  type SoundCue,
  type SoundDesignProfile,
} from "@arco/project-schema";
import { Plus, Sparkles, Trash2, Volume2, VolumeX } from "lucide-react";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const PROFILES: Array<{ id: SoundDesignProfile; label: string }> = [
  { id: "minimal", label: "Minimal" },
  { id: "balanced", label: "Balanced" },
  { id: "energetic", label: "Energetic" },
  { id: "cinematic", label: "Cinematic" },
  { id: "playful", label: "Playful" },
  { id: "futuristic", label: "Futuristic" },
];

type SoundDesignPanelProps = {
  project: ArcoProject;
  onChange: (project: ArcoProject) => void;
};

export function SoundDesignPanel({ project, onChange }: SoundDesignPanelProps) {
  const variationRef = useRef(0);
  const soundDesign = project.audio?.soundDesign;

  const updateSoundDesign = (
    next: NonNullable<NonNullable<ArcoProject["audio"]>["soundDesign"]>,
  ) => {
    onChange({
      ...project,
      audio: {
        ...project.audio,
        volume: project.audio?.volume ?? 0.25,
        soundDesign: next,
      },
    });
  };

  const remix = (profile = soundDesign?.profile ?? "balanced") => {
    variationRef.current += 1;
    updateSoundDesign(
      createHeuristicSoundDesign(project, profile, variationRef.current),
    );
  };

  const setSilence = () => {
    updateSoundDesign({
      version: "1",
      decision: "silence",
      rationale:
        "Sound effects are intentionally disabled. Music, voiceover, product audio, and silence remain untouched.",
      profile: soundDesign?.profile ?? "minimal",
      masterVolume: soundDesign?.masterVolume ?? 0.65,
      cues: [],
    });
  };

  const updateCue = (id: string, patch: Partial<SoundCue>) => {
    if (!soundDesign) return;
    updateSoundDesign({
      ...soundDesign,
      decision: "include",
      cues: soundDesign.cues.map((cue) =>
        cue.id === id ? { ...cue, ...patch, source: "manual" } : cue,
      ),
    });
  };

  const removeCue = (id: string) => {
    if (!soundDesign) return;
    const cues = soundDesign.cues.filter((cue) => cue.id !== id);
    updateSoundDesign({
      ...soundDesign,
      decision: cues.some((cue) => cue.enabled) ? "include" : "silence",
      rationale:
        cues.length > 0
          ? soundDesign.rationale
          : "No motion moment currently needs an audible accent.",
      cues,
    });
  };

  const addCue = () => {
    const firstScene = project.scenes?.[0];
    const sound = MOTION_SOUNDS[0];
    const current =
      soundDesign ?? createHeuristicSoundDesign(project, "balanced", 0);
    updateSoundDesign({
      ...current,
      decision: "include",
      rationale:
        current.decision === "silence"
          ? "A manually authored accent has been added to the mix."
          : current.rationale,
      cues: [
        ...current.cues,
        {
          id: `sound-manual-${Date.now()}`,
          soundId: sound.id,
          category: sound.category,
          startMs: 0,
          anchor: firstScene
            ? {
                type: "scene",
                targetId: firstScene.id,
                offsetMs: 80,
                followTiming: true,
              }
            : {
                type: "timeline",
                offsetMs: 0,
                followTiming: false,
              },
          volume: 0.4,
          intensity: 0.45,
          enabled: true,
          source: "manual",
          rationale: "Manually added accent.",
        },
      ],
    });
  };

  const previewSound = (soundId: string, volume = 0.4) => {
    const sound = getMotionSound(soundId);
    if (!sound) return;
    const audio = new Audio(`/${sound.file}`);
    audio.volume = Math.min(0.65, volume);
    void audio.play();
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Motion sound</p>
            <Badge variant="outline">
              {soundDesign?.decision === "include"
                ? `${soundDesign.cues.filter((cue) => cue.enabled).length} cues`
                : soundDesign?.decision === "silence"
                  ? "Intentional silence"
                  : "Undirected"}
            </Badge>
          </div>
          <FieldDescription className="mt-1">
            {soundDesign?.rationale ??
              "Arco has not made a sound-design decision for this project yet."}
          </FieldDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Use intentional silence"
          onClick={setSilence}
        >
          <VolumeX />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PROFILES.map((profile) => (
          <Button
            key={profile.id}
            type="button"
            variant={
              soundDesign?.profile === profile.id ? "secondary" : "outline"
            }
            size="xs"
            onClick={() => remix(profile.id)}
          >
            {profile.label}
          </Button>
        ))}
      </div>

      {soundDesign?.decision === "include" ? (
        <div className="space-y-2">
          {soundDesign.cues.map((cue) => {
            const sound = getMotionSound(cue.soundId);
            return (
              <div
                key={cue.id}
                className="space-y-2 rounded-md bg-muted/40 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Sound"
                    className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    value={cue.soundId}
                    onChange={(event) => {
                      const nextSound = getMotionSound(event.target.value);
                      if (nextSound) {
                        updateCue(cue.id, {
                          soundId: nextSound.id,
                          category: nextSound.category,
                        });
                      }
                    }}
                  >
                    {MOTION_SOUNDS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} · {item.category}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    title={`Preview ${sound?.label ?? "sound"}`}
                    onClick={() => previewSound(cue.soundId, cue.volume)}
                  >
                    <Volume2 />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Remove sound"
                    onClick={() => removeCue(cue.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="grid grid-cols-[88px_1fr] items-center gap-2">
                  <Input
                    aria-label="Sound timing offset in milliseconds"
                    type="number"
                    min={-2000}
                    max={10000}
                    step={20}
                    value={cue.anchor.offsetMs}
                    onChange={(event) =>
                      updateCue(cue.id, {
                        anchor: {
                          ...cue.anchor,
                          offsetMs: Number(event.target.value),
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Slider
                    aria-label="Sound volume"
                    value={[Math.round(cue.volume * 100)]}
                    min={0}
                    max={85}
                    step={1}
                    onValueChange={(value) =>
                      updateCue(cue.id, {
                        volume:
                          ((Array.isArray(value) ? value[0] : value) ?? 40) /
                          100,
                      })
                    }
                  />
                </div>
                {cue.anchor.type !== "timeline" ? (
                  <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={cue.anchor.followTiming}
                      onChange={(event) => {
                        const followTiming = event.target.checked;
                        const resolvedStart = resolveSoundCueStartMs(
                          project,
                          cue,
                        );
                        updateCue(cue.id, {
                          startMs: followTiming
                            ? cue.startMs
                            : Math.max(0, resolvedStart - cue.anchor.offsetMs),
                          anchor: { ...cue.anchor, followTiming },
                        });
                      }}
                    />
                    Follow {cue.anchor.type} timing
                  </label>
                ) : null}
                <p className="text-[11px] leading-4 text-muted-foreground">
                  {cue.anchor.type === "timeline"
                    ? `Timeline · ${cue.anchor.offsetMs}ms`
                    : `${cue.anchor.type} ${cue.anchor.targetId ?? ""} · ${cue.anchor.offsetMs >= 0 ? "+" : ""}${cue.anchor.offsetMs}ms`}
                  {cue.rationale ? ` — ${cue.rationale}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addCue}>
          <Plus data-icon="inline-start" />
          Add sound
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => remix()}
        >
          <Sparkles data-icon="inline-start" />
          Remix
        </Button>
      </div>
      <p className="text-[11px] leading-4 text-muted-foreground">
        Eight original Arco cues. No third-party stock audio. Scene anchors
        follow timing edits automatically.
      </p>
    </div>
  );
}
