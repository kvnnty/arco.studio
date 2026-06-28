import {
  Code2,
  Megaphone,
  Palette,
  Play,
  Rocket,
  Smartphone,
  Sparkles,
  UserCog,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ONBOARDING_STEPS = ["profile", "persona", "goals", "plan"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function resolveOnboardingStep(step: string): OnboardingStep {
  if (ONBOARDING_STEPS.includes(step as OnboardingStep)) {
    return step as OnboardingStep;
  }
  return "profile";
}

export type OnboardingPersona = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const ONBOARDING_PERSONAS: OnboardingPersona[] = [
  { id: "product-owner", label: "Product owner", icon: UserCog },
  { id: "founder", label: "Founder", icon: Rocket },
  { id: "marketer", label: "Marketer", icon: Megaphone },
  { id: "developer", label: "Developer", icon: Code2 },
  { id: "agency", label: "Agency", icon: Users },
  { id: "exploring", label: "Just exploring", icon: Sparkles },
];

export type OnboardingGoal = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const ONBOARDING_GOALS: OnboardingGoal[] = [
  { id: "social-ads", label: "Social ads", icon: Smartphone },
  { id: "product-launch", label: "Product launch videos", icon: Rocket },
  { id: "product-tour", label: "Product tours", icon: Play },
  { id: "feature-announcement", label: "Feature announcements", icon: Sparkles },
  { id: "brand-reel", label: "Brand reels", icon: Palette },
  { id: "teaser", label: "Teasers & hooks", icon: Zap },
];

export const ONBOARDING_PLAN_SUMMARY =
  "Pro is the best way to get started — ship every social format without hiring a motion designer.";
