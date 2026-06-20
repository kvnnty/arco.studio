"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { transitionMedium } from "@/lib/motion/presets";

export function HeroPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  return (
    <MotionReveal variant="scale-in" className="marketing-container pb-8">
      <motion.div
        ref={ref}
        className="relative aspect-video overflow-hidden rounded-2xl border border-marketing-border bg-marketing-surface"
        style={reduced ? undefined : { y, scale }}
        transition={transitionMedium}
      >
        <div className="marketing-glow absolute inset-0" />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={reduced ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <div className="ml-1 size-0 border-y-8 border-y-transparent border-l-[14px] border-l-primary" />
            </div>
            <p className="text-[14px] text-marketing-muted">Product demo preview</p>
          </div>
        </motion.div>
      </motion.div>
    </MotionReveal>
  );
}
