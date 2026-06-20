import type { MetadataRoute } from "next";

import { blogPosts } from "@/lib/marketing/blog";
import { getAllDocSlugs } from "@/lib/marketing/docs";
import { siteConfig } from "@/lib/marketing/site-config";

const staticRoutes = [
  "/",
  "/features",
  "/pricing",
  "/docs",
  "/blog",
  "/changelog",
  "/privacy",
  "/terms",
  "/cookies",
];

function docPath(slug: string[]): string {
  return slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const docEntries: MetadataRoute.Sitemap = getAllDocSlugs()
    .filter((slug) => slug.length > 0)
    .map((slug) => ({
      url: `${baseUrl}${docPath(slug)}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...docEntries, ...blogEntries];
}
