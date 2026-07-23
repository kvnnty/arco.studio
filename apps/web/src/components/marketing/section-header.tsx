"use client";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionText } from "@/components/marketing/motion/motion-text";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <MotionReveal
      className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}
    >
      <MotionText
        as="h2"
        text={title}
        className="marketing-title-section"
        delay={0.05}
      />
      {description ? (
        <MotionReveal variant="fade-in" delay={0.15} className="mt-4">
          <p className="text-pretty text-[16px] leading-relaxed text-marketing-muted">
            {description}
          </p>
        </MotionReveal>
      ) : null}
    </MotionReveal>
  );
}
