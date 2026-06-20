"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { AnimatedGradient } from "@/components/marketing/motion/animated-gradient";
import { MotionText } from "@/components/marketing/motion/motion-text";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, staggerContainer, transitionMedium } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type HeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  features?: string[];
  className?: string;
};

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta = { label: "Get started free", href: "/signup" },
  secondaryCta = { label: "View pricing", href: "/pricing" },
  features,
  className,
}: HeroProps) {
  const reduced = useReducedMotion();

  return (
    <section className={cn("relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32", className)}>
      <AnimatedGradient />
      <div className="marketing-grid-bg pointer-events-none absolute inset-0 opacity-50" />

      <motion.div
        className="marketing-container relative"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.1, 0.05)}
      >
        {eyebrow ? (
          <motion.p
            className="mb-6 inline-flex items-center rounded-full border border-marketing-border bg-marketing-elevated px-3 py-1 text-[12px] font-medium tracking-wide text-marketing-muted"
            variants={fadeUp}
            transition={transitionMedium}
          >
            {eyebrow}
          </motion.p>
        ) : null}

        <MotionText
          as="h1"
          text={title}
          className="marketing-heading max-w-3xl text-[2.5rem] leading-[1.1] sm:text-[3.5rem] lg:text-[4rem]"
          delay={0.1}
        />

        <motion.p
          className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-marketing-muted sm:text-[18px]"
          variants={fadeUp}
          transition={{ ...transitionMedium, delay: 0.35 }}
        >
          {description}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          variants={fadeUp}
          transition={{ ...transitionMedium, delay: 0.45 }}
        >
          <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
            <Button size="lg" render={<Link href={primaryCta.href} />}>
              {primaryCta.label}
            </Button>
          </motion.div>
          <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
            <Button
              variant="outline"
              size="lg"
              className="border-marketing-border bg-transparent text-foreground hover:bg-marketing-hover"
              render={<Link href={secondaryCta.href} />}
            >
              {secondaryCta.label}
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </motion.div>
        </motion.div>

        {features && features.length > 0 ? (
          <motion.ul
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
            variants={staggerContainer(0.06, 0.55)}
            initial={reduced ? false : "hidden"}
            animate="visible"
          >
            {features.map((feature) => (
              <motion.li
                key={feature}
                className="flex items-center gap-2 text-[13px] text-marketing-muted"
                variants={fadeUp}
                transition={transitionMedium}
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {feature}
              </motion.li>
            ))}
          </motion.ul>
        ) : null}
      </motion.div>
    </section>
  );
}
