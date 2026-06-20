"use client";

import { MotionCard } from "@/components/marketing/motion/motion-card";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

type TestimonialGridProps = {
  testimonials: Testimonial[];
};

export function TestimonialGrid({ testimonials }: TestimonialGridProps) {
  return (
    <MotionStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <MotionStaggerItem key={t.author}>
          <MotionCard className="flex h-full flex-col rounded-2xl border border-marketing-border bg-marketing-surface p-6">
            <blockquote className="flex-1 text-[15px] leading-relaxed text-marketing-muted">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 border-t border-marketing-border pt-4">
              <p className="text-[14px] font-semibold text-foreground">{t.author}</p>
              <p className="text-[13px] text-marketing-subtle">{t.role}</p>
            </figcaption>
          </MotionCard>
        </MotionStaggerItem>
      ))}
    </MotionStagger>
  );
}
