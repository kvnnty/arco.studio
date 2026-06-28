"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { MotionCard } from "@/components/marketing/motion/motion-card";
import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import {
  VIDEO_TYPES,
  videoTypesMarketing,
} from "@/lib/marketing/video-types";
import { cn } from "@/lib/utils";

type VideoTypesSectionProps = {
  className?: string;
  showCta?: boolean;
};

export function VideoTypesSection({
  className,
  showCta = true,
}: VideoTypesSectionProps) {
  return (
    <section
      className={cn(
        "border-y border-marketing-border bg-marketing-surface py-24 sm:py-32",
        className,
      )}
    >
      <div className="marketing-container">
        <SectionHeader
          eyebrow={videoTypesMarketing.eyebrow}
          title={videoTypesMarketing.title}
          description={videoTypesMarketing.description}
        />

        <MotionStagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEO_TYPES.map((type) => (
            <MotionStaggerItem key={type.id}>
              <MotionCard className="flex h-full flex-col rounded-2xl border border-marketing-border bg-marketing-bg p-6 transition-colors hover:border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[16px] font-semibold text-foreground">
                    {type.label}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-marketing-border bg-marketing-elevated px-2.5 py-0.5 text-[11px] font-medium text-marketing-muted">
                    <Clock className="size-3" />
                    {type.duration}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-marketing-subtle">
                  {type.tagline}
                </p>
                <blockquote className="mt-4 flex-1 border-l-2 border-primary/40 pl-3 text-[14px] leading-relaxed text-marketing-muted">
                  &ldquo;{type.examplePrompt}&rdquo;
                </blockquote>
              </MotionCard>
            </MotionStaggerItem>
          ))}
        </MotionStagger>

        <MotionReveal variant="fade-in" delay={0.15} className="mt-12 text-center">
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-marketing-muted">
            {videoTypesMarketing.footnote}
          </p>
          {showCta ? (
            <div className="mt-8">
              <Button size="lg" render={<Link href="/signup" />}>
                Make your first video
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </div>
          ) : null}
        </MotionReveal>
      </div>
    </section>
  );
}
