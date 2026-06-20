"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  language?: string;
  title?: string;
  className?: string;
};

export function CodeBlock({ code, language, title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group relative my-6 overflow-hidden rounded-xl border border-marketing-border bg-marketing-code-bg",
        className,
      )}
    >
      {(title || language) && (
        <div className="flex items-center justify-between border-b border-[var(--marketing-border)] px-4 py-2">
          <span className="text-[12px] font-medium text-[var(--marketing-muted)]">
            {title ?? language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-marketing-muted transition-colors hover:bg-marketing-hover hover:text-foreground"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-marketing-code-text">{code}</code>
      </pre>
      {!title && !language ? (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md text-marketing-muted opacity-0 transition-all hover:bg-marketing-hover hover:text-foreground group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      ) : null}
    </div>
  );
}
