import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { SectionHeader } from "@/components/marketing/section-header";
import { TestimonialGrid } from "@/components/marketing/testimonial-grid";
import {
  coreFeatures,
  heroFeatures,
  logoCloud,
  testimonials,
  workflowSteps,
} from "@/lib/marketing/features";
import { siteConfig } from "@/lib/marketing/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow="Now in early access"
        title="Turn screen recordings into launch-ready demos"
        description="Upload once. Arco adds zooms, ripples, and titles — then export a polished product video in minutes, not hours."
        features={heroFeatures}
      />

      <div className="marketing-container pb-8">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--marketing-border)] bg-[var(--marketing-surface)] aspect-video">
          <div className="marketing-glow absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <div className="size-0 border-y-8 border-y-transparent border-l-[14px] border-l-primary ml-1" />
              </div>
              <p className="text-[14px] text-[var(--marketing-muted)]">
                Product demo preview
              </p>
            </div>
          </div>
        </div>
      </div>

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

      <section className="border-y border-[var(--marketing-border)] py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader
            eyebrow="How it works"
            title="Three steps to a polished demo"
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {workflowSteps.map((step) => (
              <div key={step.step}>
                <span className="text-[13px] font-semibold text-primary">{step.step}</span>
                <h3 className="mt-2 text-[18px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--marketing-muted)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
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

      <section className="border-y border-[var(--marketing-border)] py-24 sm:py-32">
        <div className="marketing-container-narrow">
          <SectionHeader
            align="left"
            eyebrow="About Arco"
            title="Built for teams that ship"
            description="Arco started with a simple idea: every SaaS needs polished product videos, but few teams have motion design resources in-house."
          />
          <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[var(--marketing-muted)]">
            <p>
              We automate the motion layer so product, growth, and design teams can
              record once and publish launch-ready demos in minutes.
            </p>
            <p>
              Questions, partnerships, or enterprise requests:
              {" "}
              <a href="mailto:hello@arco.app" className="text-primary hover:underline">
                hello@arco.app
              </a>
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to ship your first demo?"
        description="Start free with one export. Upgrade when you're ready to scale."
        secondaryCta={{ label: "Read the docs", href: "/docs" }}
      />
    </>
  );
}
