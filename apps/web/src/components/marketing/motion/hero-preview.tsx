"use client";

import { motion } from "framer-motion";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import {
  MotionStagger,
  MotionStaggerItem,
} from "@/components/marketing/motion/motion-stagger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const examples = [
  {
    name: "Ornadyne",
    type: "Product launch",
    src: "https://storage.googleapis.com/motion-studio-assets/studio/Ornadyne-O1.mp4",
    featured: true,
  },
  {
    name: "GitHits",
    type: "Feature announcement",
    src: "https://storage.googleapis.com/motion-studio-assets/studio/githits.mp4",
  },
  {
    name: "Perch",
    type: "App showcase",
    src: "https://storage.googleapis.com/motion-studio-assets/studio/perch-by-candlefish-1080p.mp4",
  },
];

export function HeroPreview() {
  const reduced = useReducedMotion();

  return (
    <section id="examples" className="scroll-mt-24 py-20 sm:py-28">
      <div className="marketing-container">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <MotionReveal>
            <p className="text-[12px] font-semibold uppercase text-marketing-subtle">
              Selected work
            </p>
            <h2 className="marketing-heading mt-3 max-w-lg text-[2.75rem] leading-[1.02] sm:text-[3.5rem]">
              The output is the pitch.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.1}>
            <p className="max-w-xl text-[16px] leading-relaxed text-marketing-muted lg:ml-auto">
              These are finished product videos made for launches, feature
              drops, and landing pages. Arco keeps the real interface intact,
              then adds the pacing, framing, and motion that make it feel
              authored.
            </p>
          </MotionReveal>
        </div>

        <MotionStagger
          className="mt-12 grid gap-4 lg:grid-cols-12"
          stagger={0.08}
        >
          {examples.map((example) => (
            <MotionStaggerItem
              key={example.name}
              className={cn(
                example.featured && "lg:col-span-7 lg:row-span-2",
                !example.featured && "lg:col-span-5",
              )}
            >
              <motion.figure
                className="group relative h-full overflow-hidden bg-[#0c0c0d]"
                whileHover={reduced ? undefined : { y: -3 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <video
                  className={cn(
                    "w-full bg-black object-cover",
                    example.featured ? "h-full min-h-[320px]" : "aspect-video",
                  )}
                  src={example.src}
                  autoPlay={!reduced}
                  muted
                  loop
                  playsInline
                  preload={example.featured ? "auto" : "metadata"}
                  aria-label={`${example.name} ${example.type} made with Arco`}
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-black/75 px-4 py-3 text-white backdrop-blur-sm">
                  <div>
                    <p className="text-[14px] font-semibold">{example.name}</p>
                    <p className="text-[11px] text-white/60">{example.type}</p>
                  </div>
                  <span className="text-[10px] font-medium uppercase text-primary">
                    Made in Arco
                  </span>
                </figcaption>
              </motion.figure>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
