"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CirclePlay } from "lucide-react";

import { AnimatedGradient } from "@/components/marketing/motion/animated-gradient";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { galleryFeatured } from "@/lib/marketing/gallery";
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

export function Hero({
  title,
  titleAccent,
  description,
  primaryCta = { label: "Start a video", href: "/sign-up" },
  secondaryCta = { label: "View gallery", href: "/gallery" },
  className,
}: HeroProps) {
  const reduced = useReducedMotion();

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-marketing-border py-14 sm:py-20 lg:py-24",
        className,
      )}
    >
      <AnimatedGradient />

      <motion.div
        className="marketing-container relative flex flex-col"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.1, 0.05)}
      >
        <div className="max-w-3xl">
          <motion.p
            className="text-[12px] font-semibold uppercase tracking-[0.14em] text-marketing-subtle"
            variants={fadeUp}
          >
            Product launch videos
          </motion.p>

          <motion.h1
            className="marketing-title-hero mt-5"
            variants={fadeUp}
          >
            {title}
            {titleAccent ? (
              <span className="block text-primary">{titleAccent}</span>
            ) : null}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-marketing-muted sm:text-[17px]"
            variants={fadeUp}
            transition={{ ...transitionMedium, delay: 0.18 }}
          >
            {description}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
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
              className="border-marketing-border bg-marketing-bg/80 backdrop-blur-sm"
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
          <div className="marketing-media overflow-hidden border border-marketing-border bg-[#0c0c0d] shadow-[0_24px_64px_-32px_rgba(0,0,0,0.45)]">
            <video
              className="aspect-video w-full bg-black object-cover"
              src={galleryFeatured.src}
              autoPlay={!reduced}
              muted
              loop
              playsInline
              preload="auto"
              aria-label={`${galleryFeatured.name} ${galleryFeatured.type} made with Arco`}
            />
          </div>
          <p className="mt-3 text-[12px] text-marketing-subtle">
            Sample output · {galleryFeatured.name} · 1080p
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
