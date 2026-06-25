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
      "Try Arco at a lower price before you commit — built for indie hackers validating a launch.",
    monthlyPrice: 9,
    annualPrice: 9,
    features: [
      "5 MP4 exports",
      "Full editor access",
      "1080p export",
      "Community support",
    ],
    cta: "Get started",
    href: "/signup?plan=trial",
    priceNote: "Entry plan — upgrade to Pro anytime",
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "Everything you need to ship polished product demos every week as a solo founder or product owner.",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      "15 MP4 exports per month",
      "Full editor + AI assistant",
      "Brand from URL + customize panel",
      "1080p in 16:9, 1:1, and 9:16",
      "Music bed + logo overlay",
      "Custom music upload (MP3/WAV)",
      "Priority support",
    ],
    cta: "Start Pro — $29/mo",
    href: "/signup?plan=pro",
    popular: true,
  },
];

export const pricingFaqs = [
  {
    question: "What counts as an export?",
    answer:
      "Each rendered MP4 file counts as one export. Preview renders in the editor do not count toward your limit.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your billing settings and your subscription ends at the close of the current billing period.",
  },
  {
    question: "What's the difference between Intro and Pro?",
    answer:
      "Intro is $9/month with a smaller export limit — a low-commitment way to try Arco. Pro is $29/month with full features including brand from URL, custom music, and all aspect ratios. Choose Pro at checkout if you're already ready to ship demos every week.",
  },
  {
    question: "Do you offer team or seat-based plans?",
    answer:
      "No. Arco is built for indie hackers and product owners working solo — one account, one workspace. No team seats or shared workspaces.",
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
      name: "Exports",
      features: [
        { name: "Monthly exports", trial: "5", pro: "15" },
        { name: "Resolution", trial: "1080p", pro: "1080p" },
        {
          name: "Aspect ratios",
          trial: "16:9",
          pro: "16:9, 1:1, 9:16",
        },
      ],
    },
    {
      name: "Editor",
      features: [
        { name: "AI assistant", trial: true, pro: true },
        { name: "Brand from URL", trial: false, pro: true },
        { name: "Music + logo overlay", trial: false, pro: true },
        { name: "Custom music upload", trial: false, pro: true },
      ],
    },
    {
      name: "Support",
      features: [
        { name: "Community support", trial: true, pro: true },
        { name: "Priority support", trial: false, pro: true },
      ],
    },
  ],
};
