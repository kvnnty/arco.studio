"use client";

import { LinkPreviewCard } from "@/components/dashboard/link-preview-card";
import { Input } from "@/components/ui/input";
import { useLinkPreview } from "@/lib/hooks/use-link-preview";
import { cn } from "@/lib/utils";

type ProductUrlInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
};

export function ProductUrlInput({
  id,
  value,
  onChange,
  placeholder = "https://yourproduct.com",
  disabled = false,
  className,
  inputClassName,
}: ProductUrlInputProps) {
  const { state, preview } = useLinkPreview(value);

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        id={id}
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("h-11", inputClassName)}
      />
      <LinkPreviewCard url={value} state={state} preview={preview} />
    </div>
  );
}
