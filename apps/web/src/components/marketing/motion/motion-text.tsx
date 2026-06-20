"use client";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { staggerContainer, transitionFast } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type MotionTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  mode?: "words" | "lines";
  delay?: number;
};

const tagMap = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const;

export function MotionText({
  text,
  as = "h2",
  className,
  mode = "words",
  delay = 0,
}: MotionTextProps) {
  const reduced = useReducedMotion();
  const Component = tagMap[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }

  const segments = mode === "words" ? text.split(" ") : text.split("\n");

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.04, delay)}
      aria-label={text}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={`${segment}-${i}`}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: transitionFast,
            },
          }}
        >
          {segment}
          {mode === "words" && i < segments.length - 1 ? "\u00A0" : null}
          {mode === "lines" && i < segments.length - 1 ? <br /> : null}
        </motion.span>
      ))}
    </Component>
  );
}

type MotionGradientTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function MotionGradientText({ children, className }: MotionGradientTextProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={cn(
        "bg-gradient-to-r from-foreground via-foreground to-primary bg-[length:200%_auto] bg-clip-text",
        className,
      )}
      animate={{ backgroundPosition: ["0% center", "100% center", "0% center"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
    >
      {children}
    </motion.span>
  );
}
