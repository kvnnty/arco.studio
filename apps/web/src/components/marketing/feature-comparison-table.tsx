"use client";

import { Fragment } from "react";
import { Check, Minus } from "lucide-react";

import { MotionReveal } from "@/components/marketing/motion/motion-reveal";
import { featureComparison } from "@/lib/marketing/pricing";

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto size-4 text-primary" />
    ) : (
      <Minus className="mx-auto size-4 text-marketing-subtle" />
    );
  }
  return <span className="text-[14px] text-marketing-muted">{value}</span>;
}

export function FeatureComparisonTable() {
  return (
    <MotionReveal variant="scale-in">
      <div className="overflow-x-auto rounded-2xl border border-marketing-border">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-marketing-border bg-marketing-surface">
              <th className="px-6 py-4 text-[13px] font-medium text-marketing-muted">
                Feature
              </th>
              <th className="px-6 py-4 text-center text-[13px] font-semibold">Intro</th>
              <th className="px-6 py-4 text-center text-[13px] font-semibold text-primary">
                Pro
              </th>
              <th className="px-6 py-4 text-center text-[13px] font-semibold">Team</th>
            </tr>
          </thead>
          <tbody>
            {featureComparison.categories.map((category) => (
              <Fragment key={category.name}>
                <tr>
                  <td
                    colSpan={4}
                    className="bg-marketing-hover px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-marketing-subtle"
                  >
                    {category.name}
                  </td>
                </tr>
                {category.features.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-b border-marketing-border last:border-0"
                  >
                    <td className="px-6 py-4 text-[14px] text-foreground">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={feature.trial} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={feature.pro} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={feature.team} />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </MotionReveal>
  );
}
