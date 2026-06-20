import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaBandProps = {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
};

export function CtaBand({
  title,
  description,
  primaryCta = { label: "Get started free", href: "/signup" },
  secondaryCta,
  className,
}: CtaBandProps) {
  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <div className="marketing-container">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--marketing-border)] bg-[var(--marketing-surface)] px-8 py-16 text-center sm:px-16">
          <div className="marketing-glow pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="marketing-heading text-[2rem] sm:text-[2.5rem]">{title}</h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-[var(--marketing-muted)]">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" render={<Link href={primaryCta.href} />}>
                {primaryCta.label}
              </Button>
              {secondaryCta ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[var(--marketing-border)] bg-transparent"
                  render={<Link href={secondaryCta.href} />}
                >
                  {secondaryCta.label}
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
