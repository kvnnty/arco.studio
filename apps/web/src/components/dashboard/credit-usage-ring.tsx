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
      // `size-full` is required so Button's `[&_svg:not([class*='size-'])]:size-4`
      // does not shrink the ring to 16px and pin it to the top-left.
      className={cn(
        "pointer-events-none absolute inset-0 size-full -rotate-90",
        className,
      )}
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

/** Outer box matches topbar icon-sm (size-8). */
const PROFILE_SIZE = 32;
const PROFILE_STROKE = 2;
/**
 * Avatar inset so the ring stroke sits on its circumference
 * (stroke width + 1px gap).
 */
const AVATAR_INSET = PROFILE_STROKE + 1;
const AVATAR_SIZE = PROFILE_SIZE - AVATAR_INSET * 2;

/** Avatar with usage ring on its circumference; percentage overlays on parent hover. */
export function ProfileUsageAvatar({
  initials,
  usedPercent,
  showUsage = true,
}: ProfileUsageAvatarProps) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: PROFILE_SIZE, height: PROFILE_SIZE }}
    >
      {showUsage ? (
        <UsageRingSvg
          size={PROFILE_SIZE}
          strokeWidth={PROFILE_STROKE}
          value={usedPercent}
        />
      ) : null}

      <Avatar
        className="absolute top-1/2 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2 after:border-0"
        style={{
          width: showUsage ? AVATAR_SIZE : PROFILE_SIZE,
          height: showUsage ? AVATAR_SIZE : PROFILE_SIZE,
        }}
      >
        <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showUsage ? (
        <span
          data-slot="usage-pct"
          className="pointer-events-none absolute top-1/2 left-1/2 z-2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[10px] font-semibold tabular-nums leading-none text-primary-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          aria-hidden
        >
          {usedPercent}%
        </span>
      ) : null}
    </div>
  );
}
