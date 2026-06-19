"use client";

import type { Marker } from "@arco/project-schema";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { JourneyStepper } from "@/components/editor/journey-stepper";
import {
  ANALYSIS_STEPS,
  runAnalysis,
  type DraftAnalysisResult,
} from "@/lib/editor/analyze-recording";
import { formatMs } from "@/lib/editor/format-time";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type AnalysisScreenProps = {
  projectTitle: string;
  platform: string;
  durationMs: number;
  onComplete: (result: DraftAnalysisResult) => void;
};

export function AnalysisScreen({
  projectTitle,
  platform,
  durationMs,
  onComplete,
}: AnalysisScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [detected, setDetected] = useState<Marker[]>([]);

  useEffect(() => {
    let cancelled = false;

    void runAnalysis(
      (index, markers) => {
        if (cancelled) return;
        setStepIndex(index);
        setDetected(markers);
      },
      {
        title: projectTitle,
        durationMs,
        platform,
      },
    ).then((result) => {
      if (!cancelled) onComplete(result);
    });

    return () => {
      cancelled = true;
    };
  }, [durationMs, onComplete, platform, projectTitle]);

  const progress = ((stepIndex + 1) / ANALYSIS_STEPS.length) * 100;
  const currentStep = ANALYSIS_STEPS[stepIndex];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:px-8">
      <JourneyStepper current="analyzing" className="mb-8" />

      <Badge variant="outline" className="w-fit text-accent-foreground">
        Step 3 · AI analysis
      </Badge>
      <div className="mt-4 flex items-center gap-3">
        <Sparkles className="size-6 text-accent-foreground" />
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">
          Analyzing your recording
        </h1>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Arco is detecting clicks, cursor movement, pauses, and page transitions.
      </p>

      <Card className="mt-10">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{currentStep?.label ?? "Analyzing…"}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <ul className="space-y-2">
            {ANALYSIS_STEPS.map((step, index) => (
              <li
                key={step.id}
                className={
                  index <= stepIndex
                    ? "text-sm text-foreground"
                    : "text-sm text-muted-foreground"
                }
              >
                {index < stepIndex ? "✓" : index === stepIndex ? "→" : "·"}{" "}
                {step.label}
              </li>
            ))}
          </ul>

          {detected.length > 0 ? (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Markers detected
              </p>
              <ul className="space-y-1.5">
                {detected.map((marker) => (
                  <li
                    key={marker.id}
                    className="flex items-center justify-between font-mono text-xs"
                  >
                    <span>{formatMs(marker.startMs)}</span>
                    <span className="text-muted-foreground">
                      {marker.label ?? marker.callout?.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
