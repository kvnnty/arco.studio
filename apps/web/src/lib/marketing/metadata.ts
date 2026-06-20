import type { Metadata } from "next";

import { siteConfig } from "@/lib/marketing/site-config";

export const metadataBase = new URL(siteConfig.url);

const defaultOpenGraphImage = "/opengraph-image";

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
  const fullTitle =
    title === siteConfig.name || title.startsWith(`${siteConfig.name} —`)
      ? title
      : `${title} — ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: fullTitle,
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
      title: fullTitle,
      description,
      images: [defaultOpenGraphImage],
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase,
  ...createPageMetadata({
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    path: "/",
  }),
};
