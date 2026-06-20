"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { AnimatedGradient } from "@/components/marketing/motion/animated-gradient";
import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionText } from "@/components/marketing/motion/motion-text";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type CtaBandProps = {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
};

export function CtaBand({
  title,
  description,
  primaryCta = { label: "Get started free", href: "/signup" },
  secondaryCta,
  className,
}: CtaBandProps) {
  const reduced = useReducedMotion();

  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <div className="marketing-container">
        <MotionReveal variant="scale-in">
          <div className="relative overflow-hidden rounded-2xl border border-marketing-border bg-marketing-surface px-8 py-16 text-center sm:px-16">
            <AnimatedGradient className="opacity-60" />
            <div className="relative">
              <MotionText
                as="h2"
                text={title}
                className="marketing-heading text-[2rem] sm:text-[2.5rem]"
              />
              <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-marketing-muted">
                {description}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
                  <Button size="lg" render={<Link href={primaryCta.href} />}>
                    {primaryCta.label}
                  </Button>
                </motion.div>
                {secondaryCta ? (
                  <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-marketing-border bg-transparent"
                      render={<Link href={secondaryCta.href} />}
                    >
                      {secondaryCta.label}
                      <ArrowRight className="size-4" data-icon="inline-end" />
                    </Button>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
