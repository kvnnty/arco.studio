"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Film,
  Sparkles,
  Upload,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FORMAT_OPTIONS, STYLE_PRESETS } from "@/lib/mock/data";

const STEPS = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "format", label: "Format", icon: Film },
  { id: "style", label: "Style", icon: Sparkles },
  { id: "generate", label: "Generate", icon: Check },
];

function CreateProjectWizard() {
  const searchParams = useSearchParams();
  const initialStep = searchParams.get("step") ?? "upload";
  const [currentStep, setCurrentStep] = useState(
    STEPS.findIndex((s) => s.id === initialStep) >= 0
      ? STEPS.findIndex((s) => s.id === initialStep)
      : 0,
  );
  const [selectedFormat, setSelectedFormat] = useState("16:9");
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [fileName, setFileName] = useState<string | null>(null);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  function next() {
    if (!isLast) setCurrentStep((s) => s + 1);
  }

  function back() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/dashboard/projects" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader
          title="New project"
          description="Upload a recording and configure your export."
          className="flex-1"
        />
      </div>

      <nav className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => i <= currentStep && setCurrentStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                i === currentStep
                  ? "bg-primary/10 font-medium text-primary"
                  : i < currentStep
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-lg text-xs",
                  i === currentStep
                    ? "bg-primary text-primary-foreground"
                    : i < currentStep
                      ? "bg-primary/20 text-primary"
                      : "bg-muted",
                )}
              >
                {i < currentStep ? <Check className="size-3" /> : i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 ? (
              <div
                className={cn(
                  "mx-1 h-px flex-1",
                  i < currentStep ? "bg-primary/40" : "bg-border",
                )}
              />
            ) : null}
          </div>
        ))}
      </nav>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">{step.label}</CardTitle>
          <CardDescription>
            {step.id === "upload" &&
              "Upload your screen recording to get started."}
            {step.id === "format" && "Choose the aspect ratio for your export."}
            {step.id === "style" && "Select a motion style preset."}
            {step.id === "generate" && "Review and generate your video."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step.id === "upload" && (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <Upload className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {fileName ?? "Drop your recording here"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                MP4, MOV up to 500MB
              </p>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) =>
                  setFileName(e.target.files?.[0]?.name ?? null)
                }
              />
            </label>
          )}

          {step.id === "format" && (
            <div className="grid gap-3 sm:grid-cols-3">
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    selectedFormat === fmt.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30",
                  )}
                >
                  <p className="font-medium">{fmt.label}</p>
                  <p className="text-xs text-muted-foreground">{fmt.ratio}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {fmt.description}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step.id === "style" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedStyle(preset.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    selectedStyle === preset.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30",
                  )}
                >
                  <p className="font-medium">{preset.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step.id === "generate" && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Recording</span>
                  <span>{fileName ?? "Not uploaded"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Format</span>
                  <span>{selectedFormat}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Style</span>
                  <span className="capitalize">{selectedStyle}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">
                    Estimated credits
                  </span>
                  <span>~25 credits</span>
                </div>
              </div>
              <Button className="w-full" disabled>
                <Sparkles data-icon="inline-start" />
                Generate video (coming soon)
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Video generation engine is not connected yet. This wizard
                previews the full creation flow.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLast && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={back} disabled={currentStep === 0}>
            Back
          </Button>
          <Button onClick={next} disabled={step.id === "upload" && !fileName}>
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CreateProjectPage() {
  return (
    <Suspense>
      <CreateProjectWizard />
    </Suspense>
  );
}
