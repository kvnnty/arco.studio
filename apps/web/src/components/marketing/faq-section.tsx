"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

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

  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <div className="marketing-container-faq">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="marketing-heading text-[2rem] sm:text-[2.5rem]">{title}</h2>
          {description ? (
            <p className="mt-4 text-[16px] text-[var(--marketing-muted)]">{description}</p>
          ) : null}
        </div>

        <div className="mt-12 divide-y divide-[var(--marketing-border)] rounded-2xl border border-[var(--marketing-border)] bg-[var(--marketing-surface)]">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-marketing-hover"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-medium text-foreground">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-[var(--marketing-muted)] transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[14px] leading-relaxed text-[var(--marketing-muted)]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
