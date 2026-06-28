"use client";

import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  VIDEO_BRIEF_HINT,
  VIDEO_TYPES,
} from "@/lib/marketing/video-types";
import { cn } from "@/lib/utils";

type BriefInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  showLabel?: boolean;
  className?: string;
};

export function BriefInput({
  id = "brief",
  value,
  onChange,
  disabled = false,
  rows = 3,
  showLabel = false,
  className,
}: BriefInputProps) {
  const content = (
    <>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Product Hunt launch, onboarding demo, feature announcement…"
        rows={rows}
        disabled={disabled}
        className={cn("min-h-[88px] resize-none", !showLabel && className)}
      />
      <FieldDescription>{VIDEO_BRIEF_HINT}</FieldDescription>
      <div className="flex flex-wrap gap-2">
        {VIDEO_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            disabled={disabled}
            title={`${type.duration} — ${type.examplePrompt}`}
            onClick={() => onChange(type.examplePrompt)}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Badge
              variant={value === type.examplePrompt ? "default" : "outline"}
              className="cursor-pointer px-2.5 py-1 text-[11px] font-normal"
            >
              {type.label}
              <span className="text-muted-foreground"> · {type.duration}</span>
            </Badge>
          </button>
        ))}
      </div>
    </>
  );

  if (!showLabel) {
    return <div className={cn("space-y-2", className)}>{content}</div>;
  }

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>What is this video for?</FieldLabel>
      <FieldContent className="space-y-2">{content}</FieldContent>
    </Field>
  );
}
