"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { transitionFast } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  title?: string;
  description?: string;
  items: FaqItem[];
  className?: string;
};

export function FaqSection({
  title = "Frequently asked questions",
  description,
  items,
  className,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <div className="marketing-container-faq">
        <MotionReveal className="mx-auto max-w-xl text-center">
          <h2 className="marketing-title-section">{title}</h2>
          {description ? (
            <p className="mt-4 text-[16px] text-marketing-muted">{description}</p>
          ) : null}
        </MotionReveal>

        <MotionStagger className="mt-12 divide-y divide-marketing-border rounded-2xl border border-marketing-border bg-marketing-surface">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <MotionStaggerItem key={item.question}>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-marketing-hover"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-[15px] font-medium text-foreground">
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={reduced ? { duration: 0 } : transitionFast}
                    >
                      <ChevronDown className="size-4 shrink-0 text-marketing-muted" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={reduced ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={reduced ? { duration: 0 } : transitionFast}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-[14px] leading-relaxed text-marketing-muted">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </MotionStaggerItem>
            );
          })}
        </MotionStagger>
      </div>
    </section>
  );
}
