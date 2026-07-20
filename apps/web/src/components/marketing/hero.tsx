"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CirclePlay } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  fadeUp,
  staggerContainer,
  transitionMedium,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type HeroProps = {
  title: string;
  titleAccent?: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
};

const HERO_VIDEO =
  "https://storage.googleapis.com/motion-studio-assets/studio/mosaic-launch.mp4";

export function Hero({
  title,
  titleAccent,
  description,
  primaryCta = { label: "Create your first video", href: "/signup" },
  secondaryCta = { label: "Watch examples", href: "#examples" },
  className,
}: HeroProps) {
  const reduced = useReducedMotion();

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-marketing-border py-12 sm:py-16 lg:py-20",
        className,
      )}
    >
      <motion.div
        className="marketing-container relative flex flex-col"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.1, 0.05)}
      >
        <div className="max-w-4xl">
          <motion.div
            className="mb-6 inline-flex w-fit items-center gap-2 border border-marketing-border bg-marketing-surface px-3 py-1.5 text-[12px] font-medium text-marketing-muted"
            variants={fadeUp}
          >
            <span className="size-1.5 rounded-full bg-primary" />
            Product motion studio
          </motion.div>

          <motion.h1
            className="marketing-heading text-[3.25rem] leading-[0.98] sm:text-[4.5rem] lg:text-[5.25rem]"
            variants={fadeUp}
          >
            {title}
            {titleAccent ? (
              <span className="block text-marketing-muted">{titleAccent}</span>
            ) : null}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-marketing-muted sm:text-[18px]"
            variants={fadeUp}
            transition={{ ...transitionMedium, delay: 0.18 }}
          >
            {description}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            variants={fadeUp}
            transition={{ ...transitionMedium, delay: 0.25 }}
          >
            <Button size="lg" render={<Link href={primaryCta.href} />}>
              {primaryCta.label}
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-marketing-border bg-transparent"
              render={<Link href={secondaryCta.href} />}
            >
              <CirclePlay className="size-4" data-icon="inline-start" />
              {secondaryCta.label}
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative mt-10 w-full sm:mt-12"
          variants={fadeUp}
          transition={{ ...transitionMedium, delay: 0.15 }}
        >
          <div className="overflow-hidden border border-white/10 bg-[#0c0c0d] shadow-[0_28px_80px_-34px_rgba(0,0,0,0.55)]">
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-4 text-[11px] text-white/60">
              <span>Arco output / Mosaic launch</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Playing
              </span>
            </div>
            <video
              className="aspect-video w-full bg-black object-cover"
              src={HERO_VIDEO}
              autoPlay={!reduced}
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Mosaic product launch video created with Arco"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-marketing-subtle">
            <span>Real product UI. Directed motion.</span>
            <span>1080p export</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
