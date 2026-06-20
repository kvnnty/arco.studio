import Link from "next/link";

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
        <header className="border-b border-[var(--marketing-border)] pb-8">
          <h1 className="marketing-heading text-[2.5rem] sm:text-[3rem]">
            {document.title}
          </h1>
          <p className="mt-3 text-[14px] text-[var(--marketing-muted)]">
            Last updated: {document.lastUpdated}
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--marketing-muted)]">
            {document.description}
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[200px_1fr]">
          <nav className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-24">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--marketing-subtle)]">
                Contents
              </p>
              <ol className="space-y-2 border-l border-[var(--marketing-border)] pl-3">
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-[13px] text-[var(--marketing-muted)] transition-colors hover:text-foreground"
                    >
                      {section.number}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="min-w-0">
            {document.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-b border-[var(--marketing-border)] py-10 last:border-0"
              >
                <h2 className="marketing-heading text-[1.5rem]">
                  <span className="mr-2 text-[var(--marketing-subtle)]">
                    {section.number}.
                  </span>
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.content.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-[15px] leading-relaxed text-[var(--marketing-muted)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
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
              : "text-[var(--marketing-muted)] hover:text-foreground",
          )}
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
}
