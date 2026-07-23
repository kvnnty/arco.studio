"use client";

import Image from "next/image";
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
    <MotionCard className="group flex h-full flex-col overflow-hidden rounded-(--marketing-radius) border border-marketing-border bg-marketing-elevated transition-colors hover:border-marketing-border-strong">
      <Link href={`/blog/${post.slug}`} className="relative aspect-16/10 overflow-hidden">
        <Image
          src={post.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <Badge variant="outline" className="border-marketing-border">
            {post.category}
          </Badge>
          <span className="flex items-center gap-1 text-[12px] text-marketing-subtle">
            <Clock className="size-3" />
            {post.readingTime}
          </span>
        </div>
        <h2 className="text-[17px] font-semibold leading-snug text-foreground">
          <Link href={`/blog/${post.slug}`} className="hover:opacity-80">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-[14px] leading-relaxed text-marketing-muted">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-marketing-border pt-4">
          <p className="text-[13px] font-medium">{post.author.name}</p>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-foreground transition-opacity hover:opacity-70"
          >
            Read
            <motion.span
              animate={reduced ? undefined : { x: 0 }}
              whileHover={reduced ? undefined : { x: 3 }}
            >
              <ArrowRight className="size-3.5" />
            </motion.span>
          </Link>
        </div>
      </div>
    </MotionCard>
  );
}

export function FeaturedBlogCard({ post }: { post: BlogPost }) {
  const reduced = useReducedMotion();

  return (
    <MotionCard className="group relative overflow-hidden rounded-(--marketing-radius-lg) border border-marketing-border bg-marketing-elevated">
      <div className="grid lg:grid-cols-2">
        <Link
          href={`/blog/${post.slug}`}
          className="relative aspect-16/10 overflow-hidden lg:aspect-auto lg:min-h-[320px]"
        >
          <Image
            src={post.coverImage}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 560px"
            priority
          />
        </Link>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <Badge className="mb-4 w-fit">Featured</Badge>
          <h2 className="marketing-title-card max-w-xl">
            <Link href={`/blog/${post.slug}`} className="hover:opacity-80">
              {post.title}
            </Link>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-marketing-muted">
            {post.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-marketing-subtle">
            <span>{post.author.name}</span>
            <span>·</span>
            <span>{post.publishedAt}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-foreground"
          >
            Read article
            <motion.span whileHover={reduced ? undefined : { x: 3 }}>
              <ArrowRight className="size-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </MotionCard>
  );
}
