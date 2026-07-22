"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type CreditUsageRingProps = {
  /** Used percentage 0–100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  progressClassName?: string;
};

function UsageRingSvg({
  size,
  strokeWidth,
  value,
  trackClassName,
  progressClassName,
  className,
}: {
  size: number;
  strokeWidth: number;
  value: number;
  trackClassName?: string;
  progressClassName?: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("pointer-events-none absolute inset-0 -rotate-90", className)}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={cn("text-primary/15", trackClassName)}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          "text-primary transition-[stroke-dashoffset] duration-500 ease-out",
          progressClassName,
        )}
      />
    </svg>
  );
}

/** Small standalone ring for dropdowns and labels. */
export function CreditUsageRing({
  value,
  size = 16,
  strokeWidth = 2,
  className,
  trackClassName,
  progressClassName,
}: CreditUsageRingProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped}% credits used`}
    >
      <UsageRingSvg
        size={size}
        strokeWidth={strokeWidth}
        value={value}
        trackClassName={trackClassName}
        progressClassName={progressClassName}
      />
    </div>
  );
}

type ProfileUsageAvatarProps = {
  initials: string;
  usedPercent: number;
  showUsage?: boolean;
};

const PROFILE_SIZE = 32;
const PROFILE_STROKE = 2.5;

/** Avatar with usage ring behind it; percentage overlays on parent hover. */
export function ProfileUsageAvatar({
  initials,
  usedPercent,
  showUsage = true,
}: ProfileUsageAvatarProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: PROFILE_SIZE, height: PROFILE_SIZE }}
    >
      {showUsage ? (
        <UsageRingSvg
          size={PROFILE_SIZE}
          strokeWidth={PROFILE_STROKE}
          value={usedPercent}
        />
      ) : null}

      <Avatar className="relative z-1 size-6 after:border-0">
        <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showUsage ? (
        <span
          data-slot="usage-pct"
          className="pointer-events-none absolute z-2 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold tabular-nums leading-none text-primary-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden
        >
          {usedPercent}%
        </span>
      ) : null}
    </div>
  );
}
