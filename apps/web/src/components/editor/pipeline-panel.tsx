"use client";

import type { Marker } from "@arco/project-schema";
import { Check, Circle, Loader2, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMs } from "@/lib/editor/format-time";
import {
  GENERATION_PIPELINE_STEPS,
  type PipelineState,
} from "@/lib/editor/generation-pipeline";
import { cn } from "@/lib/utils";

type PipelinePanelProps = {
  pipeline: PipelineState;
  isGenerating: boolean;
  failed?: boolean;
  failureMessage?: string | null;
  onRetry?: () => void;
  markers: Marker[];
  productHostname?: string;
};

export function PipelinePanel({
  pipeline,
  isGenerating,
  failed = false,
  failureMessage,
  onRetry,
  markers,
  productHostname,
}: PipelinePanelProps) {
  const activeIndex = GENERATION_PIPELINE_STEPS.findIndex(
    (step) => step.id === pipeline.activeStep,
  );
  const progress =
    ((activeIndex + (pipeline.completedSteps.includes(pipeline.activeStep) ? 1 : 0.5)) /
      GENERATION_PIPELINE_STEPS.length) *
    100;

  const showDraftPreview =
    pipeline.completedSteps.includes("draft") || pipeline.activeStep !== "analyze";
  const showSceneList =
    markers.length > 0 &&
    (pipeline.completedSteps.includes("scenes") ||
      pipeline.activeStep === "scenes" ||
      pipeline.activeStep === "stitch");

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Output
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {productHostname
              ? `Video for ${productHostname}`
              : "Video generation"}
          </h2>
          {pipeline.sceneCount && pipeline.targetDurationSec ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {pipeline.sceneCount} scenes · {pipeline.targetDurationSec}s target
            </p>
          ) : null}
        </div>
        {failed ? (
          <Badge variant="outline" className="shrink-0 text-destructive">
            Failed
          </Badge>
        ) : isGenerating ? (
          <Badge variant="outline" className="shrink-0 gap-1.5">
            <Loader2 className="size-3 animate-spin" />
            Working
          </Badge>
        ) : pipeline.completedSteps.includes("stitch") ? (
          <Badge variant="outline" className="shrink-0 text-emerald-600">
            Ready
          </Badge>
        ) : null}
      </div>

      {failed ? (
        <Card className="border-destructive/30 py-0">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm text-destructive">
              {failureMessage?.trim() ||
                "Video generation failed. You can retry without creating a new project."}
            </p>
            {onRetry ? (
              <Button type="button" size="sm" onClick={onRetry}>
                <RotateCcw data-icon="inline-start" />
                Retry pipeline
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-0">
        <CardHeader className="border-b border-border px-4 py-3">
          <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {failed
                  ? "Stopped"
                  : (GENERATION_PIPELINE_STEPS[activeIndex]?.label ?? "Starting")}
              </span>
              <span>{failed ? "—" : `${Math.round(progress)}%`}</span>
            </div>
            <Progress value={progress} />
          </div>

          <ol className="space-y-2">
            {GENERATION_PIPELINE_STEPS.map((step) => {
              const done = pipeline.completedSteps.includes(step.id);
              const active = pipeline.activeStep === step.id;
              const waiting =
                pipeline.waitingForCredits &&
                (step.id === "voice" || step.id === "scenes");
              const voiceSkipped = step.id === "voice" && pipeline.voiceSkipped;
              const label = voiceSkipped ? "Skip voice" : step.label;
              const description = voiceSkipped
                ? "Voiceover off — music and on-screen text only"
                : step.description;

              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm",
                    active && "border-primary/30 bg-primary/5",
                    done && !active && "border-border/60 bg-muted/20",
                    !done && !active && "border-transparent text-muted-foreground",
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {done ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : active ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-medium",
                        active && "text-foreground",
                        done && "text-foreground",
                      )}
                    >
                      {label}
                      {waiting ? (
                        <span className="ml-2 text-xs font-normal text-amber-600">
                          Waiting for credits
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {showDraftPreview ? (
        <Card className="min-h-0 flex-1 py-0">
          <CardHeader className="border-b border-border px-4 py-3">
            <CardTitle className="text-sm font-medium">
              {showSceneList ? "Scenes" : "Draft preview"}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto p-0">
            {markers.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Scenes will appear here as the draft is built.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {markers.map((marker, index) => (
                  <li
                    key={marker.id}
                    className="flex items-start gap-3 px-4 py-3 text-sm"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {marker.label ?? marker.callout?.text ?? `Scene ${index + 1}`}
                      </p>
                      {marker.callout?.subtext ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {marker.callout.subtext}
                        </p>
                      ) : null}
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {formatMs(marker.startMs)} · {Math.round(marker.durationMs / 1000)}s
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
