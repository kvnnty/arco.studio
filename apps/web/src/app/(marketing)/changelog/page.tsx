import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/marketing/section-header";
import { changelog } from "@/lib/marketing/changelog";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Changelog",
  description: "New features, improvements, and fixes in every Arco release.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <section className="py-20 sm:py-28">
      <div className="marketing-container">
        <SectionHeader
          align="left"
          title="What's new in Arco"
          description="New features, improvements, and fixes as we ship."
        />

        <div className="relative mt-16">
          <div className="absolute top-0 bottom-0 left-[7px] w-px bg-marketing-border" />

          <div className="space-y-16">
            {changelog.map((entry) => (
              <article key={entry.version} className="relative pl-10">
                <div className="absolute top-1.5 left-0 size-[15px] rounded-full border-2 border-primary bg-marketing-bg" />

                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-[20px] font-semibold">v{entry.version}</h2>
                  <span className="text-[13px] text-marketing-subtle">
                    {entry.date}
                  </span>
                </div>

                {entry.features && entry.features.length > 0 ? (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        Features
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {entry.features.map((item) => (
                        <li
                          key={item}
                          className="text-[14px] text-marketing-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {entry.improvements && entry.improvements.length > 0 ? (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        Improvements
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {entry.improvements.map((item) => (
                        <li
                          key={item}
                          className="text-[14px] text-marketing-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {entry.fixes && entry.fixes.length > 0 ? (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="border-amber-200 text-amber-800">
                        Fixes
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {entry.fixes.map((item) => (
                        <li
                          key={item}
                          className="text-[14px] text-marketing-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
