export const siteConfig = {
  name: "Arco",
  tagline: "Motion design for product demos",
  description:
    "Upload your app recording. Arco adds zooms, ripples, and titles — then export a launch-ready demo.",
  url: "https://arco.app",
  links: {
    twitter: "https://twitter.com/arco",
    github: "https://github.com/arco",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const mainNav: NavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
];

export type FooterColumn = {
  title: string;
  links: NavItem[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
      {
        label: "Contact",
        href: "mailto:hello@arco.app",
        external: true,
      },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/docs/help" },
      { label: "API Reference", href: "/docs/api" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export const announcement = {
  enabled: true,
  message: "Launch offer — Pro is $9 for your first month.",
  href: "/pricing",
  linkLabel: "View pricing",
};
