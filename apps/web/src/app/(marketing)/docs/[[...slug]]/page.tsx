import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  DocContent,
  DocPagination,
  DocToc,
} from "@/components/marketing/docs/doc-content";
import { DocsSidebar } from "@/components/marketing/docs/docs-sidebar";
import { getAllDocSlugs, getDocPage } from "@/lib/marketing/docs";
import { createPageMetadata } from "@/lib/marketing/metadata";

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({
    slug: slug.length === 0 ? [] : slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = getDocPage(slug);
  if (!page) return { title: "Not found" };
  const path = slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;
  return createPageMetadata({
    title: page.title,
    description: page.description,
    path,
  });
}

export default async function DocsPage({ params }: Props) {
  const { slug = [] } = await params;
  const page = getDocPage(slug);
  if (!page) notFound();

  return (
    <div className="py-12 sm:py-16">
      <div className="marketing-container">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <DocsSidebar />

          <div className="min-w-0 flex-1 lg:max-w-[720px]">
            <header className="mb-10 border-b border-[var(--marketing-border)] pb-8">
              <h1 className="marketing-heading text-[2rem] sm:text-[2.5rem]">
                {page.title}
              </h1>
              <p className="mt-3 text-[16px] text-[var(--marketing-muted)]">
                {page.description}
              </p>
            </header>

            <DocContent sections={page.sections} />
            <DocPagination page={page} />
          </div>

          <div className="hidden w-48 shrink-0 xl:block">
            <DocToc sections={page.sections} />
          </div>
        </div>
      </div>
    </div>
  );
}
