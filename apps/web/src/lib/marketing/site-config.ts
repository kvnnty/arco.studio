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
  { label: "Gallery", href: "/gallery" },
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
      { label: "Gallery", href: "/gallery" },
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
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
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
  badge: "Launch offer",
  message: "Make your first Pro video for $9.",
  href: "/pricing",
  linkLabel: "See plans",
};
