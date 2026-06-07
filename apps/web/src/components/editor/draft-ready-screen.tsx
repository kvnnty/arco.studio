"use client";

import type { ArcoProject } from "@arco/project-schema";
import { Film, Music, Sparkles, Type, ZoomIn } from "lucide-react";

import { JourneyStepper } from "@/components/editor/journey-stepper";
import { StylePresetPicker } from "@/components/editor/style-preset-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMs } from "@/lib/editor/format-time";

type DraftReadyScreenProps = {
  project: ArcoProject;
  onStyleChange: (preset: ArcoProject["stylePreset"]) => void;
  onContinue: () => void;
};

export function DraftReadyScreen({
  project,
  onStyleChange,
  onContinue,
}: DraftReadyScreenProps) {
  const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:px-8">
      <JourneyStepper current="draft" className="mb-8" />

      <Badge variant="outline" className="w-fit text-accent-foreground">
        Step 4 · Draft generated
      </Badge>
      <div className="mt-4 flex items-center gap-3">
        <Sparkles className="size-6 text-accent-foreground" />
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">
          Your first draft is ready
        </h1>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Arco added motion, zooms, click effects, titles, and a music bed. Tweak
        everything in the editor next.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ZoomIn className="size-4" /> Motion
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Zoom on key moments, ripple on clicks, smooth pans between scenes.
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Type className="size-4" /> Text
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Title cards with headlines pulled from detected product moments.
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Film className="size-4" /> Scenes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {sorted.length} scenes from {formatMs(sorted[0]?.startMs ?? 0)} to{" "}
            {formatMs(sorted[sorted.length - 1]?.startMs ?? 0)}.
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Music className="size-4" /> Music
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Modern SaaS track · {Math.round((project.audio?.volume ?? 0.85) * 100)}% volume
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <StylePresetPicker
        value={project.stylePreset ?? "startup"}
        onChange={onStyleChange}
      />

      <ul className="mt-6 space-y-2 rounded-xl border border-border bg-card p-4">
        {sorted.map((marker) => (
          <li
            key={marker.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {formatMs(marker.startMs)}
            </span>
            <span>{marker.label ?? marker.callout?.text}</span>
          </li>
        ))}
      </ul>

      <Button className="mt-10 w-fit" onClick={onContinue}>
        Open motion editor
      </Button>
    </div>
  );
}
