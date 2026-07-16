"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionText } from "@/components/marketing/motion/motion-text";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type CtaBandProps = {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  className?: string;
};

export function CtaBand({
  title,
  description,
  primaryCta = { label: "Start a video", href: "/signup" },
  className,
}: CtaBandProps) {
  const reduced = useReducedMotion();

  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <div className="marketing-container">
        <MotionReveal>
          <div className="mx-auto max-w-2xl text-center">
            <MotionText
              as="h2"
              text={title}
              className="marketing-heading text-[2rem] sm:text-[2.75rem]"
            />
            <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-marketing-muted">
              {description}
            </p>
            <div className="mt-8 flex justify-center">
              <motion.div
                whileHover={reduced ? undefined : { scale: 1.02 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
              >
                <Button size="lg" render={<Link href={primaryCta.href} />}>
                  {primaryCta.label}
                </Button>
              </motion.div>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
