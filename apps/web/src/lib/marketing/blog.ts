export type BlogAuthor = {
  name: string;
  role: string;
  avatar?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: BlogAuthor;
  publishedAt: string;
  readingTime: string;
  featured?: boolean;
  content: BlogSection[];
};

export type BlogSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; id: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] };

export const blogPosts: BlogPost[] = [
  {
    slug: "why-product-demos-matter",
    title: "Why product demos are your highest-converting asset",
    excerpt:
      "Screen recordings with motion design outperform static screenshots by 3x. Here's the data and how to ship them fast.",
    category: "Growth",
    author: { name: "Alex Rivera", role: "CEO, Arco" },
    publishedAt: "June 12, 2026",
    readingTime: "6 min read",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "Every SaaS company knows the landing page hero matters. But the asset inside that hero — the product demo — is often an afterthought. A raw Loom recording with a cursor bouncing around doesn't convert. A motion-designed walkthrough does.",
      },
      {
        type: "heading",
        text: "The conversion gap",
        id: "conversion-gap",
      },
      {
        type: "paragraph",
        text: "We analyzed 200 B2B landing pages and found that pages with polished product videos had 2.8x higher signup rates compared to static hero images. The difference wasn't production quality alone — it was clarity. Viewers understood the product in under 30 seconds.",
      },
      {
        type: "heading",
        text: "What great demos have in common",
        id: "great-demos",
      },
      {
        type: "list",
        items: [
          "Every click is highlighted so nothing is missed",
          "Zoom transitions guide the eye to what matters",
          "Brand colors and typography match the product",
          "The video is under 90 seconds",
        ],
      },
      {
        type: "heading",
        text: "Ship faster with automation",
        id: "automation",
      },
      {
        type: "paragraph",
        text: "Arco automates the motion design layer so your team can record once and export a launch-ready demo in minutes. No After Effects. No freelance motion designers. Just upload and ship.",
      },
    ],
  },
  {
    slug: "introducing-brand-from-url",
    title: "Introducing the brand-from-URL feature",
    excerpt:
      "Paste your website and Arco extracts colors, fonts, and logo to style every demo automatically.",
    category: "Product",
    author: { name: "Jordan Lee", role: "Engineering, Arco" },
    publishedAt: "May 30, 2026",
    readingTime: "4 min read",
    content: [
      {
        type: "paragraph",
        text: "Brand consistency across marketing assets is hard when every demo is a one-off screen recording. Our new brand-from-URL feature solves this by reading your public website and building a brand kit automatically.",
      },
      {
        type: "heading",
        text: "How it works",
        id: "how-it-works",
      },
      {
        type: "paragraph",
        text: "When you paste a URL in the editor, Arco fetches the page, extracts dominant colors, detects the logo, and infers typography. These tokens are applied to title cards, lower thirds, and accent elements throughout your video.",
      },
      {
        type: "code",
        language: "typescript",
        code: `// Brand kit is stored per project\nconst brand = await extractBrandFromUrl("https://yourapp.com");\n// { primary: "#e5ff00", font: "Figtree", logo: "..." }`,
      },
    ],
  },
  {
    slug: "editor-ai-assistant",
    title: "Meet the Arco AI assistant",
    excerpt:
      "Chat with your project to rewrite titles, adjust timing, and refine scenes without touching a timeline.",
    category: "Product",
    author: { name: "Sam Okonkwo", role: "Product, Arco" },
    publishedAt: "May 22, 2026",
    readingTime: "5 min read",
    content: [
      {
        type: "paragraph",
        text: "Traditional video editors assume you want to scrub a timeline. Arco assumes you want to describe what you need in plain language. The AI assistant understands your project context and applies changes directly.",
      },
      {
        type: "heading",
        text: "Example prompts",
        id: "example-prompts",
      },
      {
        type: "list",
        items: [
          "Make the intro title shorter and punchier",
          "Add a zoom on the settings page click",
          "Switch to a darker brand palette",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 2): BlogPost[] {
  const current = getBlogPost(slug);
  if (!current) return blogPosts.slice(0, limit);
  return blogPosts.filter((p) => p.slug !== slug).slice(0, limit);
}
