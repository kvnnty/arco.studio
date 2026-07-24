"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import { productOwnerPitch } from "@/lib/marketing/video-types";
import { cn } from "@/lib/utils";

type ProductOwnerSectionProps = {
  className?: string;
};

export function ProductOwnerSection({ className }: ProductOwnerSectionProps) {
  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <div className="marketing-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeader
            eyebrow={productOwnerPitch.eyebrow}
            title={productOwnerPitch.title}
            description={productOwnerPitch.description}
            align="left"
          />

          <MotionStagger className="space-y-4">
            {productOwnerPitch.bullets.map((bullet) => (
              <MotionStaggerItem key={bullet}>
                <div className="flex items-start gap-3 rounded-xl border border-marketing-border bg-marketing-surface px-5 py-4">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  <p className="text-[15px] leading-relaxed text-marketing-muted">
                    {bullet}
                  </p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>

        <MotionReveal variant="fade-in" delay={0.2} className="mt-12">
          <Button size="lg" render={<Link href="/sign-up" />}>
            Start without hiring
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </MotionReveal>
      </div>
    </section>
  );
}
