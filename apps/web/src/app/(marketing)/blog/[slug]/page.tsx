import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/marketing/docs/code-block";
import { BlogCard } from "@/components/marketing/blog/blog-card";
import {
  getBlogPost,
  getRelatedPosts,
  type BlogSection,
} from "@/lib/marketing/blog";
import { createPageMetadata } from "@/lib/marketing/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { blogPosts } = await import("@/lib/marketing/blog");
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Not found" };
  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
  });
}

function BlogContent({ sections }: { sections: BlogSection[] }) {
  return (
    <div className="prose-marketing">
      {sections.map((section, i) => {
        switch (section.type) {
          case "paragraph":
            return <p key={i}>{section.text}</p>;
          case "heading":
            return (
              <h2 key={i} id={section.id}>
                {section.text}
              </h2>
            );
          case "list":
            return (
              <ul key={i}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "code":
            return (
              <CodeBlock key={i} code={section.code} language={section.language} />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function BlogToc({ sections }: { sections: BlogSection[] }) {
  const headings = sections.filter((s) => s.type === "heading");
  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-24">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-marketing-subtle">
          On this page
        </p>
        <ul className="space-y-2 border-l border-marketing-border pl-3">
          {headings.map((h) =>
            h.type === "heading" ? (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className="block text-[13px] text-marketing-muted hover:text-foreground"
                >
                  {h.text}
                </a>
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </nav>
  );
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug);

  return (
    <article className="py-16 sm:py-24">
      <div className="marketing-container">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] text-marketing-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to blog
        </Link>

        <header className="mt-8 max-w-3xl">
          <Badge variant="outline" className="mb-4 border-marketing-border">
            {post.category}
          </Badge>
          <h1 className="marketing-heading text-[2.5rem] leading-tight sm:text-[3.5rem]">
            {post.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-marketing-muted">
            {post.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-marketing-subtle">
            <span className="font-medium text-foreground">{post.author.name}</span>
            <span>{post.author.role}</span>
            <span>·</span>
            <span>{post.publishedAt}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {post.readingTime}
            </span>
          </div>
        </header>

        <div className="marketing-media relative mt-10 aspect-video max-h-[480px] border border-marketing-border">
          <Image
            src={post.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1120px) 100vw, 1120px"
            priority
          />
        </div>
      </div>

      <div className="marketing-container mt-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_200px] xl:grid-cols-[1fr_minmax(0,750px)_200px]">
          <div className="hidden xl:block" />
          <div className="marketing-container !px-0 min-w-0">
            <BlogContent sections={post.content} />
          </div>
          <BlogToc sections={post.content} />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-24 border-t border-marketing-border pt-16">
          <div className="marketing-container">
            <h2 className="text-[20px] font-semibold">Related articles</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
