import type { LucideIcon } from "lucide-react";

import { MotionCard } from "@/components/marketing/motion/motion-card";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import { cn } from "@/lib/utils";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type FeatureGridProps = {
  features: FeatureItem[];
  columns?: 2 | 3;
  className?: string;
};

export function FeatureGrid({ features, columns = 3, className }: FeatureGridProps) {
  return (
    <MotionStagger
      className={cn(
        "grid gap-6",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {features.map((feature) => (
        <MotionStaggerItem key={feature.title}>
          <MotionCard className="group rounded-2xl border border-marketing-border bg-marketing-surface p-6 transition-colors hover:border-marketing-border-strong">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
              <feature.icon className="size-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-marketing-muted">
              {feature.description}
            </p>
          </MotionCard>
        </MotionStaggerItem>
      ))}
    </MotionStagger>
  );
}
