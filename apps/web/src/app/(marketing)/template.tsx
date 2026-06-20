"use client";

import { MotionPage } from "@/components/marketing/motion/motion-page";

export default function MarketingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionPage>{children}</MotionPage>;
}
