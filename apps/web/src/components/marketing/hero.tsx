"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { MotionText } from "@/components/marketing/motion/motion-text";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, staggerContainer, transitionMedium } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type HeroProps = {
  title: string;
  titleAccent?: string;
  description: string;
  primaryCta?: { label: string; href: string };
  className?: string;
};

export function Hero({
  title,
  titleAccent,
  description,
  primaryCta = { label: "Start a video", href: "/signup" },
  className,
}: HeroProps) {
  const reduced = useReducedMotion();

  return (
    <section
      className={cn(
        "relative pt-16 pb-10 sm:pt-24 sm:pb-14",
        className,
      )}
    >
      <motion.div
        className="marketing-container relative text-center"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.1, 0.05)}
      >
        <h1 className="marketing-heading mx-auto max-w-4xl text-[3.25rem] leading-[1.05] sm:text-[4.5rem] lg:text-[5.5rem]">
          <MotionText as="span" text={title} delay={0.08} className="inline" />
          {titleAccent ? (
            <>
              {" "}
              <MotionText
                as="span"
                text={titleAccent}
                delay={0.18}
                className="inline text-foreground"
              />
            </>
          ) : null}
        </h1>

        <motion.p
          className="mx-auto mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-marketing-muted sm:text-[18px]"
          variants={fadeUp}
          transition={{ ...transitionMedium, delay: 0.3 }}
        >
          {description}
        </motion.p>

        <motion.div
          className="mt-9 flex justify-center"
          variants={fadeUp}
          transition={{ ...transitionMedium, delay: 0.4 }}
        >
          <motion.div
            whileHover={reduced ? undefined : { scale: 1.02 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
          >
            <Button size="lg" render={<Link href={primaryCta.href} />}>
              {primaryCta.label}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
