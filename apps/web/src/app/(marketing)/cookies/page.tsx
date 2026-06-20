import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { getLegalDocument } from "@/lib/marketing/legal";

export const metadata: Metadata = {
  title: "Cookie Policy — Arco",
  description: "How Arco uses cookies and similar technologies.",
};

export default function CookiesPage() {
  const document = getLegalDocument("cookies");
  if (!document) notFound();
  return <LegalPageLayout document={document} />;
}
