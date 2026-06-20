import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/marketing/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/editor", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
