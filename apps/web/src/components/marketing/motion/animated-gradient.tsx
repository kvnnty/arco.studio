"use client";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type AnimatedGradientProps = {
  className?: string;
};

export function AnimatedGradient({ className }: AnimatedGradientProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={cn("marketing-glow pointer-events-none absolute inset-0", className)} />;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="marketing-glow absolute inset-0" />
      <motion.div
        className="absolute -top-1/2 left-1/4 size-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(66 100% 50% / 0.15), transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 top-1/3 size-[400px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(66 100% 50% / 0.1), transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
