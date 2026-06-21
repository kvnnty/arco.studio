"use client";

import type { ArcoProject } from "@arco/project-schema";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { uploadThumbnail } from "@/lib/api/client";
import { MUSIC_TRACKS } from "@/lib/editor/music-tracks";

type CustomizePanelProps = {
  project: ArcoProject;
  onChange: (project: ArcoProject) => void;
};

export function CustomizePanel({ project, onChange }: CustomizePanelProps) {
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brand = project.brand ?? {
    primary: "#55b3ff",
    background: "#07080a",
  };
  const audio = project.audio ?? { musicId: "modern-saas", volume: 0.85 };

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
        <FieldContent>
          <ToggleGroup
            value={[audio.musicId ?? "modern-saas"]}
            onValueChange={(value) => {
              const next = value[0];
              if (next) updateAudio({ musicId: next });
            }}
            variant="outline"
            size="sm"
            spacing={0}
            className="flex w-full flex-wrap"
          >
            {MUSIC_TRACKS.map((track) => (
              <ToggleGroupItem key={track.id} value={track.id}>
                {track.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldContent>
      </Field>

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
    </FieldGroup>
  );
}
