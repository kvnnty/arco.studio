export type VideoType = {
  id: string;
  label: string;
  duration: string;
  examplePrompt: string;
  tagline: string;
};

export const VIDEO_TYPES: VideoType[] = [
  {
    id: "social-ad",
    label: "Social ad",
    duration: "10–15s",
    examplePrompt: "15-second Instagram reel. Energetic, fast cuts.",
    tagline: "Punchy clips for paid social and Reels",
  },
  {
    id: "product-launch",
    label: "Product launch",
    duration: "20–30s",
    examplePrompt: "25-second product launch. Apple keynote energy.",
    tagline: "Ship launch day hero videos on your timeline",
  },
  {
    id: "product-tour",
    label: "Product tour",
    duration: "30–60s",
    examplePrompt: "45-second tour showing the top 3 features.",
    tagline: "Walkthroughs for landing pages and sales",
  },
  {
    id: "brand-reel",
    label: "Brand reel",
    duration: "15–30s",
    examplePrompt: "20-second brand video. Celebrate the design.",
    tagline: "Show off polish without a design agency",
  },
  {
    id: "feature-announcement",
    label: "Feature announcement",
    duration: "15–25s",
    examplePrompt: "Feature announcement highlighting the new AI agents.",
    tagline: "Turn release notes into shareable motion",
  },
  {
    id: "teaser",
    label: "Teaser",
    duration: "8–15s",
    examplePrompt: "10-second teaser. Super minimal. Just the hook.",
    tagline: "Minimal hooks for waitlists and pre-launch",
  },
];

export const VIDEO_BRIEF_HINT =
  "The prompt determines the format. Include a duration and creative direction.";

export const videoTypesMarketing = {
  eyebrow: "Video types",
  title: "Every launch format, one recording",
  description:
    "Product owners use Arco instead of hiring a motion designer. Describe what you need — social ad, launch reel, feature drop — and ship polished video in minutes.",
  footnote:
    "Paste your product URL, pick a format, upload your recording. Arco handles pacing, copy, and motion.",
} as const;

export const productOwnerPitch = {
  eyebrow: "Built for product owners",
  title: "Stop hiring for every launch video",
  description:
    "You already know your product better than any freelancer. Record a walkthrough, tell Arco what you're shipping, and export launch-ready motion — no After Effects, no agency retainer, no waiting on a designer.",
  bullets: [
    "Replace $500–2,000 freelance motion jobs",
    "Same-day turnaround from recording to export",
    "Your real UI — not AI-generated fake screens",
  ],
} as const;
