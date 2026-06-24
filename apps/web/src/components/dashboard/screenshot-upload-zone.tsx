"use client";

import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import { useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_SCREENSHOTS = 10;
const MIN_SCREENSHOTS = 3;

type ScreenshotUploadZoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export function ScreenshotUploadZone({
  files,
  onChange,
  disabled = false,
}: ScreenshotUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = files.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));

  const handlePick = useCallback(
    (picked: FileList | null) => {
      if (!picked?.length) return;

      const next = [...files];
      for (const file of Array.from(picked)) {
        if (!file.type.startsWith("image/")) continue;
        if (next.length >= MAX_SCREENSHOTS) break;
        next.push(file);
      }
      onChange(next);
    },
    [files, onChange],
  );

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3",
          files.length >= MIN_SCREENSHOTS
            ? "border-primary/40 bg-primary/5"
            : "border-border",
        )}
      >
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || files.length >= MAX_SCREENSHOTS}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus data-icon="inline-start" />
          Add screenshots
        </Button>
        <span className="text-xs text-muted-foreground">
          {files.length}/{MAX_SCREENSHOTS} · PNG or JPG · min {MIN_SCREENSHOTS}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            handlePick(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map(({ file, url }, index) => (
            <div
              key={`${file.name}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-border bg-muted/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Screenshot ${index + 1}`}
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/80 px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled || index === files.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => removeAt(index)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              <span className="absolute left-2 top-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { MIN_SCREENSHOTS, MAX_SCREENSHOTS };
