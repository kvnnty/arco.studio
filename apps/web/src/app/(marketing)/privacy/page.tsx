import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { getLegalDocument } from "@/lib/marketing/legal";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How Arco collects, uses, and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const document = getLegalDocument("privacy");
  if (!document) notFound();
  return <LegalPageLayout document={document} />;
}
