import { Badge } from "@/components/ui/badge";

export function LastUsedBadge({ show = false }: { show?: boolean }) {
  if (!show) return null;

  return (
    <Badge
      variant="secondary"
      className="pointer-events-none absolute -top-2.5 right-2 h-auto px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide"
    >
      Last used
    </Badge>
  );
}
