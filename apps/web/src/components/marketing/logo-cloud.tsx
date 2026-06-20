"use client";

import { motion } from "framer-motion";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type LogoCloudProps = {
  logos: string[];
  label?: string;
};

export function LogoCloud({
  logos,
  label = "Trusted by product teams at",
}: LogoCloudProps) {
  const reduced = useReducedMotion();

  return (
    <section className="border-y border-marketing-border py-12">
      <div className="marketing-container">
        <MotionReveal variant="fade-in">
          <p className="mb-8 text-center text-[12px] font-medium uppercase tracking-[0.12em] text-marketing-subtle">
            {label}
          </p>
        </MotionReveal>
        <MotionStagger className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <MotionStaggerItem key={logo}>
              <motion.span
                className="text-[15px] font-semibold tracking-tight text-marketing-subtle transition-colors hover:text-marketing-muted"
                whileHover={reduced ? undefined : { y: -2 }}
              >
                {logo}
              </motion.span>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
