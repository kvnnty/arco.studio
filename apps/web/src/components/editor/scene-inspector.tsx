"use client";

import type { ClickEffect, Marker, TransitionType } from "@arco/project-schema";
import {
  clickEffectFromMarker,
  setMarkerClickEffect,
} from "@arco/project-schema";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { hasEffect, setEffect } from "@/lib/editor/create-project";
import { formatMs, parseTimestamp } from "@/lib/editor/format-time";

type SceneInspectorProps = {
  marker: Marker | null;
  onChange: (marker: Marker) => void;
  cameraMode: boolean;
};

const clickEffects: { id: ClickEffect; label: string }[] = [
  { id: "none", label: "None" },
  { id: "ripple", label: "Ripple" },
  { id: "pulse", label: "Pulse" },
  { id: "spotlight", label: "Spotlight" },
  { id: "zoom", label: "Zoom" },
  { id: "glow", label: "Glow" },
];

const transitions: { id: TransitionType; label: string }[] = [
  { id: "fade", label: "Fade" },
  { id: "push", label: "Push" },
  { id: "scale", label: "Scale" },
  { id: "blur", label: "Blur" },
  { id: "morph", label: "Morph" },
  { id: "slide", label: "Slide" },
];

export function SceneInspector({
  marker,
  onChange,
  cameraMode,
}: SceneInspectorProps) {
  if (!marker) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Select a scene to edit motion, camera focus, and transitions.
      </div>
    );
  }

  const clickEffect = clickEffectFromMarker(marker);
  const zoom = marker.effects.find((effect) => effect.type === "smooth-zoom");
  const showTitleCard = hasEffect(marker, "title-card");
  const zoomScale = zoom?.scale ?? 1.15;
  const transition = marker.transition?.type ?? "fade";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Scene settings</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {marker.label ?? "Custom scene"} · tweak visually, not with keyframes.
        </p>
      </div>

      <Tabs defaultValue="motion" className="flex-1 px-4 py-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="motion">Motion</TabsTrigger>
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="transition">Transition</TabsTrigger>
        </TabsList>

        <TabsContent value="motion">
          <FieldGroup className="pt-4">
            <Field>
              <FieldLabel htmlFor={`title-${marker.id}`}>Title</FieldLabel>
              <FieldContent>
                <Input
                  id={`title-${marker.id}`}
                  value={marker.callout?.text ?? ""}
                  onChange={(event) =>
                    onChange({
                      ...marker,
                      callout: {
                        ...marker.callout,
                        text: event.target.value,
                      },
                    })
                  }
                  placeholder="See every metric instantly"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor={`subtitle-${marker.id}`}>Subtitle</FieldLabel>
              <FieldContent>
                <Input
                  id={`subtitle-${marker.id}`}
                  value={marker.callout?.subtext ?? ""}
                  onChange={(event) =>
                    onChange({
                      ...marker,
                      callout: {
                        text: marker.callout?.text ?? "",
                        subtext: event.target.value || undefined,
                      },
                    })
                  }
                  placeholder="Understand what drives growth"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor={`start-${marker.id}`}>Start time</FieldLabel>
              <FieldContent>
                <Input
                  id={`start-${marker.id}`}
                  className="font-mono"
                  defaultValue={formatMs(marker.startMs)}
                  key={`start-${marker.id}-${marker.startMs}`}
                  onBlur={(event) => {
                    const parsed = parseTimestamp(event.target.value);
                    if (parsed !== null) {
                      onChange({ ...marker, startMs: parsed });
                    }
                  }}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor={`duration-${marker.id}`}>Duration (s)</FieldLabel>
              <FieldContent>
                <Input
                  id={`duration-${marker.id}`}
                  type="number"
                  min={0.1}
                  step={0.1}
                  className="font-mono"
                  value={marker.durationMs / 1000}
                  onChange={(event) =>
                    onChange({
                      ...marker,
                      durationMs: Math.max(
                        100,
                        Math.round(Number(event.target.value) * 1000),
                      ),
                    })
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Click effect</FieldLabel>
              <FieldContent>
                <ToggleGroup
                  value={[clickEffect]}
                  onValueChange={(value) => {
                    const next = value[0] as ClickEffect | undefined;
                    if (next) {
                      onChange(setMarkerClickEffect(marker, next, zoomScale));
                    }
                  }}
                  variant="outline"
                  size="sm"
                  spacing={0}
                  className="grid w-full grid-cols-3"
                >
                  {clickEffects.map((option) => (
                    <ToggleGroupItem
                      key={option.id}
                      value={option.id}
                      className="w-full"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldContent>
            </Field>

            {clickEffect === "zoom" && (
              <Field>
                <FieldLabel>Zoom strength</FieldLabel>
                <FieldContent>
                  <Slider
                    min={1}
                    max={2}
                    step={0.05}
                    value={[zoomScale]}
                    onValueChange={(value) => {
                      const next = Array.isArray(value) ? value[0] : value;
                      onChange(
                        setMarkerClickEffect(marker, "zoom", next ?? 1.15),
                      );
                    }}
                  />
                  <FieldDescription className="font-mono">
                    {(zoomScale).toFixed(2)}×
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Title card</FieldLabel>
                <FieldDescription>Full-screen headline overlay.</FieldDescription>
              </FieldContent>
              <Toggle
                variant="outline"
                size="sm"
                pressed={showTitleCard}
                onPressedChange={(pressed) =>
                  onChange(setEffect(marker, "title-card", pressed))
                }
              >
                {showTitleCard ? "On" : "Off"}
              </Toggle>
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="camera">
          <FieldGroup className="pt-4">
            <Field>
              <FieldLabel>Focus area</FieldLabel>
              <FieldContent>
                <FieldDescription>
                  {cameraMode
                    ? "Drag the focus box on the preview — like Figma's crop tool."
                    : "Enable camera mode on the preview to drag the focus box."}
                </FieldDescription>
                <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs text-muted-foreground">
                  <span>X: {(marker.focus?.x ?? 0.5).toFixed(2)}</span>
                  <span>Y: {(marker.focus?.y ?? 0.5).toFixed(2)}</span>
                  <span>W: {(marker.focus?.width ?? 0.4).toFixed(2)}</span>
                  <span>H: {(marker.focus?.height ?? 0.35).toFixed(2)}</span>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="transition">
          <FieldGroup className="pt-4">
            <Field>
              <FieldLabel>Into this scene</FieldLabel>
              <FieldContent>
                <ToggleGroup
                  value={[transition]}
                  onValueChange={(value) => {
                    const next = value[0] as TransitionType | undefined;
                    if (next) {
                      onChange({ ...marker, transition: { type: next } });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  spacing={0}
                  className="grid w-full grid-cols-3"
                >
                  {transitions.map((option) => (
                    <ToggleGroupItem
                      key={option.id}
                      value={option.id}
                      className="w-full"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldDescription>
                  Simple presets — not After Effects keyframes.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}
