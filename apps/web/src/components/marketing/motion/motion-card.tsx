"use client";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { springSnappy } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type MotionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function MotionCard({ children, className }: MotionCardProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      whileHover={{ y: -4, transition: springSnappy }}
      whileTap={{ scale: 0.995 }}
    >
      {children}
    </motion.div>
  );
}
