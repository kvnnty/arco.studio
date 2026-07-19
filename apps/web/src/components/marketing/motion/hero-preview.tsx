"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { transitionMedium } from "@/lib/motion/presets";

type HeroPreviewProps = {
  title?: string;
  description?: string;
};

export function HeroPreview({
  title = "See Arco in action",
  description = "From a short brief and a few screenshots to a launch-ready video in under a minute.",
}: HeroPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [16, -16]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.985, 1, 0.985]);

  return (
    <section className="pb-20 sm:pb-28">
      <div className="marketing-container">
        <MotionReveal className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="marketing-heading text-[2.25rem] sm:text-[3rem]">{title}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-marketing-muted">
            {description}
          </p>
        </MotionReveal>

        <MotionReveal variant="scale-in">
          <motion.div
            ref={ref}
            className="marketing-media relative aspect-video border border-marketing-border bg-marketing-surface shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]"
            style={reduced ? undefined : { y, scale }}
            transition={transitionMedium}
          >
            <Image
              src="/marketing/hero-product.jpg"
              alt="Product UI on a laptop — the kind of screen Arco turns into a launch video"
              fill
              className="object-cover"
              sizes="(max-width: 1120px) 100vw, 1120px"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />
          </motion.div>
        </MotionReveal>
      </div>
    </section>
  );
}
