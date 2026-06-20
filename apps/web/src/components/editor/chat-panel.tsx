"use client";

import type { Marker } from "@arco/project-schema";
import { Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { analyzeBrandUrlAction, type BrandKit } from "@/app/actions/brand";
import { ChatMessageBubble } from "@/components/editor/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ANALYSIS_STEPS,
  runAnalysis,
  type DraftAnalysisResult,
} from "@/lib/editor/analyze-recording";
import {
  createChatId,
  type ChatMessage,
} from "@/lib/editor/chat-types";

const QUICK_ACTIONS = [
  "Make headlines shorter",
  "More technical",
  "More bold",
] as const;

type ChatPanelProps = {
  projectTitle: string;
  platform: string;
  durationMs: number;
  intent?: string;
  productUrl?: string;
  isAnalyzing: boolean;
  chatReady: boolean;
  selectedMarker: Marker | null;
  onBrandAnalyzed: (kit: BrandKit) => void;
  onAnalysisComplete: (result: DraftAnalysisResult) => void;
  onSendMessage: (
    message: string,
    options?: { onStream?: (text: string) => void },
  ) => Promise<string | void>;
  onRegenerateScene?: () => Promise<void>;
};

export function ChatPanel({
  projectTitle,
  platform,
  durationMs,
  intent,
  productUrl,
  isAnalyzing,
  chatReady,
  selectedMarker,
  onBrandAnalyzed,
  onAnalysisComplete,
  onSendMessage,
  onRegenerateScene,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isAnalyzing || analysisStarted) return;

    setAnalysisStarted(true);
    appendMessage({
      id: createChatId(),
      role: "user",
      content: "Uploaded screen recording",
      createdAt: Date.now(),
    });

    const statusIds = ANALYSIS_STEPS.map(() => createChatId());
    const brandStatusId = createChatId();

    void (async () => {
      let brandKit: BrandKit | undefined;

      if (productUrl?.trim()) {
        appendMessage({
          id: brandStatusId,
          role: "status",
          content: "Reading your site…",
          createdAt: Date.now(),
        });

        try {
          brandKit = await analyzeBrandUrlAction(productUrl.trim());
          onBrandAnalyzed(brandKit);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === brandStatusId
                ? {
                    ...m,
                    done: true,
                    content: brandKit?.title
                      ? `Read ${brandKit.title}`
                      : "Read site content",
                  }
                : m,
            ),
          );

          if (brandKit.colors) {
            appendMessage({
              id: createChatId(),
              role: "status",
              content: `Brand colors: ${brandKit.colors.primary} / ${brandKit.colors.background}`,
              createdAt: Date.now(),
              done: true,
            });
          }

          if (brandKit.logoUrl) {
            appendMessage({
              id: createChatId(),
              role: "status",
              content: "Logo found",
              createdAt: Date.now(),
              done: true,
            });
          } else if (brandKit.source === "fallback") {
            appendMessage({
              id: createChatId(),
              role: "status",
              content: "Using default brand styling",
              createdAt: Date.now(),
              done: true,
            });
          }
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === brandStatusId
                ? {
                    ...m,
                    done: true,
                    content: "Could not read site — continuing with defaults",
                  }
                : m,
            ),
          );
        }
      }

      const result = await runAnalysis(
        (stepIndex) => {
          setMessages((prev) => {
            const next = [...prev];
            for (let i = 0; i <= stepIndex; i++) {
              const step = ANALYSIS_STEPS[i];
              if (!step) continue;
              const existingIndex = next.findIndex((m) => m.id === statusIds[i]);
              const statusMsg: ChatMessage = {
                id: statusIds[i]!,
                role: "status",
                content: step.label,
                createdAt: Date.now(),
                done: i < stepIndex,
              };
              if (existingIndex >= 0) {
                next[existingIndex] = statusMsg;
              } else {
                next.push(statusMsg);
              }
            }
            return next;
          });
        },
        {
          title: projectTitle,
          durationMs,
          platform,
          intent: intent ?? brandKit?.description,
          productUrl,
          brandContext: brandKit
            ? {
                title: brandKit.title,
                description: brandKit.description,
                tone: brandKit.tone,
                colors: brandKit.colors,
              }
            : undefined,
        },
      );

      setMessages((prev) =>
        prev.map((m) => (m.role === "status" ? { ...m, done: true } : m)),
      );
      const summary = `Draft ready — ${result.markers.length} scenes with motion and titles. Tweak anything below or edit scenes on the timeline.`;
      const summaryId = createChatId();
      appendMessage({
        id: summaryId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      });

      let streamed = "";
      for (const char of summary) {
        streamed += char;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === summaryId
              ? { ...message, content: streamed }
              : message,
          ),
        );
        await new Promise((resolve) => setTimeout(resolve, 12));
      }

      onAnalysisComplete({ ...result, brandKit });
    })();
  }, [
    analysisStarted,
    appendMessage,
    durationMs,
    intent,
    isAnalyzing,
    onAnalysisComplete,
    onBrandAnalyzed,
    platform,
    productUrl,
    projectTitle,
  ]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !chatReady || sending) return;

    setSending(true);
    appendMessage({
      id: createChatId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    });
    setInput("");

    try {
      const assistantId = createChatId();
      appendMessage({
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      });

      const reply = await onSendMessage(trimmed, {
        onStream: (text) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: text }
                : message,
            ),
          );
        },
      });

      if (reply) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: reply }
              : message,
          ),
        );
      }
    } catch (error) {
      appendMessage({
        id: createChatId(),
        role: "error",
        content:
          error instanceof Error ? error.message : "Something went wrong.",
        createdAt: Date.now(),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="size-4 text-accent-foreground" />
        <p className="text-sm font-medium">Arco assistant</p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-4">
          {messages.length === 0 && !isAnalyzing ? (
            <p className="text-sm text-muted-foreground">
              Your AI assistant will guide analysis and help refine copy.
            </p>
          ) : null}
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {chatReady ? (
        <div className="space-y-2 border-t border-border p-3">
          {selectedMarker && onRegenerateScene ? (
            <Button
              variant="outline"
              size="xs"
              className="w-full"
              disabled={sending}
              onClick={() => void onRegenerateScene()}
            >
              Regenerate selected scene copy
            </Button>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action}
                variant="secondary"
                size="xs"
                disabled={sending}
                onClick={() => void handleSend(action)}
              >
                {action}
              </Button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend(input);
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me to change something…"
              disabled={sending || isAnalyzing}
            />
            <Button type="submit" size="icon" disabled={sending || isAnalyzing}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="border-t border-border p-3">
          <Input
            placeholder="Ask me to change something…"
            disabled
            className="opacity-60"
          />
        </div>
      )}
    </div>
  );
}
