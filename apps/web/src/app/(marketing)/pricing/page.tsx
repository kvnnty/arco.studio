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
    "Simple, transparent pricing for product demo videos. Start free, upgrade when you scale.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <section className="py-20 sm:py-28">
        <div className="marketing-container">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple pricing for every stage"
            description="Start free with one export. Upgrade to Pro when you're ready to ship demos every week."
          />
          <div className="mt-16">
            <PricingCards plans={pricingPlans} />
          </div>
        </div>
      </section>

      <section className="border-t border-marketing-border py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader title="Compare plans" description="See what's included at each tier." />
          <div className="mt-12">
            <FeatureComparisonTable />
          </div>
        </div>
      </section>

      <FaqSection items={pricingFaqs} />

      <CtaBand
        title="Start with one free export"
        description="No credit card required. Upgrade anytime from your dashboard."
      />
    </>
  );
}
