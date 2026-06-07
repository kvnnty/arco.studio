"use client";

import type { ExportFormat } from "@arco/project-schema";
import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const FORMATS: { id: ExportFormat; label: string; description: string }[] = [
  { id: "16:9", label: "16:9", description: "YouTube, landing hero" },
  { id: "1:1", label: "1:1", description: "LinkedIn, Product Hunt" },
  { id: "9:16", label: "9:16", description: "TikTok, Reels, Stories" },
];

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  projectTitle: string;
};

export function ExportDialog({
  open,
  onOpenChange,
  format,
  onFormatChange,
  projectTitle,
}: ExportDialogProps) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setExporting(false);
    setDone(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setDone(false);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export video</DialogTitle>
          <DialogDescription>
            Choose a format for <strong>{projectTitle}</strong>. Server-side
            render ships in Week 3 — format is saved to your project now.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Format</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[format]}
              onValueChange={(value) => {
                const next = value[0] as ExportFormat | undefined;
                if (next) onFormatChange(next);
              }}
              variant="outline"
              spacing={0}
              className="grid w-full grid-cols-3"
            >
              {FORMATS.map((item) => (
                <ToggleGroupItem
                  key={item.id}
                  value={item.id}
                  className="h-auto flex-col gap-1 py-3"
                >
                  <span className="font-mono text-sm">{item.label}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {item.description}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldDescription>
              Preview aspect ratio updates when you change format.
            </FieldDescription>
          </FieldContent>
        </Field>

        {done ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Export queued. You&apos;ll download MP4 here once the render worker
            is connected.
          </p>
        ) : null}

        <Button
          className="w-full"
          onClick={handleExport}
          disabled={exporting || done}
        >
          <Download data-icon="inline-start" />
          {exporting ? "Preparing…" : done ? "Queued" : "Export"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
