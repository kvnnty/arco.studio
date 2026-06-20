"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  fadeIn,
  fadeUp,
  scaleIn,
  slideInLeft,
  transitionMedium,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type RevealVariant = "fade-up" | "fade-in" | "scale-in" | "slide-left";

const variantMap: Record<RevealVariant, Variants> = {
  "fade-up": fadeUp,
  "fade-in": fadeIn,
  "scale-in": scaleIn,
  "slide-left": slideInLeft,
};

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  once?: boolean;
  amount?: number;
};

export function MotionReveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  once = true,
  amount = 0.2,
}: MotionRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -40px 0px" }}
      variants={variantMap[variant]}
      transition={{ ...transitionMedium, delay }}
    >
      {children}
    </motion.div>
  );
}
