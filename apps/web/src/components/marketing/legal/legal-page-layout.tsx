"use client";

import Link from "next/link";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";
import type { LegalDocument } from "@/lib/marketing/legal";
import { cn } from "@/lib/utils";

type LegalPageLayoutProps = {
  document: LegalDocument;
  children?: React.ReactNode;
};

export function LegalPageLayout({ document }: LegalPageLayoutProps) {
  return (
    <article className="py-16 sm:py-24">
      <div className="marketing-container-narrow">
        <MotionReveal>
          <header className="border-b border-marketing-border pb-8">
            <h1 className="marketing-heading text-[2.5rem] sm:text-[3rem]">
              {document.title}
            </h1>
            <p className="mt-3 text-[14px] text-marketing-muted">
              Last updated: {document.lastUpdated}
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-marketing-muted">
              {document.description}
            </p>
          </header>
        </MotionReveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[200px_1fr]">
          <nav className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-24">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-marketing-subtle">
                Contents
              </p>
              <ol className="space-y-2 border-l border-marketing-border pl-3">
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-[13px] text-marketing-muted transition-colors hover:text-foreground"
                    >
                      {section.number}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <MotionStagger className="min-w-0">
            {document.sections.map((section) => (
              <MotionStaggerItem key={section.id}>
                <section
                  id={section.id}
                  className="scroll-mt-24 border-b border-marketing-border py-10 last:border-0"
                >
                  <h2 className="marketing-heading text-[1.5rem]">
                    <span className="mr-2 text-marketing-subtle">{section.number}.</span>
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.content.map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-[15px] leading-relaxed text-marketing-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </div>
    </article>
  );
}

export function LegalPageLinks({
  current,
  links,
}: {
  current: string;
  links: { slug: string; title: string }[];
}) {
  return (
    <div className="marketing-container-narrow mt-8 flex flex-wrap gap-4 pb-16">
      {links.map((link) => (
        <Link
          key={link.slug}
          href={`/${link.slug}`}
          className={cn(
            "text-[13px] transition-colors",
            current === link.slug
              ? "font-medium text-primary"
              : "text-marketing-muted hover:text-foreground",
          )}
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
}
