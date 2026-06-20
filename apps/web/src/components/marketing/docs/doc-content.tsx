import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { DocPage, DocSection } from "@/lib/marketing/docs";
import { cn } from "@/lib/utils";

import { CodeBlock } from "./code-block";

function DocCallout({
  variant,
  text,
}: {
  variant: "info" | "warning" | "tip";
  text: string;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    tip: "border-primary/30 bg-primary/5 text-foreground",
  };

  const labels = { info: "Info", warning: "Warning", tip: "Tip" };

  return (
    <div
      className={cn(
        "my-6 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
        styles[variant],
      )}
    >
      <span className="mr-2 text-[11px] font-semibold uppercase tracking-wider">
        {labels[variant]}
      </span>
      {text}
    </div>
  );
}

export function DocContent({ sections }: { sections: DocSection[] }) {
  return (
    <div className="prose-marketing">
      {sections.map((section, i) => {
        switch (section.type) {
          case "paragraph":
            return <p key={i}>{section.text}</p>;
          case "heading": {
            const Tag = section.level === 3 ? "h3" : "h2";
            return (
              <Tag key={i} id={section.id}>
                {section.text}
              </Tag>
            );
          }
          case "code":
            return (
              <CodeBlock
                key={i}
                code={section.code}
                language={section.language}
                title={section.title}
              />
            );
          case "list":
            if (section.ordered) {
              return (
                <ol key={i}>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={i}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "callout":
            return <DocCallout key={i} variant={section.variant} text={section.text} />;
          case "table":
            return (
              <div key={i} className="my-6 overflow-x-auto rounded-xl border border-[var(--marketing-border)]">
                <table className="w-full border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-marketing-border bg-marketing-hover">
                      {section.headers.map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold text-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-[var(--marketing-border)] last:border-0">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-3 text-[var(--marketing-muted)]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function DocToc({ sections }: { sections: DocSection[] }) {
  const headings = sections.filter(
    (s): s is Extract<DocSection, { type: "heading" }> => s.type === "heading",
  );

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block" aria-label="Table of contents">
      <div className="sticky top-24">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--marketing-subtle)]">
          On this page
        </p>
        <ul className="space-y-2 border-l border-[var(--marketing-border)] pl-3">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className="block text-[13px] text-[var(--marketing-muted)] transition-colors hover:text-foreground"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function DocPagination({ page }: { page: DocPage }) {
  if (!page.prev && !page.next) return null;

  return (
    <div className="mt-16 flex items-center justify-between gap-4 border-t border-[var(--marketing-border)] pt-8">
      {page.prev ? (
        <Link
          href={page.prev.href}
          className="group flex items-center gap-2 text-[14px] text-[var(--marketing-muted)] transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>
            <span className="block text-[12px] text-[var(--marketing-subtle)]">Previous</span>
            {page.prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {page.next ? (
        <Link
          href={page.next.href}
          className="group flex items-center gap-2 text-right text-[14px] text-[var(--marketing-muted)] transition-colors hover:text-foreground"
        >
          <span>
            <span className="block text-[12px] text-[var(--marketing-subtle)]">Next</span>
            {page.next.title}
          </span>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
