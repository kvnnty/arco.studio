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

export const ANNUAL_SAVINGS_LABEL = "Save 17%";

export function planDisplayPrice(plan: PricingPlan, annual: boolean): number {
  return annual ? plan.annualPrice : plan.monthlyPrice;
}

export function planHasAnnualDiscount(plan: PricingPlan): boolean {
  return plan.annualPrice < plan.monthlyPrice;
}

export function planAnnualTotal(plan: PricingPlan): number {
  return plan.annualPrice * 12;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "trial",
    name: "Intro",
    description:
      "For exploring ideas and trying Arco out.",
    monthlyPrice: 9,
    annualPrice: 9,
    features: [
      "200 credits per month",
      "Unlimited projects",
      "720p export",
      "Up to 2 min per video",
      "Full editor access",
      "Community support",
    ],
    cta: "Get Intro",
    href: "/sign-up?plan=trial",
    priceNote: "Top up anytime — 200 credits per pack",
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "For makers and small teams shipping every week.",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      "1,250 credits per month",
      "Unlimited projects",
      "Up to 1080p export",
      "Up to 5 min per video",
      "Brand from URL + custom music",
      "AI assistant + voiceover",
      "Priority support",
    ],
    cta: "Get Pro",
    href: "/sign-up?plan=pro",
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    description:
      "For founders shipping at the highest quality — 4K and high volume.",
    monthlyPrice: 59,
    annualPrice: 49,
    features: [
      "3,000 credits per month",
      "Unlimited projects",
      "Up to 4K export",
      "Up to 10 min per video",
      "Everything in Pro",
      "Priority render queue",
    ],
    cta: "Get Studio",
    href: "/sign-up?plan=studio",
  },
];

export const pricingFaqs = [
  {
    question: "How do credits work?",
    answer:
      "Your plan includes monthly credits. AI storyboard and voiceover spend credits — exports are included with your plan. Turn voice off when creating a video to skip narration and use fewer credits. Top up anytime if you need more before your next billing period.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your billing settings and your subscription ends at the close of the current billing period.",
  },
  {
    question: "What's the difference between Intro, Pro, and Studio?",
    answer:
      "Intro ($9) includes 200 monthly credits, 720p export, and videos up to 2 minutes. Pro ($29) includes 1,250 credits, up to 1080p export, videos up to 5 minutes, and full brand/audio features. Studio ($59) includes 3,000 credits, up to 4K export, and videos up to 10 minutes.",
  },
  {
    question: "Is voiceover required?",
    answer:
      "No. You can turn AI voiceover off in the composer or Customize panel. Videos without voice use music and on-screen text only, and do not spend voice credits.",
  },
  {
    question: "Do you offer team or seat-based plans?",
    answer:
      "No. Arco is built for indie hackers and product owners working solo — one account, one workspace.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes — and it's the best value. Annual billing saves 17% compared to paying monthly (two months free on Pro and Studio). You pay once per year and lock in the lower rate.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Polar.",
  },
];

export const featureComparison = {
  categories: [
    {
      name: "Credits",
      features: [
        { name: "Monthly credits", trial: "200", pro: "1,250", studio: "3,000" },
        { name: "Credit top-ups", trial: true, pro: true, studio: true },
        { name: "Unlimited projects", trial: true, pro: true, studio: true },
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
        { name: "AI voiceover", trial: true, pro: true, studio: true },
      ],
    },
  ],
};
