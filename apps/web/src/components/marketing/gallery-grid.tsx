"use client";

import { motion } from "framer-motion";

import {
  MotionStagger,
  MotionStaggerItem,
} from "@/components/marketing/motion/motion-stagger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { GalleryItem } from "@/lib/marketing/gallery";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  items: GalleryItem[];
  className?: string;
  layout?: "landing" | "gallery";
};

export function GalleryGrid({
  items,
  className,
  layout = "gallery",
}: GalleryGridProps) {
  const reduced = useReducedMotion();

  return (
    <MotionStagger
      className={cn(
        layout === "landing"
          ? "grid gap-4 sm:grid-cols-2"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-12",
        className,
      )}
      stagger={0.08}
    >
      {items.map((item, index) => (
        <MotionStaggerItem
          key={item.name}
          className={cn(
            layout === "gallery" &&
              index === 0 &&
              items.length > 2 &&
              "lg:col-span-7 lg:row-span-2",
            layout === "gallery" &&
              index > 0 &&
              items.length > 2 &&
              "lg:col-span-5",
          )}
        >
          <motion.figure
            className="group relative h-full overflow-hidden border border-marketing-border bg-[#0c0c0d]"
            whileHover={reduced ? undefined : { y: -3 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <video
              className={cn(
                "w-full bg-black object-cover",
                layout === "landing" || (layout === "gallery" && index !== 0)
                  ? "aspect-video"
                  : "h-full min-h-[320px]",
              )}
              src={item.src}
              autoPlay={!reduced}
              muted
              loop
              playsInline
              preload={index === 0 ? "auto" : "metadata"}
              aria-label={`${item.name} ${item.type} made with Arco`}
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-black/75 px-4 py-3 text-white backdrop-blur-sm">
              <div>
                <p className="text-[14px] font-semibold">{item.name}</p>
                <p className="text-[11px] text-white/60">{item.type}</p>
              </div>
              <span className="text-[10px] font-medium uppercase text-primary">
                Made in Arco
              </span>
            </figcaption>
          </motion.figure>
        </MotionStaggerItem>
      ))}
    </MotionStagger>
  );
}
