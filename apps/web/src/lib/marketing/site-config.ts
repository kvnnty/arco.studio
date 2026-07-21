export const siteConfig = {
  name: "Arco",
  tagline: "Studio-quality product motion",
  description:
    "Create studio-quality product launch videos, feature announcements, and app showcases without hiring a motion designer.",
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
  { label: "Examples", href: "/#examples" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/features" },
];

export type FooterColumn = {
  title: string;
  links: NavItem[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Examples", href: "/#examples" },
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
  enabled: false,
  badge: "Launch offer",
  message: "Make your first Pro video for $9.",
  href: "/pricing",
  linkLabel: "See plans",
};
