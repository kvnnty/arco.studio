"use client";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, staggerContainer, transitionMedium } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type MotionStaggerProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
};

export function MotionStagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  once = true,
}: MotionStaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15, margin: "0px 0px -40px 0px" }}
      variants={staggerContainer(stagger, delay)}
    >
      {children}
    </motion.div>
  );
}

type MotionStaggerItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function MotionStaggerItem({ children, className }: MotionStaggerItemProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={fadeUp}
      transition={transitionMedium}
    >
      {children}
    </motion.div>
  );
}
