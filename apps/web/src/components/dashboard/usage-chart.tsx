"use client";

import { cn } from "@/lib/utils";

type UsageChartProps = {
  data: Array<{ day: string; credits: number }>;
  className?: string;
};

export function UsageChart({ data, className }: UsageChartProps) {
  const max = Math.max(...data.map((d) => d.credits));

  return (
    <div className={cn("flex h-48 items-end gap-2", className)}>
      {data.map((item) => {
        const height = max > 0 ? (item.credits / max) * 100 : 0;
        return (
          <div
            key={item.day}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-lg bg-primary/80 transition-all hover:bg-primary"
                style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.day}</span>
          </div>
        );
      })}
    </div>
  );
}
