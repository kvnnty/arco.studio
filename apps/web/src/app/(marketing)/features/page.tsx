import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ProductOwnerSection } from "@/components/marketing/product-owner-section";
import { SectionHeader } from "@/components/marketing/section-header";
import { VideoTypesSection } from "@/components/marketing/video-types-section";
import { coreFeatures, workflowSteps } from "@/lib/marketing/features";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Features",
  description:
    "AI motion design for product owners. Ship social ads, launch videos, and feature announcements without hiring a motion designer.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <section className="py-20 sm:py-28">
        <div className="marketing-container">
          <SectionHeader
            eyebrow="Features"
            title="Motion design you run yourself"
            description="Arco is built for product owners who need launch-ready video without hiring a motion designer for every release."
          />
          <div className="mt-16">
            <FeatureGrid features={coreFeatures} />
          </div>
        </div>
      </section>

      <VideoTypesSection showCta={false} />

      <ProductOwnerSection className="border-y border-marketing-border bg-marketing-surface" />

      <section className="border-b border-marketing-border py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader title="Built for product owners" />
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              {workflowSteps.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[13px] font-semibold text-primary">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold">{step.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-marketing-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-marketing-border bg-marketing-bg p-8">
              <h3 className="text-[18px] font-semibold">What you get</h3>
              <ul className="mt-6 space-y-3">
                {[
                  "AI scene detection and click highlights",
                  "Automatic title cards and lower thirds",
                  "Brand kit from your website URL",
                  "AI chat assistant for quick edits",
                  "1080p export in 16:9, 1:1, and 9:16",
                  "Music bed and logo overlay",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[14px] text-marketing-muted"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ship your next video without hiring"
        description="Social ad, launch reel, or feature drop — create your first project and export in under 10 minutes."
        primaryCta={{ label: "Start free", href: "/signup" }}
        secondaryCta={{ label: "View pricing", href: "/pricing" }}
      />
    </>
  );
}
