import type { Transition, Variants } from "framer-motion";

export const easeOut = [0.25, 0.1, 0.25, 1] as const;

export const springSnappy = {
  type: "spring",
  stiffness: 400,
  damping: 30,
} satisfies Transition;

export const transitionFast: Transition = {
  duration: 0.45,
  ease: easeOut,
};

export const transitionMedium: Transition = {
  duration: 0.6,
  ease: easeOut,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)" },
};

export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
};

export const noMotionVariants: Variants = {
  hidden: {},
  visible: {},
};
