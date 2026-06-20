"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { BlogPost } from "@/lib/marketing/blog";

import { BlogCard, FeaturedBlogCard } from "./blog-card";

type BlogIndexProps = {
  posts: BlogPost[];
};

export function BlogIndex({ posts }: BlogIndexProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category))],
    [posts],
  );

  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  const filtered = useMemo(() => {
    return rest.filter((post) => {
      const matchesQuery =
        !query.trim() ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || post.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [rest, query, category]);

  return (
    <div className="py-16 sm:py-24">
      <div className="marketing-container">
        <header className="max-w-2xl">
          <h1 className="marketing-heading text-[2.5rem] sm:text-[3.5rem]">Blog</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--marketing-muted)]">
            Product updates, growth insights, and engineering notes from the Arco team.
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--marketing-subtle)]" />
            <input
              type="search"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--marketing-border)] bg-[var(--marketing-surface)] pr-3 pl-9 text-[14px] outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                !category
                  ? "bg-primary text-primary-foreground"
                  : "border border-[var(--marketing-border)] text-[var(--marketing-muted)] hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-[var(--marketing-border)] text-[var(--marketing-muted)] hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {featured && !query && !category ? (
          <div className="mt-12">
            <FeaturedBlogCard post={featured} />
          </div>
        ) : null}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-[15px] text-[var(--marketing-muted)]">
            No articles match your search.
          </p>
        ) : null}
      </div>
    </div>
  );
}
