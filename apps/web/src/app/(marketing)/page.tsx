import type { Metadata } from "next";

import { JsonLd } from "@/components/marketing/json-ld";
import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FaqSection } from "@/components/marketing/faq-section";
import { Hero } from "@/components/marketing/hero";
import { HeroPreview } from "@/components/marketing/motion/hero-preview";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SectionHeader } from "@/components/marketing/section-header";
import { StarterPrompts } from "@/components/marketing/starter-prompts";
import { coreFeatures, starterPrompts } from "@/lib/marketing/features";
import { createPageMetadata } from "@/lib/marketing/metadata";
import { pricingFaqs, pricingPlans } from "@/lib/marketing/pricing";
import { siteConfig } from "@/lib/marketing/site-config";

export const metadata: Metadata = createPageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    sameAs: [siteConfig.links.twitter, siteConfig.links.github],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd} />

      <Hero
        title="The fastest way to"
        titleAccent="ship launch videos"
        description="Record your product once. Tell Arco what you're shipping — and export polished motion in minutes. No freelancer. No After Effects."
        primaryCta={{ label: "Start a video", href: "/signup" }}
      />

      <StarterPrompts prompts={starterPrompts} />

      <HeroPreview />

      <section className="pb-24 sm:pb-32">
        <div className="marketing-container">
          <SectionHeader
            title="Everything you need to go from brief to export"
            description="Arco takes you from screenshots and a short brief to a launch-ready video."
          />
          <div className="mt-14">
            <FeatureGrid features={coreFeatures} />
          </div>
        </div>
      </section>

      <section className="border-y border-marketing-border bg-marketing-surface py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader
            title="Simple, transparent pricing"
            description="Pick a plan that fits how often you ship."
          />
          <div className="mt-14">
            <PricingCards
              plans={pricingPlans}
              showBillingToggle
              featureLimit={5}
            />
          </div>
        </div>
      </section>

      <FaqSection
        description="Everything you need to know about pricing and plans."
        items={pricingFaqs.slice(0, 6)}
      />

      <CtaBand
        title="Your next launch video is one recording away"
        description="Stop briefing freelancers. Start exporting."
        primaryCta={{ label: "Start a video", href: "/signup" }}
      />
    </>
  );
}
