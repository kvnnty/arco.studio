"use client";

import type { ArcoProject } from "@arco/project-schema";
import { isScreenshotProject } from "@arco/project-schema";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useManagedAuth } from "@/hooks/use-managed-auth";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { BgmTrackGrid } from "@/components/dashboard/bgm-track-grid";
import {
  CustomMusicUpload,
  type CustomMusicSelection,
} from "@/components/dashboard/custom-music-upload";
import { uploadThumbnail } from "@/lib/api/client";
import { useBillingStatus } from "@/lib/api/hooks/billing";
import { creditCostHint } from "@/lib/editor/generation-credits";
import type { MusicTrackId } from "@/lib/editor/music-tracks";
import { SoundDesignPanel } from "@/components/editor/sound-design-panel";

type CustomizePanelProps = {
  project: ArcoProject;
  onChange: (project: ArcoProject) => void;
};

export function CustomizePanel({ project, onChange }: CustomizePanelProps) {
  const { session } = useManagedAuth();
  const { data: billing } = useBillingStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brand = project.brand ?? {
    primary: "#55b3ff",
    background: "#07080a",
  };
  const audio = project.audio ?? {
    musicId: "warm-launch",
    volume: 0.25,
    voiceEnabled: true,
  };

  const updateBrand = (patch: Partial<NonNullable<ArcoProject["brand"]>>) => {
    onChange({
      ...project,
      brand: { ...brand, ...patch },
    });
  };

  const updateAudio = (patch: Partial<NonNullable<ArcoProject["audio"]>>) => {
    onChange({
      ...project,
      audio: { ...audio, ...patch },
    });
  };

  const customMusicSelection: CustomMusicSelection | null = audio.customMusicSrc
    ? {
        url: audio.customMusicSrc,
        filename: audio.customMusicSrc.split("/").pop() ?? "Custom track",
      }
    : null;

  const handleCustomMusicSelect = (selection: CustomMusicSelection | null) => {
    if (selection) {
      updateAudio({
        customMusicSrc: selection.url,
        musicId: undefined,
      });
      return;
    }

    updateAudio({
      customMusicSrc: undefined,
      musicId: audio.musicId ?? "warm-launch",
    });
  };

  const handleLogoUpload = async (file: File) => {
    const accessToken = session?.accessToken;
    if (!accessToken) return;

    const result = await uploadThumbnail(accessToken, file);
    updateBrand({ logoSrc: result.url });
  };

  return (
    <FieldGroup className="px-1">
      <Field>
        <FieldLabel>Logo</FieldLabel>
        <FieldContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleLogoUpload(file);
            }}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload data-icon="inline-start" />
            {brand.logoSrc ? "Replace logo" : "Upload logo"}
          </Button>
          {brand.logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoSrc}
              alt="Logo preview"
              className="mt-2 h-12 w-auto rounded border border-border object-contain p-1"
            />
          ) : null}
          <FieldDescription>
            Shown in the corner of your exported video.
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-primary">Primary color</FieldLabel>
        <FieldContent>
          <Input
            id="brand-primary"
            type="color"
            value={brand.primary}
            onChange={(event) => updateBrand({ primary: event.target.value })}
            className="h-10 w-full cursor-pointer"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-background">Background color</FieldLabel>
        <FieldContent>
          <Input
            id="brand-background"
            type="color"
            value={brand.background}
            onChange={(event) =>
              updateBrand({ background: event.target.value })
            }
            className="h-10 w-full cursor-pointer"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Background music</FieldLabel>
        <FieldContent className="space-y-3">
          <CustomMusicUpload
            compact
            accessToken={session?.accessToken}
            canUpload={billing?.canUploadCustomMusic ?? false}
            selected={customMusicSelection}
            onSelect={handleCustomMusicSelect}
          />
          {!customMusicSelection ? (
            <BgmTrackGrid
              compact
              showNone={false}
              selectedId={(audio.musicId as MusicTrackId) ?? "warm-launch"}
              onSelect={(id) =>
                updateAudio({
                  musicId: id ?? "warm-launch",
                  customMusicSrc: undefined,
                })
              }
            />
          ) : null}
        </FieldContent>
      </Field>

      {isScreenshotProject(project) ? (
        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="voiceover-enabled">AI voiceover</FieldLabel>
            <Switch
              id="voiceover-enabled"
              checked={audio.voiceEnabled !== false}
              onCheckedChange={(enabled) =>
                updateAudio({ voiceEnabled: enabled })
              }
            />
          </div>
          <FieldContent>
            <FieldDescription>
              {audio.voiceEnabled === false
                ? "Off — export uses music and on-screen text only. No voice credits are spent."
                : `On — narration plays in export. Generating or regenerating uses ~${creditCostHint("voice_generate")} credits per scene.`}
            </FieldDescription>
          </FieldContent>
        </Field>
      ) : null}

      <Field>
        <FieldLabel>Music volume</FieldLabel>
        <FieldContent>
          <Slider
            value={[Math.round((audio.volume ?? 0.85) * 100)]}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) => {
              const raw = Array.isArray(value) ? value[0] : value;
              updateAudio({ volume: (raw ?? 85) / 100 });
            }}
          />
          <FieldDescription>
            {Math.round((audio.volume ?? 0.85) * 100)}%
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Sound direction</FieldLabel>
        <FieldContent>
          <SoundDesignPanel project={project} onChange={onChange} />
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
