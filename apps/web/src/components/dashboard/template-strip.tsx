"use client";

import Link from "next/link";
import { listTemplates } from "@arco/project-schema/templates";

import { TemplateCard } from "@/components/dashboard/template-card";
import { Button } from "@/components/ui/button";

type TemplateStripProps = {
  selectedTemplateId?: string | null;
  onSelectTemplate: (templateId: string | null) => void;
};

export function TemplateStrip({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateStripProps) {
  const templates = listTemplates();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Start from a template</p>
          <p className="text-xs text-muted-foreground">
            Pick a creative direction - Arco adapts it to your product screens
          </p>
        </div>
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/templates" />}>
          Browse all
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => onSelectTemplate(null)}
          className={`flex h-auto w-28 shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-6 text-center transition-colors ${
            selectedTemplateId === null
              ? "border-primary ring-2 ring-primary/30"
              : "border-border hover:border-primary/40"
          }`}
        >
          <span className="text-xs font-medium">Blank</span>
          <span className="mt-1 text-[10px] text-muted-foreground">Default</span>
        </button>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            compact
            selected={selectedTemplateId === template.id}
            onSelect={(id) => onSelectTemplate(id)}
          />
        ))}
      </div>
    </div>
  );
}
