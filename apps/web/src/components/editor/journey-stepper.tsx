import type { JourneyStep } from "@/lib/editor/create-project";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS: { id: JourneyStep; label: string }[] = [
  { id: "create", label: "Create" },
  { id: "upload", label: "Upload" },
  { id: "analyzing", label: "Analyze" },
  { id: "draft", label: "Draft" },
  { id: "edit", label: "Edit" },
];

const ORDER: JourneyStep[] = [
  "create",
  "upload",
  "analyzing",
  "draft",
  "edit",
];

type JourneyStepperProps = {
  current: JourneyStep;
  className?: string;
};

export function JourneyStepper({ current, className }: JourneyStepperProps) {
  const currentIndex = ORDER.indexOf(current);

  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = step.id === current;

        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="hidden text-border sm:inline">→</span>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                active && "border-accent-foreground/40 bg-accent text-accent-foreground",
                done && "border-border bg-muted/40 text-foreground",
                !active && !done && "border-border",
              )}
            >
              {done ? <Check className="size-3" /> : null}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
