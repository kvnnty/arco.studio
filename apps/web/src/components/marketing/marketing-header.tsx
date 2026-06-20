"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { transitionMedium } from "@/lib/motion/presets";
import { mainNav } from "@/lib/marketing/site-config";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-marketing-border bg-marketing-header-bg backdrop-blur-xl"
      initial={reduced ? false : { y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={transitionMedium}
    >
      <div className="marketing-container flex h-16 items-center justify-between">
        <MarketingLogo
          className="h-7 w-24 sm:h-8 sm:w-28"
          priority
        />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {mainNav.map((item, i) => (
            <motion.div
              key={item.href}
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transitionMedium, delay: 0.05 + i * 0.04 }}
            >
              <Link
                href={item.href}
                className="text-[13px] font-medium text-marketing-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--marketing-muted)] hover:text-foreground"
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
          <Button size="sm" render={<Link href="/signup" />}>
            Get started
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-[var(--marketing-muted)] transition-colors hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-[var(--marketing-border)] md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <nav className="marketing-container flex flex-col gap-1 py-4" aria-label="Mobile">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-marketing-muted transition-colors hover:bg-marketing-hover hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--marketing-border)] pt-4">
            <Button
              variant="outline"
              className="w-full border-[var(--marketing-border)] bg-transparent"
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button className="w-full" render={<Link href="/signup" />}>
              Get started
            </Button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
