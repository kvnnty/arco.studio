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
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:p-6"
          initial={reduced ? false : "hidden"}
          animate="visible"
          exit={reduced ? undefined : "hidden"}
          variants={bannerMotion}
          transition={transitionMedium}
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">
                We use cookies
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                We use essential cookies for authentication and security. With
                your consent, we also use cookies for analytics and error
                monitoring to improve Arco. See our{" "}
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
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" size="sm" onClick={openPreferences}>
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={rejectNonEssential}>
                Reject non-essential
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Accept all
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
