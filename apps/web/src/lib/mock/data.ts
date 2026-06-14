export type ProjectStatus = "draft" | "processing" | "completed";

export type MockProject = {
  id: string;
  title: string;
  status: ProjectStatus;
  platform: string;
  exportFormat: string;
  markerCount: number;
  updatedAt: string;
  createdAt: string;
  thumbnail?: string;
};

export type MockAsset = {
  id: string;
  name: string;
  type: "recording" | "output";
  size: string;
  duration?: string;
  createdAt: string;
};

export type MockInvoice = {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  plan: string;
};

export type MockNotification = {
  id: string;
  title: string;
  description: string;
  type: "system" | "processing" | "billing";
  read: boolean;
  createdAt: string;
};

export type MockTeamMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
  joinedAt: string;
};

export type MockActivity = {
  id: string;
  action: string;
  target: string;
  timestamp: string;
};

export const MOCK_WORKSPACES = [
  { id: "ws-1", name: "Sploy", slug: "sploy" },
  { id: "ws-2", name: "Personal", slug: "personal" },
];

export const MOCK_CREDITS = {
  balance: 240,
  monthlyAllowance: 500,
  usedThisMonth: 260,
};

export const MOCK_PLAN = {
  name: "Pro",
  price: 49,
  interval: "month" as const,
  features: [
    "500 credits / month",
    "Unlimited projects",
    "1080p exports",
    "Team collaboration",
  ],
};

export const MOCK_USAGE_DATA = [
  { day: "Mon", credits: 42 },
  { day: "Tue", credits: 38 },
  { day: "Wed", credits: 55 },
  { day: "Thu", credits: 28 },
  { day: "Fri", credits: 47 },
  { day: "Sat", credits: 12 },
  { day: "Sun", credits: 38 },
];

export const MOCK_USAGE_BREAKDOWN = [
  { label: "Video generation", credits: 180, percentage: 69 },
  { label: "Re-renders", credits: 45, percentage: 17 },
  { label: "Style previews", credits: 25, percentage: 10 },
  { label: "Exports", credits: 10, percentage: 4 },
];

export const MOCK_INVOICES: MockInvoice[] = [
  {
    id: "inv_001",
    date: "2026-06-01",
    amount: "$49.00",
    status: "paid",
    plan: "Pro",
  },
  {
    id: "inv_002",
    date: "2026-05-01",
    amount: "$49.00",
    status: "paid",
    plan: "Pro",
  },
  {
    id: "inv_003",
    date: "2026-04-01",
    amount: "$49.00",
    status: "paid",
    plan: "Pro",
  },
];

export const MOCK_ASSETS: MockAsset[] = [
  {
    id: "asset-1",
    name: "onboarding-flow.mp4",
    type: "recording",
    size: "24.5 MB",
    duration: "2:34",
    createdAt: "2026-06-10T14:30:00Z",
  },
  {
    id: "asset-2",
    name: "dashboard-walkthrough.mov",
    type: "recording",
    size: "18.2 MB",
    duration: "1:52",
    createdAt: "2026-06-08T09:15:00Z",
  },
  {
    id: "asset-3",
    name: "launch-demo-v2.mp4",
    type: "output",
    size: "32.1 MB",
    duration: "0:45",
    createdAt: "2026-06-05T16:45:00Z",
  },
];

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif-1",
    title: "Export complete",
    description: "Your launch demo video is ready to download.",
    type: "processing",
    read: false,
    createdAt: "2026-06-11T10:30:00Z",
  },
  {
    id: "notif-2",
    title: "Credits running low",
    description: "You have 240 credits remaining this billing period.",
    type: "billing",
    read: false,
    createdAt: "2026-06-10T08:00:00Z",
  },
  {
    id: "notif-3",
    title: "New feature: Style presets",
    description: "Try our new motion style presets for faster exports.",
    type: "system",
    read: true,
    createdAt: "2026-06-08T12:00:00Z",
  },
  {
    id: "notif-4",
    title: "Processing started",
    description: "Your project 'Product tour' is being processed.",
    type: "processing",
    read: true,
    createdAt: "2026-06-07T15:20:00Z",
  },
];

export const MOCK_TEAM: MockTeamMember[] = [
  {
    id: "member-1",
    name: "Kevin Chen",
    email: "kevin@sploy.io",
    role: "admin",
    joinedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "member-2",
    name: "Sarah Kim",
    email: "sarah@sploy.io",
    role: "editor",
    joinedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "member-3",
    name: "Alex Rivera",
    email: "alex@sploy.io",
    role: "viewer",
    joinedAt: "2026-05-01T00:00:00Z",
  },
];

export const MOCK_ACTIVITY: MockActivity[] = [
  {
    id: "act-1",
    action: "Created project",
    target: "Onboarding flow",
    timestamp: "2026-06-11T14:30:00Z",
  },
  {
    id: "act-2",
    action: "Exported video",
    target: "Launch demo v2",
    timestamp: "2026-06-10T09:15:00Z",
  },
  {
    id: "act-3",
    action: "Uploaded recording",
    target: "dashboard-walkthrough.mov",
    timestamp: "2026-06-08T11:00:00Z",
  },
];

export const CREDIT_PACKS = [
  { id: "pack-100", credits: 100, price: 15 },
  { id: "pack-500", credits: 500, price: 60, popular: true },
  { id: "pack-1000", credits: 1000, price: 100 },
];

export const PLAN_OPTIONS = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    credits: 100,
    features: ["100 credits / month", "3 projects", "720p exports"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    credits: 500,
    features: [
      "500 credits / month",
      "Unlimited projects",
      "1080p exports",
      "Team collaboration",
    ],
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    credits: 2000,
    features: [
      "2000 credits / month",
      "Priority rendering",
      "4K exports",
      "SSO & audit logs",
    ],
  },
];

export const STYLE_PRESETS = [
  { id: "minimal", name: "Minimal", description: "Clean zooms and subtle motion" },
  { id: "dynamic", name: "Dynamic", description: "Bold transitions and emphasis" },
  { id: "cinematic", name: "Cinematic", description: "Slow pans and depth effects" },
  { id: "playful", name: "Playful", description: "Bouncy animations and ripples" },
];

export const FORMAT_OPTIONS = [
  { id: "16:9", label: "Landscape", ratio: "16:9", description: "YouTube, website" },
  { id: "9:16", label: "Portrait", ratio: "9:16", description: "TikTok, Reels" },
  { id: "1:1", label: "Square", ratio: "1:1", description: "Social posts" },
];

export function mergeProjectsWithMock(
  projects: Array<{
    id: string;
    title: string;
    platform: string;
    exportFormat: string;
    markerCount: number;
    updatedAt: string;
    createdAt: string;
  }>,
): MockProject[] {
  const statusCycle: ProjectStatus[] = ["draft", "processing", "completed"];
  return projects.map((p, i) => ({
    ...p,
    status: statusCycle[i % statusCycle.length] ?? "draft",
  }));
}

export function getMockProject(id: string): MockProject | null {
  return {
    id,
    title: "Product onboarding tour",
    status: "processing",
    platform: "web",
    exportFormat: "16:9",
    markerCount: 8,
    updatedAt: "2026-06-11T14:30:00Z",
    createdAt: "2026-06-10T10:00:00Z",
  };
}
