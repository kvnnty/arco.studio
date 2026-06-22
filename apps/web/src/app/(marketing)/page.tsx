import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JsonLd } from "@/components/marketing/json-ld";
import { AboutSection } from "@/components/marketing/about-section";
import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { HeroPreview } from "@/components/marketing/motion/hero-preview";
import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SectionHeader } from "@/components/marketing/section-header";
import { TestimonialGrid } from "@/components/marketing/testimonial-grid";
import { WorkflowSteps } from "@/components/marketing/workflow-steps";
import {
  coreFeatures,
  heroFeatures,
  logoCloud,
  testimonials,
  workflowSteps,
} from "@/lib/marketing/features";
import { createPageMetadata } from "@/lib/marketing/metadata";
import { pricingPlans } from "@/lib/marketing/pricing";
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
        eyebrow="From $9/month"
        title="Turn screen recordings into launch-ready demos"
        description="Upload once. Arco adds zooms, ripples, and titles — then export a polished product video in minutes, not hours."
        features={heroFeatures}
      />

      <HeroPreview />

      <LogoCloud logos={logoCloud} />

      <section className="py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader
            eyebrow="Features"
            title="Everything you need to ship product videos"
            description="From upload to export, Arco handles the motion design so your team can focus on the product."
          />
          <div className="mt-16">
            <FeatureGrid features={coreFeatures} />
          </div>
        </div>
      </section>

      <section className="border-y border-marketing-border bg-marketing-surface py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader eyebrow="How it works" title="Three steps to a polished demo" />
          <WorkflowSteps steps={workflowSteps} />
        </div>
      </section>

      <section className="border-y border-marketing-border py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader
            eyebrow="Testimonials"
            title="Loved by product teams"
            description="Teams ship demos faster and convert more visitors with Arco."
          />
          <div className="mt-16">
            <TestimonialGrid testimonials={testimonials} />
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple pricing for every stage"
            description="Start with Intro at $9/month, or subscribe to Pro at $29/month when you're ready to ship."
          />
          <div className="mt-16">
            <PricingCards
              plans={pricingPlans}
              showBillingToggle={false}
              featureLimit={3}
            />
          </div>
          <MotionReveal variant="fade-in" delay={0.2} className="mt-12 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-marketing-muted transition-colors hover:text-foreground"
            >
              View full pricing details
              <ArrowRight className="size-3.5" />
            </Link>
          </MotionReveal>
        </div>
      </section>

      <AboutSection />

      <CtaBand
        title="Ready to ship your first demo?"
        description="Start with Intro at $9/month or go straight to Pro at $29/month."
        secondaryCta={{ label: "Read the docs", href: "/docs" }}
      />
    </>
  );
}
