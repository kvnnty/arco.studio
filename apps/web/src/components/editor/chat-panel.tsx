"use client";

import type { Marker } from "@arco/project-schema";
import { Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import type { BrandKit } from "@/lib/api/hooks/brand";
import { useAnalyzeBrandMutation } from "@/lib/api/hooks/brand";
import { useBillingStatus, useBillingUsage } from "@/lib/api/hooks/billing";
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
  getUrlHostname,
  type ChatMessage,
} from "@/lib/editor/chat-types";
import {
  getAvailableSceneCredits,
  hasEnoughSceneCredits,
  inferBrandStyle,
  sceneCreditsNeeded,
} from "@/lib/editor/generation-credits";
import {
  advancePipeline,
  createInitialPipelineState,
  type PipelineState,
} from "@/lib/editor/generation-pipeline";

const QUICK_ACTIONS = [
  "Make headlines shorter",
  "More technical",
  "More bold",
] as const;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatElapsed(startedAt: number): number {
  return Math.round((Date.now() - startedAt) / 100) / 10;
}

type ChatPanelProps = {
  projectTitle: string;
  platform: string;
  durationMs: number;
  intent?: string;
  productUrl?: string;
  templateId?: string;
  isAnalyzing: boolean;
  chatReady: boolean;
  selectedMarker: Marker | null;
  pipelineMarkers: Marker[];
  onBrandAnalyzed: (kit: BrandKit) => void;
  onAnalysisComplete: (result: DraftAnalysisResult) => void;
  onPipelineChange: (pipeline: PipelineState, markers: Marker[]) => void;
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
  templateId,
  isAnalyzing,
  chatReady,
  selectedMarker,
  pipelineMarkers,
  onBrandAnalyzed,
  onAnalysisComplete,
  onPipelineChange,
  onSendMessage,
  onRegenerateScene,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();
  const analyzeBrand = useAnalyzeBrandMutation();
  const { data: billing } = useBillingStatus();
  const { data: usage } = useBillingUsage();

  const hostname = productUrl ? getUrlHostname(productUrl) : undefined;

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === id ? ({ ...message, ...patch } as ChatMessage) : message,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isAnalyzing || analysisStarted) return;

    setAnalysisStarted(true);

    const prompt =
      hostname != null
        ? `Make me a video for ${hostname}`
        : "Make me a video from your recording";

    appendMessage({
      id: createChatId(),
      role: "user",
      content: prompt,
      hostname,
      createdAt: Date.now(),
    });

    const analyzeStatusId = createChatId();
    const analyzeDetailId = createChatId();
    const draftStatusId = createChatId();

    void (async () => {
      const accessToken = session?.accessToken;
      if (!accessToken) return;

      let pipeline = createInitialPipelineState();
      onPipelineChange(pipeline, []);

      appendMessage({
        id: analyzeStatusId,
        role: "status",
        content: "Analyzing your product…",
        createdAt: Date.now(),
      });

      const analyzeStartedAt = Date.now();
      let brandKit: BrandKit | undefined;

      if (productUrl?.trim()) {
        try {
          brandKit = await analyzeBrand.mutateAsync(productUrl.trim());
          onBrandAnalyzed(brandKit);

          appendMessage({
            id: analyzeDetailId,
            role: "analyze-detail",
            createdAt: Date.now(),
            screenshotUrl: brandKit.screenshotUrl,
            pageContent: brandKit.pageContent ?? brandKit.description,
            pageContentChars:
              brandKit.pageContentChars ??
              brandKit.pageContent?.length ??
              brandKit.description?.length,
            brandStyle: inferBrandStyle(brandKit.tone),
            done: true,
          });
        } catch {
          appendMessage({
            id: analyzeDetailId,
            role: "analyze-detail",
            createdAt: Date.now(),
            pageContent:
              "Could not read the page. Continuing with your recording and brief.",
            pageContentChars: 0,
            brandStyle: inferBrandStyle(),
            done: true,
          });
        }
      } else {
        await delay(800);
        appendMessage({
          id: analyzeDetailId,
          role: "analyze-detail",
          createdAt: Date.now(),
          pageContent:
            intent?.trim() ||
            "Using your screen recording to detect clicks, navigation, and key moments.",
          pageContentChars: intent?.trim().length ?? 0,
          brandStyle: inferBrandStyle(),
          done: true,
        });
      }

      updateMessage(analyzeStatusId, {
        done: true,
        elapsedSec: formatElapsed(analyzeStartedAt),
        content: "Analyzing your product…",
      });

      pipeline = advancePipeline(pipeline, "draft");
      onPipelineChange(pipeline, []);

      appendMessage({
        id: draftStatusId,
        role: "status",
        content: "Drafting scenes…",
        createdAt: Date.now(),
      });

      const draftStartedAt = Date.now();
      let liveMarkers: Marker[] = [];

      const result = await runAnalysis(
        (stepIndex, detectedMarkers) => {
          liveMarkers = detectedMarkers;
          onPipelineChange(pipeline, detectedMarkers);

          if (stepIndex >= 2) {
            setMessages((prev) => {
              const next = [...prev];
              for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
                const step = ANALYSIS_STEPS[i];
                if (!step || i > stepIndex) continue;
              }
              return next;
            });
          }
        },
        {
          accessToken,
          title: projectTitle,
          durationMs,
          platform,
          intent: intent ?? brandKit?.description,
          productUrl,
          templateId,
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

      liveMarkers = result.markers;
      const targetDurationSec = Math.round(durationMs / 1000);

      pipeline = advancePipeline(pipeline, "draft", {
        sceneCount: result.markers.length,
        targetDurationSec,
      });
      onPipelineChange(pipeline, liveMarkers);

      updateMessage(draftStatusId, {
        done: true,
        elapsedSec: formatElapsed(draftStartedAt),
        content: "Drafting scenes…",
      });

      const creditsNeeded = sceneCreditsNeeded(result.markers.length);
      const creditsAvailable = getAvailableSceneCredits(billing, usage);
      const enoughCredits =
        !billing ||
        hasEnoughSceneCredits(result.markers.length, billing, usage);

      appendMessage({
        id: createChatId(),
        role: "assistant",
        content: `Draft ready: ${result.markers.length} scenes, ${targetDurationSec}s target. Review it on the right.`,
        createdAt: Date.now(),
      });

      if (!enoughCredits) {
        pipeline = {
          ...advancePipeline(pipeline, "voice"),
          waitingForCredits: true,
        };
        onPipelineChange(pipeline, liveMarkers);

        appendMessage({
          id: createChatId(),
          role: "credits",
          createdAt: Date.now(),
          scenesNeeded: creditsNeeded,
          creditsAvailable: Number.isFinite(creditsAvailable)
            ? creditsAvailable
            : creditsNeeded,
          creditsShortfall: Math.max(0, creditsNeeded - creditsAvailable),
        });

        return;
      }

      pipeline = advancePipeline(pipeline, "voice");
      onPipelineChange(pipeline, liveMarkers);
      await delay(600);

      pipeline = advancePipeline(pipeline, "layout");
      onPipelineChange(pipeline, liveMarkers);
      await delay(500);

      pipeline = advancePipeline(pipeline, "scenes");
      onPipelineChange(pipeline, liveMarkers);
      await delay(700);

      pipeline = advancePipeline(pipeline, "stitch");
      onPipelineChange(pipeline, liveMarkers);

      appendMessage({
        id: createChatId(),
        role: "assistant",
        content:
          "Your video draft is ready. Ask me to change tone, shorten scenes, or make headlines bolder.",
        createdAt: Date.now(),
      });

      onAnalysisComplete({ ...result, brandKit });
    })();
  }, [
    analysisStarted,
    analyzeBrand,
    appendMessage,
    billing,
    durationMs,
    hostname,
    intent,
    isAnalyzing,
    onAnalysisComplete,
    onBrandAnalyzed,
    onPipelineChange,
    platform,
    productUrl,
    projectTitle,
    session?.accessToken,
    templateId,
    updateMessage,
    usage,
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
        onStream: (streamText) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: streamText }
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
        <p className="text-sm font-medium">Arco</p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-4">
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

      <div className="space-y-2 border-t border-border p-3">
        {chatReady && selectedMarker && onRegenerateScene ? (
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
        {chatReady ? (
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
        ) : null}
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
            placeholder={
              chatReady
                ? "Ask me to change something…"
                : "Working on your video…"
            }
            disabled={sending || (isAnalyzing && !chatReady)}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || (isAnalyzing && !chatReady)}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
