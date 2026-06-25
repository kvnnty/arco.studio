"use client";

import Link from "next/link";
import { ExternalLink, ImageIcon, Loader2, Palette, Sparkles, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/editor/chat-types";
import { cn } from "@/lib/utils";

function formatChars(count?: number): string {
  if (!count) return "0 chars";
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k chars`;
  return `${count} chars`;
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "status") {
    return (
      <div className="space-y-1">
        <div className="flex items-start gap-2 text-sm">
          {message.done ? (
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
          ) : (
            <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin text-primary" />
          )}
          <div className="min-w-0">
            <p className={cn("font-medium", message.done && "text-foreground")}>
              {message.content}
            </p>
            {message.done && message.elapsedSec ? (
              <p className="text-xs text-muted-foreground">
                Done in {message.elapsedSec}s
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "analyze-detail") {
    return (
      <div className="ml-5 space-y-2 border-l border-border/80 pl-3">
        {message.screenshotUrl ? (
          <div className="overflow-hidden rounded-lg border border-border/80 bg-muted/20">
            <div className="flex items-center gap-2 border-b border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground">
              <ImageIcon className="size-3.5" />
              Captured screenshot
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.screenshotUrl}
              alt=""
              className="max-h-36 w-full object-cover object-top"
            />
          </div>
        ) : null}

        {message.pageContent ? (
          <div className="overflow-hidden rounded-lg border border-border/80 bg-muted/20">
            <div className="flex items-center gap-2 border-b border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground">
              <Type className="size-3.5" />
              Page content ({formatChars(message.pageContentChars)})
            </div>
            <p className="max-h-28 overflow-hidden px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {message.pageContent}
            </p>
          </div>
        ) : null}

        {message.brandStyle ? (
          <div className="overflow-hidden rounded-lg border border-border/80 bg-muted/20">
            <div className="flex items-center gap-2 border-b border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground">
              <Palette className="size-3.5" />
              Brand style
            </div>
            <div className="space-y-1 px-3 py-2 text-sm">
              <p className="font-medium">{message.brandStyle.fontFamily}</p>
              <p className="text-xs text-muted-foreground">
                {message.brandStyle.energy} · {message.brandStyle.audience}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (message.role === "credits") {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          A few more credits needed
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your script is ready. We need {message.scenesNeeded} credits to voice
          and animate it. You have {message.creditsAvailable}. Top up and we&apos;ll
          continue automatically.
        </p>
        <Button
          size="sm"
          className="mt-3"
          render={<Link href="/dashboard/billing" />}
        >
          View plans
          <ExternalLink data-icon="inline-end" />
        </Button>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {message.content}
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className="space-y-2">
      {isUser && message.hostname ? (
        <div className="flex justify-end">
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium">
            {message.hostname}
          </span>
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[95%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "ml-auto bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
