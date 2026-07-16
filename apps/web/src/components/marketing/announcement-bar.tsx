"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, transitionMedium } from "@/lib/motion/presets";
import { announcement } from "@/lib/marketing/site-config";

export function AnnouncementBar() {
  const reduced = useReducedMotion();

  if (!announcement.enabled) return null;

  return (
    <motion.div
      className="relative z-50 border-b border-white/10 bg-secondary text-secondary-foreground"
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={fadeUp}
      transition={transitionMedium}
    >
      <div className="marketing-container flex items-center justify-center gap-2 py-2.5 text-center text-[13px]">
        {"badge" in announcement && announcement.badge ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {announcement.badge}
          </span>
        ) : null}
        <span className="text-white/80">{announcement.message}</span>
        <Link
          href={announcement.href}
          className="inline-flex items-center gap-1 font-medium text-primary transition-opacity hover:opacity-80"
        >
          {announcement.linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
