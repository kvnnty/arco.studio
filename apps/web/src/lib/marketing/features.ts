import {
  Film,
  Layers,
  MousePointerClick,
  Palette,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type StarterPrompt = {
  title: string;
  description: string;
  href: string;
};

export const starterPrompts: StarterPrompt[] = [
  {
    title: "Feature launch",
    description: "Announce a new capability with a crisp walkthrough.",
    href: "/sign-up?brief=feature-launch",
  },
  {
    title: "Social ad",
    description: "A punchy 15-30s clip for LinkedIn, X, or Meta.",
    href: "/sign-up?brief=social-ad",
  },
  {
    title: "Changelog reel",
    description: "Ship what changed this week without a freelancer.",
    href: "/sign-up?brief=changelog",
  },
  {
    title: "Waitlist teaser",
    description: "Build anticipation before your product is live.",
    href: "/sign-up?brief=waitlist",
  },
];

export const coreFeatures: Feature[] = [
  {
    icon: Film,
    title: "Screenshots in",
    description:
      "Upload 3-10 product screenshots plus your URL or brief. No screen recorder required.",
  },
  {
    icon: Sparkles,
    title: "Directed first cut",
    description:
      "Arco structures scenes, pacing, voice-over, and layout into a polished first cut.",
  },
  {
    icon: Palette,
    title: "Brand from URL",
    description:
      "Paste your website URL and Arco extracts colors and logo to match your product identity.",
  },
  {
    icon: MousePointerClick,
    title: "Chat refine",
    description:
      "Ask for punchier CTAs or shorter headlines. Copy and voice-over update without rebuilding.",
  },
  {
    icon: Layers,
    title: "Resolution export",
    description:
      "Export 16:9, 1:1, or 9:16 at 720p, 1080p, or Studio 4K with audio mixed in.",
  },
  {
    icon: Zap,
    title: "Minutes, not hours",
    description:
      "What used to take a motion designer a full day now ships in under ten minutes.",
  },
];

export const workflowSteps = [
  {
    step: "01",
    title: "Paste URL + screenshots",
    description: "Add your product link, a short brief, and 3-10 UI shots.",
  },
  {
    step: "02",
    title: "Review the first cut",
    description:
      "Arco analyzes brand, drafts scenes, records VO, and lays out motion.",
  },
  {
    step: "03",
    title: "Refine and export",
    description:
      "Tweak copy in chat or the inspector, then export a polished MP4.",
  },
];
