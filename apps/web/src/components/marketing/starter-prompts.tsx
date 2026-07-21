"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import {
  MotionStagger,
  MotionStaggerItem,
} from "@/components/marketing/motion/motion-stagger";
import type { StarterPrompt } from "@/lib/marketing/features";
import { cn } from "@/lib/utils";

type StarterPromptsProps = {
  prompts: StarterPrompt[];
  className?: string;
};

export function StarterPrompts({ prompts, className }: StarterPromptsProps) {
  return (
    <section
      id="use-cases"
      className={cn("scroll-mt-24 py-20 sm:py-28", className)}
    >
      <div className="marketing-container">
        <MotionReveal className="mb-10 max-w-2xl">
          <p className="text-[12px] font-semibold uppercase text-marketing-subtle">
            Start with the outcome
          </p>
          <h2 className="marketing-heading mt-3 text-[2.5rem] leading-tight sm:text-[3.25rem]">
            One studio for every product moment.
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-marketing-muted">
            Choose the job you need done. Arco gives you a focused starting
            brief without locking the result into a generic template.
          </p>
        </MotionReveal>

        <MotionStagger
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.06}
        >
          {prompts.map((prompt) => (
            <MotionStaggerItem key={prompt.title}>
              <Link
                href={prompt.href}
                className="group flex h-full min-h-44 flex-col border border-marketing-border bg-marketing-surface p-5 transition-[border-color,background-color,transform] hover:-translate-y-1 hover:border-marketing-border-strong hover:bg-marketing-elevated"
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
                <span className="mt-auto pt-6 text-[12px] font-medium text-marketing-subtle group-hover:text-foreground">
                  Start this brief
                </span>
              </Link>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
