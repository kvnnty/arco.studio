import type { Metadata } from "next";

import { BlogIndex } from "@/components/marketing/blog/blog-index";
import { blogPosts } from "@/lib/marketing/blog";

export const metadata: Metadata = {
  title: "Blog — Arco",
  description: "Product updates, growth insights, and engineering notes from the Arco team.",
};

export default function BlogPage() {
  return <BlogIndex posts={blogPosts} />;
}
