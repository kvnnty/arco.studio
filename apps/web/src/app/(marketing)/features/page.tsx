import type { Metadata } from "next";
import Image from "next/image";

import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { SectionHeader } from "@/components/marketing/section-header";
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
            title="Everything you need to ship product videos"
            description="From upload to export, Arco handles the motion design so you can focus on shipping."
          />
          <div className="mt-16">
            <FeatureGrid features={coreFeatures} />
          </div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="marketing-container">
          <MotionReveal>
            <div className="marketing-media relative aspect-video max-h-[420px] border border-marketing-border sm:aspect-21/9">
              <Image
                src="/marketing/workflow-desk.jpg"
                alt="Laptop on a desk — where product owners ship launch videos with Arco"
                fill
                className="object-cover"
                sizes="(max-width: 1120px) 100vw, 1120px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="border-y border-marketing-border bg-marketing-surface py-24 sm:py-32">
        <div className="marketing-container">
          <SectionHeader
            title="Three steps to a polished demo"
            description="No timeline scrubbing. No After Effects project to babysit."
          />
          <div className="mx-auto mt-14 grid max-w-3xl gap-10 sm:grid-cols-3">
            {workflowSteps.map((step) => (
              <div key={step.step} className="text-center sm:text-left">
                <span className="text-[13px] font-semibold text-primary">{step.step}</span>
                <h3 className="mt-2 text-[16px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-marketing-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Ship your next video without hiring"
        description="Social ad, launch reel, or feature drop — create your first project and export in under 10 minutes."
        primaryCta={{ label: "Start a video", href: "/signup" }}
      />
    </>
  );
}
