"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { GalleryGrid } from "@/components/marketing/gallery-grid";
import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { Button } from "@/components/ui/button";
import { galleryPreviewItems } from "@/lib/marketing/gallery";

export function GalleryPreview() {
  return (
    <section
      id="gallery"
      className="scroll-mt-24 border-y border-marketing-border py-20 sm:py-28"
    >
      <div className="marketing-container">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <MotionReveal>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-marketing-subtle">
              Gallery
            </p>
            <h2 className="marketing-title-section mt-3 max-w-lg">
              The output is the pitch.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.1}>
            <p className="max-w-xl text-[16px] leading-relaxed text-marketing-muted lg:ml-auto">
              Finished product videos for launches, feature drops, and landing
              pages — built from real UI, not mockups.
            </p>
          </MotionReveal>
        </div>

        <div className="mt-12">
          <GalleryGrid items={galleryPreviewItems} layout="landing" />
        </div>

        <MotionReveal delay={0.15} className="mt-10">
          <Button
            variant="outline"
            size="lg"
            className="border-marketing-border bg-transparent"
            render={<Link href="/gallery" />}
          >
            View gallery
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </MotionReveal>
      </div>
    </section>
  );
}
