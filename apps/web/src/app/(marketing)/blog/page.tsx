import type { Metadata } from "next";

import { BlogIndex } from "@/components/marketing/blog/blog-index";
import { blogPosts } from "@/lib/marketing/blog";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Blog",
  description:
    "Product updates, growth insights, and engineering notes from the Arco team.",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndex posts={blogPosts} />;
}
