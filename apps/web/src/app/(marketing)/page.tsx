import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq-section";
import { Hero } from "@/components/marketing/hero";
import { JsonLd } from "@/components/marketing/json-ld";
import { GalleryPreview } from "@/components/marketing/gallery-preview";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { ProductWorkflow } from "@/components/marketing/product-workflow";
import { SectionHeader } from "@/components/marketing/section-header";
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

const homeFaqs = [
  {
    question: "Do I need motion design or editing experience?",
    answer:
      "No. Add your product URL, screenshots, and a short launch brief. Arco builds the scenes, pacing, copy, voice-over, and motion into a first cut you can refine.",
  },
  {
    question: "Does Arco generate fake product interfaces?",
    answer:
      "No. Arco works from your real screenshots and product assets, so the finished video shows the interface customers will actually use.",
  },
  {
    question: "Can I match my brand?",
    answer:
      "Yes. Arco can pull colors and logo assets from your website, and you can refine copy and creative direction before export.",
  },
  {
    question: "Which formats can I export?",
    answer:
      "Export landscape, square, and vertical video for landing pages, launch posts, paid social, and product announcements.",
  },
  {
    question: "Can an agency use Arco for client work?",
    answer:
      "Yes. Arco is designed for repeatable product-video production, making it useful for agencies and teams that ship across multiple brands.",
  },
  {
    question: "How quickly can I make a first cut?",
    answer:
      "Most briefs can move from screenshots to a structured first cut in minutes. Final timing depends on the number of scenes and export resolution.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd} />

      <Hero
        title="Launch videos from"
        titleAccent="your product UI."
        description="Upload screenshots and a brief. Arco builds the scenes, motion, and voice-over — then exports a polished video ready to ship."
        primaryCta={{ label: "Start a video", href: "/sign-up" }}
        secondaryCta={{ label: "View gallery", href: "/gallery" }}
      />

      <GalleryPreview />

      <ProductWorkflow />

      <section id="pricing" className="scroll-mt-24 py-20 sm:py-28">
        <div className="marketing-container">
          <SectionHeader
            eyebrow="Pricing"
            title="A studio line item you can actually predict."
            description="Start small, then scale the plan with how often your team ships. Save 17% with annual billing."
          />
          <div className="mt-14">
            <PricingCards
              plans={pricingPlans}
              showBillingToggle
              featureLimit={3}
            />
          </div>
        </div>
      </section>

      <FaqSection
        description="The practical details before you make your first video."
        items={homeFaqs.slice(0, 4)}
      />

      <CtaBand
        title="Make the product the protagonist."
        description="Your interface is already the story. Give it the motion it deserves."
        primaryCta={{ label: "Create your first video", href: "/sign-up" }}
      />
    </>
  );
}
