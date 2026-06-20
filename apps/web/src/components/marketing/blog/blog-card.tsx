"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

import { MotionCard } from "@/components/marketing/motion/motion-card";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { BlogPost } from "@/lib/marketing/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  const reduced = useReducedMotion();

  return (
    <MotionCard className="group flex h-full flex-col rounded-2xl border border-marketing-border bg-marketing-surface p-6 transition-colors hover:border-marketing-border-strong">
      <div className="mb-4 flex items-center gap-3">
        <Badge variant="outline" className="border-marketing-border">
          {post.category}
        </Badge>
        <span className="flex items-center gap-1 text-[12px] text-marketing-subtle">
          <Clock className="size-3" />
          {post.readingTime}
        </span>
      </div>
      <h2 className="text-[18px] font-semibold leading-snug text-foreground group-hover:text-primary">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-marketing-muted">
        {post.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-marketing-border pt-4">
        <div>
          <p className="text-[13px] font-medium">{post.author.name}</p>
          <p className="text-[12px] text-marketing-subtle">{post.author.role}</p>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-primary transition-opacity hover:opacity-80"
        >
          Read
          <motion.span animate={reduced ? undefined : { x: 0 }} whileHover={reduced ? undefined : { x: 3 }}>
            <ArrowRight className="size-3.5" />
          </motion.span>
        </Link>
      </div>
    </MotionCard>
  );
}

export function FeaturedBlogCard({ post }: { post: BlogPost }) {
  const reduced = useReducedMotion();

  return (
    <MotionCard className="group relative overflow-hidden rounded-2xl border border-marketing-border bg-marketing-surface p-8 sm:p-10">
      <div className="marketing-glow pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        <Badge className="mb-4">Featured</Badge>
        <h2 className="marketing-heading max-w-2xl text-[2rem] sm:text-[2.5rem]">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-marketing-muted">
          {post.excerpt}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-marketing-subtle">
          <span>{post.author.name}</span>
          <span>·</span>
          <span>{post.publishedAt}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-primary"
        >
          Read article
          <motion.span whileHover={reduced ? undefined : { x: 3 }}>
            <ArrowRight className="size-4" />
          </motion.span>
        </Link>
      </div>
    </MotionCard>
  );
}
