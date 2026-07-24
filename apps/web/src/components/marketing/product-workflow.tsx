"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import {
  MotionStagger,
  MotionStaggerItem,
} from "@/components/marketing/motion/motion-stagger";
import { Button } from "@/components/ui/button";
import { workflowSteps } from "@/lib/marketing/features";

export function ProductWorkflow() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-marketing-border bg-marketing-surface py-20 sm:py-28"
    >
      <div className="marketing-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <MotionReveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[12px] font-semibold uppercase text-marketing-subtle">
            From source to story
          </p>
          <h2 className="marketing-title-section-lg mt-3 max-w-md">
            Creative direction without the production drag.
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-marketing-muted">
            Start with the product you already built. Arco turns your interface
            and brief into a structured first cut, then gives you control over
            the parts that matter.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-8 border-marketing-border bg-marketing-bg"
            render={<Link href="/features" />}
          >
            Explore the workflow
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </MotionReveal>

        <MotionStagger className="border-t border-marketing-border">
          {workflowSteps.map((step) => (
            <MotionStaggerItem key={step.step}>
              <div className="grid gap-4 border-b border-marketing-border py-7 sm:grid-cols-[72px_1fr] sm:py-9">
                <span className="text-[13px] font-semibold text-primary">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-[23px] font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-marketing-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
