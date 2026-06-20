export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "processing"
  | "completed"
  | "failed";

export type DashboardActivity = {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  href?: string;
};

export type DashboardAsset = {
  id: string;
  name: string;
  type: "recording" | "output";
  projectId: string;
  createdAt: string;
  href: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  description: string;
  type: "system" | "processing" | "billing";
  read: boolean;
  createdAt: string;
  href?: string;
};
