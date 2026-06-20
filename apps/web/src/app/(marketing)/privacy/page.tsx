import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { getLegalDocument } from "@/lib/marketing/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Arco",
  description: "How Arco collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const document = getLegalDocument("privacy");
  if (!document) notFound();
  return <LegalPageLayout document={document} />;
}
