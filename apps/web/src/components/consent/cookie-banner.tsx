"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { useConsent } from "@/components/consent/consent-provider";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { transitionMedium } from "@/lib/motion/presets";

const bannerMotion = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0 },
};

export function CookieBanner() {
  const reduced = useReducedMotion();
  const { showBanner, acceptAll, rejectNonEssential, openPreferences } =
    useConsent();

  return (
    <AnimatePresence>
      {showBanner ? (
        <motion.div
          key="cookie-banner"
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[100] border border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:inset-x-0 sm:bottom-0 sm:border-x-0 sm:border-b-0 sm:p-6"
          initial={reduced ? false : "hidden"}
          animate="visible"
          exit={reduced ? undefined : "hidden"}
          variants={bannerMotion}
          transition={transitionMedium}
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">
                We use cookies
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Essential cookies keep Arco secure.{" "}
                <span className="sm:hidden">
                  Optional analytics stay off unless you accept.
                </span>
                <span className="hidden sm:inline">
                  With your consent, analytics and error monitoring help us
                  improve the product. See our{" "}
                  <Link
                    href="/cookies"
                    className="underline hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2 sm:flex sm:items-center">
              <Button variant="outline" size="sm" onClick={openPreferences}>
                <span className="sm:hidden">Settings</span>
                <span className="hidden sm:inline">Customize</span>
              </Button>
              <Button variant="outline" size="sm" onClick={rejectNonEssential}>
                <span className="sm:hidden">Reject</span>
                <span className="hidden sm:inline">Reject non-essential</span>
              </Button>
              <Button size="sm" onClick={acceptAll}>
                <span className="sm:hidden">Accept</span>
                <span className="hidden sm:inline">Accept all</span>
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
