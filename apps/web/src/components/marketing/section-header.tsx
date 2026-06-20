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
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <MotionReveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <MotionText
        as="h2"
        text={title}
        className="marketing-heading text-[2rem] leading-tight sm:text-[2.5rem]"
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
