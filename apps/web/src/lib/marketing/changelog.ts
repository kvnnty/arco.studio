export type ChangelogEntry = {
  version: string;
  date: string;
  badges?: ("feature" | "improvement" | "fix")[];
  features?: string[];
  improvements?: string[];
  fixes?: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    version: "0.4.0",
    date: "June 18, 2026",
    features: [
      "Dashboard with usage charts and project activity feed",
      "Asset library for exported videos",
      "Notifications derived from project events",
    ],
    improvements: [
      "Faster scene analysis on recordings over 5 minutes",
      "Improved brand color extraction accuracy",
    ],
    fixes: ["Fixed export progress stuck at 99% on slow connections"],
  },
  {
    version: "0.3.0",
    date: "May 28, 2026",
    features: [
      "AI chat assistant in the editor",
      "Brand kit from URL",
      "9:16 and 1:1 aspect ratio exports",
    ],
    improvements: [
      "Redesigned editor journey stepper",
      "Better click detection on mobile recordings",
    ],
  },
  {
    version: "0.2.0",
    date: "May 10, 2026",
    features: [
      "Stripe billing with launch offer pricing",
      "Magic link authentication",
      "Project management dashboard",
    ],
    fixes: ["Resolved login redirect loop on expired sessions"],
  },
  {
    version: "0.1.0",
    date: "April 22, 2026",
    features: [
      "Initial editor with upload, analyze, and export",
      "1080p MP4 rendering via Remotion",
      "Email/password signup and login",
    ],
  },
];
