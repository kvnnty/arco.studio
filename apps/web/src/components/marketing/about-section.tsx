"use client";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";

export function AboutSection() {
  return (
    <section className="border-y border-marketing-border py-24 sm:py-32">
      <div className="marketing-container">
        <MotionReveal>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
            About Arco
          </p>
          <h2 className="marketing-heading text-[2rem] leading-tight sm:text-[2.5rem]">
            Built for indie hackers and product owners
          </h2>
          <p className="mt-4 text-pretty text-[16px] leading-relaxed text-marketing-muted">
            Arco started with a simple idea: every SaaS needs polished product videos,
            but most solo founders don&apos;t have motion design skills or budget.
          </p>
        </MotionReveal>
        <MotionReveal delay={0.1} className="mt-8 space-y-4 text-[16px] leading-relaxed text-marketing-muted">
          <p>
            We automate the motion layer so you can record once — or upload
            screenshots — and publish launch-ready demos in minutes. No After Effects.
            No agency retainer.
          </p>
          <p>
            Questions or feedback:{" "}
            <a href="mailto:hello@arco.app" className="text-primary hover:underline">
              hello@arco.app
            </a>
          </p>
        </MotionReveal>
      </div>
    </section>
  );
}
