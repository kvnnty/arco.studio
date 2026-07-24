import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { GalleryGrid } from "@/components/marketing/gallery-grid";
import { Button } from "@/components/ui/button";
import { galleryItems } from "@/lib/marketing/gallery";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Gallery",
  description:
    "Product launch videos, feature announcements, and app showcases made with Arco — built from real product UI.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <>
      <section className="border-b border-marketing-border py-16 sm:py-24">
        <div className="marketing-container">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-8 text-marketing-muted"
            render={<Link href="/" />}
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back home
          </Button>

          <p className="text-[12px] font-semibold uppercase tracking-wider text-marketing-subtle">
            Gallery
          </p>
          <h1 className="marketing-title-section-lg mt-3 max-w-3xl">
            Made with Arco.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-marketing-muted">
            Launches, feature drops, and app showcases — each built from real
            screenshots and product UI.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="marketing-container">
          <GalleryGrid items={galleryItems} layout="gallery" />
        </div>
      </section>

      <CtaBand
        title="Your product belongs here."
        description="Upload screenshots and a brief — Arco handles the rest."
        primaryCta={{ label: "Start a video", href: "/sign-up" }}
      />
    </>
  );
}
