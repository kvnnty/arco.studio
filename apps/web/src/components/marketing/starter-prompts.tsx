"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import type { StarterPrompt } from "@/lib/marketing/features";
import { cn } from "@/lib/utils";

type StarterPromptsProps = {
  prompts: StarterPrompt[];
  className?: string;
};

export function StarterPrompts({ prompts, className }: StarterPromptsProps) {
  return (
    <section className={cn("pb-16 sm:pb-20", className)}>
      <div className="marketing-container">
        <MotionReveal className="mb-6 text-center">
          <p className="text-[14px] text-marketing-muted">Not sure where to start?</p>
        </MotionReveal>

        <MotionStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {prompts.map((prompt) => (
            <MotionStaggerItem key={prompt.title}>
              <Link
                href={prompt.href}
                className="group flex h-full flex-col rounded-(--marketing-radius) border border-marketing-border bg-marketing-surface p-5 transition-colors hover:border-marketing-border-strong hover:bg-marketing-elevated"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-foreground">
                    {prompt.title}
                  </h3>
                  <ArrowUpRight className="size-4 shrink-0 text-marketing-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-marketing-muted">
                  {prompt.description}
                </p>
              </Link>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
