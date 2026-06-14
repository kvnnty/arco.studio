import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/mock/data";

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "border-border bg-muted text-muted-foreground",
  },
  processing: {
    label: "Processing",
    className: "border-[#55b3ff]/30 bg-[#55b3ff]/10 text-[#55b3ff]",
  },
  completed: {
    label: "Completed",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
};

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {status === "processing" ? (
        <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current" />
      ) : null}
      {config.label}
    </Badge>
  );
}
