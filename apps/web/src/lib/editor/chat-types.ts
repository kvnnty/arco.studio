export type BrandStyleSummary = {
  fontFamily: string;
  energy: string;
  audience: string;
};

export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
      createdAt: number;
      hostname?: string;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      createdAt: number;
    }
  | {
      id: string;
      role: "status";
      content: string;
      createdAt: number;
      done?: boolean;
      elapsedSec?: number;
    }
  | {
      id: string;
      role: "analyze-detail";
      createdAt: number;
      screenshotUrl?: string;
      pageContent?: string;
      pageContentChars?: number;
      brandStyle?: BrandStyleSummary;
      done?: boolean;
    }
  | {
      id: string;
      role: "credits";
      createdAt: number;
      scenesNeeded: number;
      creditsAvailable: number;
      creditsShortfall: number;
    }
  | {
      id: string;
      role: "error";
      content: string;
      createdAt: number;
    };

export function createChatId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getUrlHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
