import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeaderSkeleton({
  className,
  withAction = false,
}: {
  className?: string;
  withAction?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {withAction ? <Skeleton className="h-9 w-28" /> : null}
    </div>
  );
}

export function StatCardsSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        count >= 4 ? "lg:grid-cols-4" : count === 3 ? "sm:grid-cols-3" : null,
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-video w-full rounded-none rounded-t-2xl" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ListRowSkeleton({
  withMedia = false,
}: {
  withMedia?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      {withMedia ? (
        <Skeleton className="hidden h-14 w-24 shrink-0 sm:block" />
      ) : (
        <Skeleton className="size-9 shrink-0 rounded-xl" />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-16 shrink-0" />
    </div>
  );
}

export function FullPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col gap-6 p-6 md:p-8",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <Skeleton className="min-h-[50vh] flex-1 w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-10"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="space-y-3 rounded-2xl border p-4">
        <Skeleton className="h-28 w-full" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className="rounded-2xl border">
        <div className="flex items-center justify-between border-b p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-3 p-6">
          <ListRowSkeleton withMedia />
          <ListRowSkeleton withMedia />
          <ListRowSkeleton withMedia />
        </div>
      </div>
    </div>
  );
}

export function ProjectsListSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading projects">
      <StatCardsSkeleton />
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      role="status"
      aria-label="Loading project"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-8" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border p-6 lg:col-span-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="aspect-video w-full" />
        </div>
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border p-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3 rounded-2xl border p-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetsPageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      role="status"
      aria-label="Loading assets"
    >
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-full sm:w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border p-6">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingPageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      role="status"
      aria-label="Loading billing"
    >
      <PageHeaderSkeleton />
      <div className="rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border p-6">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsagePageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      role="status"
      aria-label="Loading usage"
    >
      <PageHeaderSkeleton withAction />
      <StatCardsSkeleton />
      <div className="space-y-4 rounded-2xl border p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border p-6">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-52" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReferralsPageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      role="status"
      aria-label="Loading referrals"
    >
      <PageHeaderSkeleton />
      <div className="space-y-4 rounded-2xl border p-6">
        <Skeleton className="h-5 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <StatCardsSkeleton count={3} className="sm:grid-cols-3" />
      <div className="space-y-3 rounded-2xl border p-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
        <ListRowSkeleton />
        <ListRowSkeleton />
        <ListRowSkeleton />
      </div>
    </div>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-8"
      role="status"
      aria-label="Loading notifications"
    >
      <PageHeaderSkeleton />
      <Skeleton className="h-9 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-2xl border p-4"
          >
            <Skeleton className="size-9 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SessionsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading sessions">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-xl border p-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function InlineContentSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
