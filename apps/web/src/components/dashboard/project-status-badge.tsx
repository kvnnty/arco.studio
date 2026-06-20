import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/mock/data";

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  draft: {
    label: "Draft",
    className: "border-border bg-muted text-muted-foreground",
  },
  analyzing: {
    label: "Analyzing",
    className: "border-[#55b3ff]/30 bg-[#55b3ff]/10 text-[#55b3ff]",
    pulse: true,
  },
  processing: {
    label: "Exporting",
    className: "border-[#55b3ff]/30 bg-[#55b3ff]/10 text-[#55b3ff]",
    pulse: true,
  },
  completed: {
    label: "Completed",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  failed: {
    label: "Failed",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
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
      {config.pulse ? (
        <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current" />
      ) : null}
      {config.label}
    </Badge>
  );
}
