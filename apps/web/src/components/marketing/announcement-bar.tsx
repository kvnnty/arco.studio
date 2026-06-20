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
      className="border-b border-marketing-border bg-secondary text relative z-50"
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={fadeUp}
      transition={transitionMedium}
    >
      <div className="marketing-container flex items-center justify-center gap-2 py-2.5 text-center text-[13px]">
        <span className="text-secondary-foreground">{announcement.message}</span>
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
