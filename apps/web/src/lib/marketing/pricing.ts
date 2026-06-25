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
      "Try Arco at a lower price — built for indie hackers validating a launch.",
    monthlyPrice: 9,
    annualPrice: 9,
    features: [
      "5 active projects",
      "Unlimited re-exports per project",
      "1080p · 16:9 only",
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
      "Ship polished demos every week as a solo founder or product owner.",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      "15 active projects",
      "Unlimited re-exports per project",
      "1080p in 16:9, 1:1, and 9:16",
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
      "For founders shipping across every channel — 4K, social packs, no project cap.",
    monthlyPrice: 59,
    annualPrice: 49,
    features: [
      "Unlimited active projects",
      "4K export + social format pack",
      "Everything in Pro",
      "Batch export all aspect ratios",
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
      "Intro ($9) gives 5 active projects and 16:9 exports. Pro ($29) gives 15 projects, all social aspect ratios at 1080p, and full brand/audio features. Studio ($59) adds unlimited projects, 4K, and one-click social export packs.",
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
        { name: "1080p", trial: true, pro: true, studio: true },
        { name: "4K", trial: false, pro: false, studio: true },
        { name: "16:9", trial: true, pro: true, studio: true },
        { name: "1:1 + 9:16 social", trial: false, pro: true, studio: true },
        { name: "Batch social export pack", trial: false, pro: false, studio: true },
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
