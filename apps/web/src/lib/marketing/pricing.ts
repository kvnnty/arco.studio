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
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Starter",
    description: "Try Arco with a single export to validate your workflow.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "1 MP4 export",
      "Full editor access",
      "1080p export",
      "Community support",
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Everything you need to ship polished product demos every week.",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      "15 MP4 exports per month",
      "Full editor + AI assistant",
      "Brand from URL + customize panel",
      "1080p in 16:9, 1:1, and 9:16",
      "Music bed + logo overlay",
      "Priority support",
    ],
    cta: "Start Pro trial",
    href: "/signup",
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    description: "For growing product teams that need shared workspaces.",
    monthlyPrice: 79,
    annualPrice: 66,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Shared brand kits",
      "50 exports per month",
      "Audit logs",
      "Dedicated support",
    ],
    cta: "Email sales",
    href: "mailto:hello@arco.app?subject=Arco%20Team%20Plan",
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
    question: "Is there a launch discount?",
    answer:
      "New Pro subscribers get their first month for $9, then $29/month. The discount applies automatically at checkout.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes. Annual billing saves roughly 17% compared to paying monthly.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards through Stripe. Invoicing is available for Team plans on request.",
  },
];

export const featureComparison = {
  categories: [
    {
      name: "Exports",
      features: [
        { name: "Monthly exports", starter: "1", pro: "15", team: "50" },
        { name: "Resolution", starter: "1080p", pro: "1080p", team: "1080p" },
        { name: "Aspect ratios", starter: "16:9", pro: "16:9, 1:1, 9:16", team: "16:9, 1:1, 9:16" },
      ],
    },
    {
      name: "Editor",
      features: [
        { name: "AI assistant", starter: true, pro: true, team: true },
        { name: "Brand from URL", starter: false, pro: true, team: true },
        { name: "Music + logo overlay", starter: false, pro: true, team: true },
        { name: "Shared brand kits", starter: false, pro: false, team: true },
      ],
    },
    {
      name: "Support",
      features: [
        { name: "Community support", starter: true, pro: true, team: true },
        { name: "Priority support", starter: false, pro: true, team: true },
        { name: "Dedicated support", starter: false, pro: false, team: true },
      ],
    },
  ],
};
