import { NotFoundContent } from "@/components/errors/error-boundary";

export default function MarketingNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <NotFoundContent context="marketing" />
    </div>
  );
}
