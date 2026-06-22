export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
  billing: {
    status: ["billing", "status"] as const,
    usage: ["billing", "usage"] as const,
  },
  renders: {
    detail: (id: string) => ["renders", id] as const,
  },
  settings: {
    sessions: ["settings", "sessions"] as const,
  },
  referrals: {
    summary: ["referrals", "summary"] as const,
  },
} as const;
