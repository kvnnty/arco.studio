import type { Metadata } from "next";

import { siteConfig } from "@/lib/marketing/site-config";

export const metadataBase = new URL(siteConfig.url);

const defaultOpenGraphImage = "/opengraph-image";

export const titleTemplate = `%s — ${siteConfig.name}`;

export const defaultTitle = `${siteConfig.name} — ${siteConfig.tagline}`;

function stripBrandSuffix(title: string): string {
  for (const separator of [" — ", " - "]) {
    const suffix = `${separator}${siteConfig.name}`;
    if (title.endsWith(suffix)) {
      return title.slice(0, -suffix.length);
    }
  }

  return title;
}

function formatFullTitle(title: string): string {
  const shortTitle = stripBrandSuffix(title);

  if (
    shortTitle === siteConfig.name ||
    shortTitle.startsWith(`${siteConfig.name} —`) ||
    shortTitle.startsWith(`${siteConfig.name} -`)
  ) {
    return shortTitle.replace(" - ", " — ");
  }

  return `${shortTitle} — ${siteConfig.name}`;
}

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
}: CreatePageMetadataOptions): Metadata {
  const canonicalPath = path ?? "/";
  const fullTitle = formatFullTitle(title);
  const isHome = canonicalPath === "/";

  return {
    title: isHome ? { absolute: fullTitle.replace(" - ", " — ") } : stripBrandSuffix(title),
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: fullTitle.replace(" - ", " — "),
      description,
      url: canonicalPath,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: defaultOpenGraphImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${siteConfig.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle.replace(" - ", " — "),
      description,
      images: [defaultOpenGraphImage],
    },
  };
}

export function createAppPageMetadata(title: string, description?: string): Metadata {
  return description ? { title, description } : { title };
}

export const rootMetadata: Metadata = {
  metadataBase,
  title: {
    default: defaultTitle,
    template: titleTemplate,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: defaultOpenGraphImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteConfig.description,
    images: [defaultOpenGraphImage],
  },
};
