"use client";

import { Sparkles } from "lucide-react";

import type { ChatMessage } from "@/lib/editor/chat-types";
import { cn } from "@/lib/utils";

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "status") {
    return (
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-foreground" />
        <span className={cn(message.done && "text-foreground")}>
          {message.done ? "✓ " : "→ "}
          {message.content}
        </span>
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
    <div
      className={cn(
        "max-w-[95%] rounded-2xl px-3 py-2 text-sm",
        isUser
          ? "ml-auto bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
      )}
    >
      {message.content}
    </div>
  );
}
