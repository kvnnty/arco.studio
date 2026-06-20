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

export const heroFeatures = [
  "AI-powered scene detection",
  "Brand-aware styling",
  "Export in minutes",
];

export const coreFeatures: Feature[] = [
  {
    icon: Film,
    title: "Upload once",
    description:
      "Drop a screen recording and Arco analyzes every scene, click, and transition automatically.",
  },
  {
    icon: Sparkles,
    title: "AI motion design",
    description:
      "Smart zooms, ripples, and title cards are applied based on what happens on screen — no timeline editing.",
  },
  {
    icon: Palette,
    title: "Brand from URL",
    description:
      "Paste your website URL and Arco extracts colors, fonts, and logo to match your product identity.",
  },
  {
    icon: MousePointerClick,
    title: "Click highlights",
    description:
      "Every interaction gets a subtle ripple and focus treatment so viewers never miss the action.",
  },
  {
    icon: Layers,
    title: "Multi-format export",
    description:
      "Ship demos in 16:9 for landing pages, 1:1 for social, and 9:16 for stories — all from one project.",
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
    title: "Record your product",
    description: "Capture a walkthrough of your app with any screen recorder.",
  },
  {
    step: "02",
    title: "Arco analyzes scenes",
    description: "AI detects clicks, scrolls, and key moments to highlight.",
  },
  {
    step: "03",
    title: "Customize and export",
    description: "Tweak copy, brand, and music — then export a polished MP4.",
  },
];

export const testimonials = [
  {
    quote:
      "We replaced our entire motion design contractor with Arco. Our launch demos now ship the same day we record.",
    author: "Sarah Chen",
    role: "Head of Product, Latticeflow",
  },
  {
    quote:
      "The brand-from-URL feature alone saved us hours. Every demo looks like it came from our design team.",
    author: "Marcus Webb",
    role: "Founder, Stackline",
  },
  {
    quote:
      "Our conversion rate on the landing page jumped 34% after switching to Arco-generated product videos.",
    author: "Elena Rodriguez",
    role: "Growth Lead, Nomad OS",
  },
];

export const logoCloud = [
  "Latticeflow",
  "Stackline",
  "Nomad OS",
  "Clearpath",
  "Forma",
  "Relay",
];
