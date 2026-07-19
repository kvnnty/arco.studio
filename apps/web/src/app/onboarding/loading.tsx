import { InlineContentSkeleton } from "@/components/dashboard/page-skeletons";

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <InlineContentSkeleton className="w-full max-w-sm" lines={5} />
    </div>
  );
}
