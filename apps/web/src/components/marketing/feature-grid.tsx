import type { LucideIcon } from "lucide-react";

import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import { cn } from "@/lib/utils";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type FeatureGridProps = {
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
  className?: string;
};

export function FeatureGrid({ features, columns = 3, className }: FeatureGridProps) {
  return (
    <MotionStagger
      className={cn(
        "grid gap-x-8 gap-y-10",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {features.map((feature) => (
        <MotionStaggerItem key={feature.title}>
          <div className="group">
            <div className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-4" />
            </div>
            <h3 className="text-[16px] font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-marketing-muted">
              {feature.description}
            </p>
          </div>
        </MotionStaggerItem>
      ))}
    </MotionStagger>
  );
}
