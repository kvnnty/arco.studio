import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeatureComparisonTable } from "@/components/marketing/feature-comparison-table";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SectionHeader } from "@/components/marketing/section-header";
import { pricingFaqs, pricingPlans } from "@/lib/marketing/pricing";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for product owners. Ship launch videos without hiring a motion designer. Pro from $24/mo billed annually.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <section className="py-20 sm:py-28">
        <div className="marketing-container">
          <SectionHeader
            title="Simple, transparent pricing"
            description="Pick a plan that fits how often you ship. Save 17% with annual billing."
          />
          <div className="mt-16">
            <PricingCards plans={pricingPlans} />
          </div>
        </div>
      </section>

      <section className="border-t border-marketing-border py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader
            title="Compare plans"
            description="See what's included at each tier."
          />
          <div className="mt-12">
            <FeatureComparisonTable />
          </div>
        </div>
      </section>

      <FaqSection
        description="Everything you need to know about our pricing and plans."
        items={pricingFaqs}
      />

      <CtaBand
        title="Your next launch video is one recording away"
        description="Stop briefing freelancers. Start exporting."
        primaryCta={{ label: "Start a video", href: "/sign-up" }}
      />
    </>
  );
}
