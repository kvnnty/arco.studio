"use client";

import Image from "next/image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { cn } from "@/lib/utils";

const BEFORE_POSTER = "/templates/dev-tool-poster.svg";
const AFTER_POSTER = "/templates/saas-launch-poster.svg";

export function BeforeAfterDemo() {
  const reduced = useReducedMotion();

  return (
    <section className="border-y border-marketing-border bg-marketing-surface py-20 sm:py-28">
      <div className="marketing-container">
        <MotionReveal variant="fade-up" className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-wide text-marketing-muted">
            Before & after
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Raw recording → launch-ready demo
          </h2>
          <p className="mt-3 text-[15px] text-marketing-muted">
            Same product UI — Arco adds motion, zooms, and titles so you ship a
            video you&apos;d actually post.
          </p>
        </MotionReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <DemoPanel
            label="Raw screen recording"
            description="Flat OBS capture — no polish"
            poster={BEFORE_POSTER}
            muted
            reduced={reduced}
          />
          <DemoPanel
            label="Arco export"
            description="Zooms, ripples, titles, music"
            poster={AFTER_POSTER}
            highlight
            reduced={reduced}
          />
        </div>
      </div>
    </section>
  );
}

function DemoPanel({
  label,
  description,
  poster,
  highlight = false,
  muted = false,
  reduced,
}: {
  label: string;
  description: string;
  poster: string;
  highlight?: boolean;
  muted?: boolean;
  reduced: boolean;
}) {
  return (
    <MotionReveal variant="scale-in">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border",
          highlight
            ? "border-primary/30 shadow-lg shadow-primary/10"
            : "border-marketing-border",
        )}
      >
        <div className="flex items-center justify-between border-b border-marketing-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-marketing-muted">{description}</p>
          </div>
          {highlight ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Arco
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            "relative aspect-video bg-[#07080a]",
            muted && "grayscale contrast-90",
          )}
        >
          <Image
            src={poster}
            alt={label}
            fill
            className={cn(
              "object-cover",
              !reduced && highlight && "scale-[1.02]",
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={highlight}
          />
          {highlight && !reduced ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
          ) : null}
        </div>
      </div>
    </MotionReveal>
  );
}
