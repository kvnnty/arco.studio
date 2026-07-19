import { PageHeaderSkeleton } from "@/components/dashboard/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-8"
      role="status"
      aria-label="Loading settings"
    >
      <PageHeaderSkeleton />
      <Skeleton className="h-9 w-72" />
      <div className="space-y-4 rounded-2xl border p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
