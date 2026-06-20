export type DocPage = {
  slug: string[];
  title: string;
  description: string;
  sections: DocSection[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
};

export type DocSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; id: string; level?: 2 | 3 }
  | { type: "code"; language: string; code: string; title?: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; variant: "info" | "warning" | "tip"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type DocNavGroup = {
  title: string;
  items: { title: string; href: string }[];
};

export const docsNavigation: DocNavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quickstart", href: "/docs/quickstart" },
      { title: "Your first export", href: "/docs/first-export" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Brand kits", href: "/docs/guides/brand-kits" },
      { title: "AI assistant", href: "/docs/guides/ai-assistant" },
      { title: "Export formats", href: "/docs/guides/export-formats" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Authentication", href: "/docs/api" },
      { title: "Projects", href: "/docs/api/projects" },
      { title: "Renders", href: "/docs/api/renders" },
    ],
  },
  {
    title: "Help",
    items: [
      { title: "FAQ", href: "/docs/help" },
      { title: "Troubleshooting", href: "/docs/help/troubleshooting" },
    ],
  },
];

const docsPages: Record<string, DocPage> = {
  "": {
    slug: [],
    title: "Introduction",
    description: "Welcome to Arco documentation.",
    next: { title: "Quickstart", href: "/docs/quickstart" },
    sections: [
      {
        type: "paragraph",
        text: "Arco transforms screen recordings into motion-designed promotional videos. Upload a recording, let AI analyze your scenes, customize the result, and export a polished MP4 in minutes.",
      },
      {
        type: "heading",
        text: "What you can build",
        id: "what-you-can-build",
      },
      {
        type: "list",
        items: [
          "Landing page hero videos",
          "Product walkthrough demos",
          "Social media clips in 1:1 and 9:16",
          "Onboarding and feature announcement videos",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "New to Arco? Start with the Quickstart guide to create your first export in under 10 minutes.",
      },
    ],
  },
  quickstart: {
    slug: ["quickstart"],
    title: "Quickstart",
    description: "Create your first Arco project and export a demo video.",
    prev: { title: "Introduction", href: "/docs" },
    next: { title: "Your first export", href: "/docs/first-export" },
    sections: [
      {
        type: "heading",
        text: "Prerequisites",
        id: "prerequisites",
      },
      {
        type: "list",
        items: [
          "An Arco account (sign up free at /signup)",
          "A screen recording of your product (MP4 or WebM)",
        ],
      },
      {
        type: "heading",
        text: "Steps",
        id: "steps",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Sign in and click New Project on the dashboard",
          "Upload your screen recording",
          "Wait for scene analysis to complete",
          "Review and customize titles, brand, and music",
          "Click Export to render your MP4",
        ],
      },
      {
        type: "code",
        language: "bash",
        title: "CLI (coming soon)",
        code: `# Export via API\narco projects create --recording ./demo.mp4\narco renders start --project proj_abc123`,
      },
    ],
  },
  "first-export": {
    slug: ["first-export"],
    title: "Your first export",
    description: "Tips for getting the best results from your first Arco export.",
    prev: { title: "Quickstart", href: "/docs/quickstart" },
    next: { title: "Brand kits", href: "/docs/guides/brand-kits" },
    sections: [
      {
        type: "paragraph",
        text: "Your first export sets the tone for every demo you ship. Follow these guidelines to get professional results on the first try.",
      },
      {
        type: "heading",
        text: "Recording tips",
        id: "recording-tips",
      },
      {
        type: "list",
        items: [
          "Record at 1920×1080 or higher",
          "Move the cursor deliberately — pause briefly after each click",
          "Keep recordings under 3 minutes for best analysis",
          "Close unrelated tabs and notifications",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Exports count toward your plan limit. Preview in the editor as much as you like — only final renders count.",
      },
    ],
  },
  "guides/brand-kits": {
    slug: ["guides", "brand-kits"],
    title: "Brand kits",
    description: "Extract and apply your brand identity automatically.",
    prev: { title: "Your first export", href: "/docs/first-export" },
    next: { title: "AI assistant", href: "/docs/guides/ai-assistant" },
    sections: [
      {
        type: "paragraph",
        text: "Brand kits ensure every demo matches your product's visual identity. Arco can extract brand tokens from your website URL or let you set them manually.",
      },
      {
        type: "heading",
        text: "Extract from URL",
        id: "extract-from-url",
      },
      {
        type: "paragraph",
        text: "In the customize panel, paste your public website URL. Arco reads the page and extracts primary colors, typography, and logo assets.",
      },
    ],
  },
  "guides/ai-assistant": {
    slug: ["guides", "ai-assistant"],
    title: "AI assistant",
    description: "Use natural language to edit your project.",
    prev: { title: "Brand kits", href: "/docs/guides/brand-kits" },
    next: { title: "Export formats", href: "/docs/guides/export-formats" },
    sections: [
      {
        type: "paragraph",
        text: "The AI assistant understands your project context. Open the chat panel in the editor and describe the changes you want.",
      },
      {
        type: "heading",
        text: "Example prompts",
        id: "example-prompts",
      },
      {
        type: "list",
        items: [
          "Shorten the intro title to 5 words",
          "Add a zoom when I click the settings icon",
          "Use a darker background for title cards",
        ],
      },
    ],
  },
  "guides/export-formats": {
    slug: ["guides", "export-formats"],
    title: "Export formats",
    description: "Choose the right aspect ratio for each channel.",
    prev: { title: "AI assistant", href: "/docs/guides/ai-assistant" },
    next: { title: "Authentication", href: "/docs/api" },
    sections: [
      {
        type: "table",
        headers: ["Format", "Resolution", "Best for"],
        rows: [
          ["16:9", "1920×1080", "Landing pages, YouTube"],
          ["1:1", "1080×1080", "LinkedIn, Instagram feed"],
          ["9:16", "1080×1920", "Stories, TikTok, Reels"],
        ],
      },
    ],
  },
  api: {
    slug: ["api"],
    title: "Authentication",
    description: "Authenticate with the Arco API.",
    prev: { title: "Export formats", href: "/docs/guides/export-formats" },
    next: { title: "Projects", href: "/docs/api/projects" },
    sections: [
      {
        type: "paragraph",
        text: "The Arco API uses bearer token authentication. Generate an API key from Dashboard → Settings → API Keys.",
      },
      {
        type: "code",
        language: "bash",
        title: "Example request",
        code: `curl https://api.arco.app/v1/projects \\\n  -H "Authorization: Bearer arco_live_..."`,
      },
      {
        type: "callout",
        variant: "info",
        text: "API access is available on Pro and Team plans. Keys are scoped to your workspace.",
      },
    ],
  },
  "api/projects": {
    slug: ["api", "projects"],
    title: "Projects",
    description: "Create and manage projects via the API.",
    prev: { title: "Authentication", href: "/docs/api" },
    next: { title: "Renders", href: "/docs/api/renders" },
    sections: [
      {
        type: "heading",
        text: "List projects",
        id: "list-projects",
      },
      {
        type: "code",
        language: "bash",
        code: `GET /v1/projects\n\nResponse:\n{\n  "data": [{ "id": "proj_abc", "name": "Launch demo", "status": "ready" }]\n}`,
      },
    ],
  },
  "api/renders": {
    slug: ["api", "renders"],
    title: "Renders",
    description: "Start and monitor render jobs.",
    prev: { title: "Projects", href: "/docs/api/projects" },
    next: { title: "FAQ", href: "/docs/help" },
    sections: [
      {
        type: "code",
        language: "bash",
        code: `POST /v1/projects/:id/renders\n{\n  "format": "16:9",\n  "quality": "1080p"\n}`,
      },
    ],
  },
  help: {
    slug: ["help"],
    title: "FAQ",
    description: "Frequently asked questions.",
    prev: { title: "Renders", href: "/docs/api/renders" },
    next: { title: "Troubleshooting", href: "/docs/help/troubleshooting" },
    sections: [
      {
        type: "heading",
        text: "How do exports work?",
        id: "exports-faq",
      },
      {
        type: "paragraph",
        text: "Each rendered MP4 counts as one export. Preview renders in the editor are free and unlimited.",
      },
      {
        type: "heading",
        text: "Can I cancel my subscription?",
        id: "cancel-faq",
      },
      {
        type: "paragraph",
        text: "Yes. Go to Dashboard → Billing and click Manage subscription. Your access continues until the end of the billing period.",
      },
    ],
  },
  "help/troubleshooting": {
    slug: ["help", "troubleshooting"],
    title: "Troubleshooting",
    description: "Common issues and fixes.",
    prev: { title: "FAQ", href: "/docs/help" },
    sections: [
      {
        type: "heading",
        text: "Analysis stuck",
        id: "analysis-stuck",
      },
      {
        type: "paragraph",
        text: "If scene analysis doesn't complete within 5 minutes, try re-uploading the recording. Ensure the file is under 500MB and in MP4 or WebM format.",
      },
      {
        type: "heading",
        text: "Export failed",
        id: "export-failed",
      },
      {
        type: "paragraph",
        text: "Check your export quota on the Usage page. If you have remaining exports, contact support@arco.app with your project ID.",
      },
    ],
  },
};

export function getDocPage(slug: string[]): DocPage | undefined {
  const key = slug.join("/");
  return docsPages[key];
}

export function getAllDocSlugs(): string[][] {
  return Object.values(docsPages).map((p) => p.slug);
}
