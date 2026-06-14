import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 transition-colors hover:bg-card/80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon ? (
          <div className="flex size-8 items-center justify-center rounded-xl bg-accent">
            <Icon className="size-4 text-accent-foreground" />
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {(description || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend ? (
            <span
              className={cn(
                "font-medium",
                trend.positive ? "text-[#5fc992]" : "text-muted-foreground",
              )}
            >
              {trend.value}
            </span>
          ) : null}
          {description ? (
            <span className="text-muted-foreground">{description}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
