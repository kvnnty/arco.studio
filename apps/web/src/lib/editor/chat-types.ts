export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
      createdAt: number;
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
