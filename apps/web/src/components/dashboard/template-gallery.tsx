"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listTemplates } from "@arco/project-schema/templates";

import { TemplateCard } from "@/components/dashboard/template-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTER_TAGS = ["All", "SaaS", "Launch", "Mobile", "Feature", "Onboarding"] as const;

export function TemplateGallery() {
  const router = useRouter();
  const [activeTag, setActiveTag] = useState<(typeof FILTER_TAGS)[number]>("All");
  const templates = listTemplates();

  const filtered = useMemo(() => {
    if (activeTag === "All") return templates;
    return templates.filter((template) => template.tags.includes(activeTag));
  }, [activeTag, templates]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Templates"
        description="Arco-made launch videos — pick a style and we'll adapt it to your product."
      >
        <Button variant="outline" render={<Link href="/dashboard" />}>
          Back to dashboard
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {FILTER_TAGS.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant={activeTag === tag ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTag(tag)}
            className={cn(activeTag === tag && "pointer-events-none")}
          >
            {tag}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            showUseButton
            onUse={(id) => router.push(`/dashboard?template=${id}`)}
          />
        ))}
      </div>
    </div>
  );
}
