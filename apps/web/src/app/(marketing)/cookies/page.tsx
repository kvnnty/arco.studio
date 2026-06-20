import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { getLegalDocument } from "@/lib/marketing/legal";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy",
  description: "How Arco uses cookies and similar technologies.",
  path: "/cookies",
});

export default function CookiesPage() {
  const document = getLegalDocument("cookies");
  if (!document) notFound();
  return <LegalPageLayout document={document} />;
}
