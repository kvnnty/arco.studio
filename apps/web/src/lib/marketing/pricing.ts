export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
  priceNote?: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "trial",
    name: "Intro",
    description:
      "Try Arco at a lower price — built for product owners validating a launch without hiring video help.",
    monthlyPrice: 9,
    annualPrice: 9,
    features: [
      "5 active projects",
      "Unlimited re-exports per project",
      "720p export",
      "Up to 2 min per video",
      "Full editor access",
      "Community support",
    ],
    cta: "Get started",
    href: "/signup?plan=trial",
    priceNote: "Delete a project to free a slot for a new one",
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "Ship polished launch videos every week — without hiring a motion designer each time.",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      "15 active projects",
      "Unlimited re-exports per project",
      "Up to 1080p export",
      "Up to 5 min per video",
      "Brand from URL + custom music",
      "AI assistant + voiceover",
      "Priority support",
    ],
    cta: "Start Pro — $29/mo",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    description:
      "For founders shipping at the highest quality — 4K export, no project cap.",
    monthlyPrice: 59,
    annualPrice: 49,
    features: [
      "Unlimited active projects",
      "Up to 4K export",
      "Up to 10 min per video",
      "Everything in Pro",
      "Priority render queue",
    ],
    cta: "Start Studio — $59/mo",
    href: "/signup?plan=studio",
  },
];

export const pricingFaqs = [
  {
    question: "What counts toward my limit?",
    answer:
      "Active projects in your workspace. Delete a project to free a slot and create a new one. Re-exporting the same project unlimited times does not use extra slots.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your billing settings and your subscription ends at the close of the current billing period.",
  },
  {
    question: "What's the difference between Intro, Pro, and Studio?",
    answer:
      "Intro ($9) gives 5 active projects, 720p export, and videos up to 2 minutes. Pro ($29) gives 15 projects, up to 1080p export, videos up to 5 minutes, and full brand/audio features. Studio ($59) adds unlimited projects, up to 4K export, and videos up to 10 minutes.",
  },
  {
    question: "Do you offer team or seat-based plans?",
    answer:
      "No. Arco is built for indie hackers and product owners working solo — one account, one workspace.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes. Annual billing saves roughly 17% compared to paying monthly.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe.",
  },
];

export const featureComparison = {
  categories: [
    {
      name: "Workspace",
      features: [
        { name: "Active projects", trial: "5", pro: "15", studio: "Unlimited" },
        {
          name: "Re-exports per project",
          trial: "Unlimited",
          pro: "Unlimited",
          studio: "Unlimited",
        },
      ],
    },
    {
      name: "Export",
      features: [
        { name: "720p", trial: true, pro: true, studio: true },
        { name: "1080p", trial: false, pro: true, studio: true },
        { name: "4K", trial: false, pro: false, studio: true },
        { name: "Max video length", trial: "2 min", pro: "5 min", studio: "10 min" },
      ],
    },
    {
      name: "Editor",
      features: [
        { name: "AI assistant", trial: true, pro: true, studio: true },
        { name: "Brand from URL", trial: false, pro: true, studio: true },
        { name: "Custom music upload", trial: false, pro: true, studio: true },
        { name: "Voiceover", trial: true, pro: true, studio: true },
      ],
    },
  ],
};
