"use client";

import type { StylePreset } from "@arco/project-schema";
import { STYLE_PRESETS } from "@arco/project-schema/style-presets";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type StylePresetPickerProps = {
  value: StylePreset;
  onChange: (preset: StylePreset) => void;
  compact?: boolean;
};

export function StylePresetPicker({
  value,
  onChange,
  compact = false,
}: StylePresetPickerProps) {
  const presets = Object.values(STYLE_PRESETS);

  return (
    <Field>
      <FieldLabel>{compact ? "Style" : "Style preset"}</FieldLabel>
      <FieldContent>
        <ToggleGroup
          value={[value]}
          onValueChange={(next) => {
            const preset = next[0] as StylePreset | undefined;
            if (preset) onChange(preset);
          }}
          variant="outline"
          spacing={0}
          className={cn(
            "grid w-full gap-2",
            compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {presets.map((preset) => (
            <ToggleGroupItem
              key={preset.id}
              value={preset.id}
              className="h-auto flex-col items-start gap-1 px-3 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: preset.brand.primary }}
                />
                {preset.label}
              </span>
              {!compact ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {preset.description}
                </span>
              ) : null}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {!compact ? (
          <FieldDescription>
            Motion systems — not just colors. Affects easing, zoom, and titles.
          </FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  );
}
