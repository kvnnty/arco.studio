"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type OnboardingOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type OnboardingOptionGridProps = {
  options: OnboardingOption[];
  mode: "single" | "multi";
  value: string | string[];
  onChange: (value: string | string[]) => void;
  columns?: 2 | 3;
};

export function OnboardingOptionGrid({
  options,
  mode,
  value,
  onChange,
  columns = 3,
}: OnboardingOptionGridProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  function toggle(id: string) {
    if (mode === "single") {
      onChange(id);
      return;
    }

    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    onChange(next);
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border hover:border-primary/30 hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="text-[15px] font-medium leading-snug">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
