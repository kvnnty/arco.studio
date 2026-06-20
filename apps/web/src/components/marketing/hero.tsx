import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  features?: string[];
  className?: string;
};

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta = { label: "Get started free", href: "/signup" },
  secondaryCta = { label: "View pricing", href: "/pricing" },
  features,
  className,
}: HeroProps) {
  return (
    <section className={cn("relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32", className)}>
      <div className="marketing-glow pointer-events-none absolute inset-0" />
      <div className="marketing-grid-bg pointer-events-none absolute inset-0 opacity-50" />

      <div className="marketing-container relative">
        {eyebrow ? (
          <p className="mb-6 inline-flex items-center rounded-full border border-marketing-border bg-marketing-elevated px-3 py-1 text-[12px] font-medium tracking-wide text-marketing-muted">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="marketing-heading max-w-3xl text-[2.5rem] leading-[1.1] sm:text-[3.5rem] lg:text-[4rem]">
          {title}
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-[var(--marketing-muted)] sm:text-[18px]">
          {description}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button size="lg" render={<Link href={primaryCta.href} />}>
            {primaryCta.label}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-marketing-border bg-transparent text-foreground hover:bg-marketing-hover"
            render={<Link href={secondaryCta.href} />}
          >
            {secondaryCta.label}
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>

        {features && features.length > 0 ? (
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-[13px] text-[var(--marketing-muted)]"
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
